import { broadcastState } from './state-broadcaster';
import {
  addFocusSession,
  generateId,
  getAnalytics,
  getChatHistory,
  getFullState,
  getGoals,
  getNotes,
  getReminders,
  getSettings,
  getTimer,
  saveAnalytics,
  saveChatHistory,
  saveGoals,
  saveNotes,
  saveReminders,
  saveSettings,
  saveTimer,
} from '../services/storage';
import {
  chat,
  executeAction,
  getProductivitySuggestions,
  summarizePage,
  summarizeYouTube,
} from '../services/ai';
import { scheduleReminderNotification, showNotification } from '../services/notifications';
import { AIActionSchema } from '../schemas';
import { MessageTypes } from '../lib/messages';
import type { AIAction, ChatMessage, DailyGoal, Note, PageAnalytics, Reminder, TimerState } from '../types';

export async function handleRuntimeMessage(
  message: { type: string; payload?: unknown },
): Promise<unknown> {
  switch (message.type) {
    case MessageTypes.GET_STATE:
      return getFullState();

    case MessageTypes.UPDATE_SETTINGS: {
      const settings = await saveSettings(message.payload as Parameters<typeof saveSettings>[0]);
      await broadcastState();
      return settings;
    }

    case MessageTypes.AI_CHAT: {
      const { messages, userMessage } = message.payload as {
        messages: ChatMessage[];
        userMessage: string;
      };
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      };
      const history = [...messages, userMsg];
      const reply = await chat(history);
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      const updated = [...history, assistantMsg];
      await saveChatHistory(updated);
      await broadcastState();
      return { messages: updated, reply };
    }

    case MessageTypes.AI_ACTION: {
      const action = AIActionSchema.parse(message.payload) as AIAction;
      return executeAction(action);
    }

    case MessageTypes.SUMMARIZE_PAGE: {
      const { title, content } = message.payload as { title: string; content: string };
      return summarizePage(title, content);
    }

    case MessageTypes.SUMMARIZE_YOUTUBE: {
      const { title, description } = message.payload as { title: string; description: string };
      return summarizeYouTube(title, description);
    }

    case MessageTypes.ADD_NOTE: {
      const { title, content, tags } = message.payload as {
        title: string;
        content: string;
        tags?: string[];
      };
      const notes = await getNotes();
      const note: Note = {
        id: generateId(),
        title: title || 'Untitled',
        content,
        tags: tags ?? [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
      };
      await saveNotes([note, ...notes]);
      await broadcastState();
      return note;
    }

    case MessageTypes.UPDATE_NOTE: {
      const updated = message.payload as Note;
      const notes = await getNotes();
      await saveNotes(notes.map((n) => (n.id === updated.id ? { ...updated, updatedAt: Date.now() } : n)));
      await broadcastState();
      return updated;
    }

    case MessageTypes.DELETE_NOTE: {
      const { id } = message.payload as { id: string };
      const notes = await getNotes();
      await saveNotes(notes.filter((n) => n.id !== id));
      await broadcastState();
      return { ok: true };
    }

    case MessageTypes.ADD_GOAL: {
      const { text } = message.payload as { text: string };
      const goals = await getGoals();
      const goal: DailyGoal = {
        id: generateId(),
        text,
        completed: false,
        createdAt: Date.now(),
      };
      await saveGoals([...goals, goal]);
      await broadcastState();
      return goal;
    }

    case MessageTypes.TOGGLE_GOAL: {
      const { id } = message.payload as { id: string };
      const goals = await getGoals();
      const updated = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      await saveGoals(updated);
      await broadcastState();
      return updated;
    }

    case MessageTypes.DELETE_GOAL: {
      const { id } = message.payload as { id: string };
      const goals = await getGoals();
      await saveGoals(goals.filter((g) => g.id !== id));
      await broadcastState();
      return { ok: true };
    }

    case MessageTypes.UPDATE_TIMER: {
      const timer = message.payload as TimerState;
      await saveTimer(timer);

      if (timer.remaining === 0 && timer.isRunning) {
        const settings = await getSettings();
        const type = timer.isBreak ? 'break' : 'focus';
        await addFocusSession({
          id: generateId(),
          duration: timer.isBreak ? settings.breakDuration : settings.focusDuration,
          completedAt: Date.now(),
          type,
        });
        await showNotification(
          timer.isBreak ? 'Break Complete!' : 'Focus Session Complete!',
          timer.isBreak
            ? 'Time to get back to work. You\'ve got this.'
            : 'Great job! Take a well-deserved break.',
          { requireInteraction: true },
        );
      }

      await broadcastState();
      return timer;
    }

    case MessageTypes.ADD_REMINDER: {
      const { title, body, scheduledAt } = message.payload as {
        title: string;
        body: string;
        scheduledAt: number;
      };
      const reminders = await getReminders();
      const reminder: Reminder = {
        id: generateId(),
        title,
        body,
        scheduledAt,
        completed: false,
      };
      await saveReminders([...reminders, reminder]);
      await scheduleReminderNotification(reminder.id, title, body, scheduledAt);
      await broadcastState();
      return reminder;
    }

    case MessageTypes.TRACK_ANALYTICS: {
      const { domain, duration } = message.payload as { domain: string; duration: number };
      const analytics = await getAnalytics();
      const existing = analytics.find((a) => a.domain === domain);
      let updated: PageAnalytics[];
      if (existing) {
        updated = analytics.map((a) =>
          a.domain === domain
            ? { ...a, totalTime: a.totalTime + duration, visits: a.visits + 1, lastVisit: Date.now() }
            : a,
        );
      } else {
        updated = [...analytics, { domain, totalTime: duration, visits: 1, lastVisit: Date.now() }];
      }
      await saveAnalytics(updated.slice(-200));
      return updated;
    }

    case MessageTypes.GET_ANALYTICS:
      return getAnalytics();

  case MessageTypes.OPEN_SIDEPANEL: {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
    return { ok: true };
  }

    case 'MX_GET_SUGGESTIONS': {
      const state = await getFullState();
      const goalTexts = state.goals.map((g) => g.text);
      const topSites = state.analytics
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 5)
        .map((a) => `${a.domain} (${Math.round(a.totalTime / 60)}min)`)
        .join(', ');
      return getProductivitySuggestions(goalTexts, topSites || 'no data yet');
    }

    default:
      return null;
  }
}

export async function setupContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: 'mx-summarize',
    title: 'Momentum X: Summarize selection',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'mx-rewrite',
    title: 'Momentum X: Rewrite selection',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'mx-explain',
    title: 'Momentum X: Explain selection',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({ id: 'mx-sep', type: 'separator', contexts: ['page'] });
  chrome.contextMenus.create({
    id: 'mx-summarize-page',
    title: 'Momentum X: Summarize this page',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id: 'mx-open-sidebar',
    title: 'Momentum X: Open AI Assistant',
    contexts: ['page'],
  });
}

export async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab,
): Promise<void> {
  const selection = info.selectionText ?? '';

  if (info.menuItemId === 'mx-open-sidebar' && tab?.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
    return;
  }

  if (info.menuItemId === 'mx-summarize-page' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'MX_TRIGGER_PAGE_SUMMARY' });
    return;
  }

  if (!selection) return;

  const actionMap: Record<string, AIAction['type']> = {
    'mx-summarize': 'summarize',
    'mx-rewrite': 'rewrite',
    'mx-explain': 'explain',
  };

  const actionType = actionMap[info.menuItemId as string];
  if (!actionType) return;

  try {
    const result = await executeAction({ type: actionType, input: selection });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'MX_SHOW_AI_RESULT',
        payload: { title: actionType, content: result },
      });
    }
  } catch (error) {
    await showNotification(
      'Momentum X AI Error',
      error instanceof Error ? error.message : 'Action failed',
    );
  }
}
