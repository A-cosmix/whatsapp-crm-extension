/**
 * Background service worker — handles API calls, alarms, notifications,
 * context menus, and message routing between content scripts and popup.
 */

import {
  analyzeEmail,
  generateWeeklyDigestText,
  getApiUsage,
  getPreferences,
  savePreferences,
  validateApiKey,
} from '@/utils/api';
import {
  cacheAnalysis,
  deleteSnooze,
  getAllAnalyses,
  getAnalysesForWeek,
  getCachedAnalysis,
  getDueSnoozes,
  getSnooze,
  purgeExpiredCache,
  saveDigest,
  saveSnooze,
  searchAnalyses,
} from '@/utils/storage';
import {
  getOnboardingState,
  resetOnboarding,
  saveOnboardingState,
} from '@/utils/onboarding';
import type {
  AnalyzeEmailPayload,
  EmailAnalysis,
  ExtensionMessage,
  SnoozePayload,
  SnoozeReminder,
  UserPreferences,
  WeeklyDigest,
} from '@/types';

const LOG_PREFIX = '[EmailSummarizer]';

function log(...args: unknown[]): void {
  console.log(LOG_PREFIX, ...args);
}

// ─── Context menus ───────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  log('Extension installed — setting up context menus and alarms');

  // Show onboarding on first install (state defaults to popupCompleted: false)
  getOnboardingState().then((state) => {
    if (!state.popupCompleted) log('First install — onboarding will show on popup open');
  });

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'snooze-parent',
      title: 'Snooze until...',
      contexts: ['page'],
      documentUrlPatterns: ['https://mail.google.com/*', 'https://outlook.live.com/*'],
    });

    const options = [
      { id: 'snooze-1h', title: '1 hour', ms: 60 * 60 * 1000 },
      { id: 'snooze-4h', title: '4 hours', ms: 4 * 60 * 60 * 1000 },
      { id: 'snooze-1d', title: '1 day', ms: 24 * 60 * 60 * 1000 },
      { id: 'snooze-3d', title: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
      { id: 'snooze-1w', title: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
    ];

    for (const opt of options) {
      chrome.contextMenus.create({
        id: opt.id,
        parentId: 'snooze-parent',
        title: opt.title,
        contexts: ['page'],
      });
    }
  });

  setupWeeklyDigestAlarm();
  purgeExpiredCache().then((n) => log(`Purged ${n} expired cache entries`));
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  const snoozeMap: Record<string, number> = {
    'snooze-1h': 60 * 60 * 1000,
    'snooze-4h': 4 * 60 * 60 * 1000,
    'snooze-1d': 24 * 60 * 60 * 1000,
    'snooze-3d': 3 * 24 * 60 * 60 * 1000,
    'snooze-1w': 7 * 24 * 60 * 60 * 1000,
  };

  const durationMs = snoozeMap[info.menuItemId as string];
  if (!durationMs) return;

  chrome.tabs.sendMessage(tab.id, {
    type: 'CONTEXT_SNOOZE',
    payload: { durationMs },
  });
});

// ─── Keyboard shortcut ───────────────────────────────────────────────────────

chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab?.id) return;

  const messageMap: Record<string, string> = {
    'summarize-email': 'SHORTCUT_SUMMARIZE',
    'toggle-panel': 'SHORTCUT_TOGGLE_PANEL',
    'smart-reply': 'SHORTCUT_SMART_REPLY',
    'quick-snooze': 'SHORTCUT_QUICK_SNOOZE',
  };

  const type = messageMap[command];
  if (type) {
    chrome.tabs.sendMessage(tab.id, { type });
  }
});

// ─── Alarms ──────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  log('Alarm fired:', alarm.name);

  if (alarm.name.startsWith('snooze_')) {
    const snoozeId = alarm.name.replace('snooze_', '');
    await handleSnoozeDue(snoozeId);
  } else if (alarm.name === 'weekly_digest') {
    await handleWeeklyDigest();
  } else if (alarm.name === 'cache_cleanup') {
    await purgeExpiredCache();
  }
});

async function handleSnoozeDue(snoozeId: string): Promise<void> {
  const snooze = await getSnooze(snoozeId);
  if (!snooze) return;

  await chrome.notifications.create(`snooze_${snoozeId}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('public/icons/128.png'),
    title: 'Snoozed email is back',
    message: `${snooze.subject} from ${snooze.sender}`,
    priority: 2,
  });

  await deleteSnooze(snoozeId);
  log('Snooze resurfaced:', snooze.subject);
}

async function handleWeeklyDigest(): Promise<void> {
  const prefs = await getPreferences();
  if (!prefs.features.weeklyDigest || !prefs.apiKey) return;

  const now = Date.now();
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;
  const emails = await getAnalysesForWeek(weekStart, now);

  if (emails.length === 0) {
    log('No emails for weekly digest');
    return;
  }

  try {
    const digestText = await generateWeeklyDigestText(prefs.apiKey, emails);

    const importantEmails = emails
      .filter((e) => e.priority === 'Important')
      .slice(0, 10)
      .map((e) => ({
        subject: e.subject,
        sender: e.sender,
        summary: e.summary,
        priority: e.priority,
      }));

    const senderCounts = new Map<string, number>();
    for (const e of emails) {
      senderCounts.set(e.sender, (senderCounts.get(e.sender) ?? 0) + 1);
    }
    const topSenders = [...senderCounts.entries()]
      .map(([sender, count]) => ({ sender, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const actionItems = emails
      .filter((e) => e.needsFollowUp)
      .map((e) => `Reply to ${e.sender}: ${e.subject}`);

    const digest: WeeklyDigest = {
      generatedAt: now,
      weekStart,
      weekEnd: now,
      importantEmails,
      topSenders,
      actionItems,
      totalEmails: emails.length,
      digestText,
    };

    await saveDigest(digest);

    await chrome.notifications.create('weekly_digest', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/icons/128.png'),
      title: 'Weekly Email Digest Ready',
      message: `${emails.length} emails summarized. Click to view.`,
      priority: 1,
    });

    await chrome.storage.local.set({ pendingDigest: digest });
    log('Weekly digest generated');
  } catch (err) {
    log('Weekly digest failed:', err);
  }
}

export async function setupWeeklyDigestAlarm(): Promise<void> {
  const prefs = await getPreferences();
  const { weeklyDigestDay, weeklyDigestHour, weeklyDigestMinute } = prefs;

  const now = new Date();
  const next = new Date();
  next.setHours(weeklyDigestHour, weeklyDigestMinute, 0, 0);

  const dayDiff = (weeklyDigestDay - now.getDay() + 7) % 7;
  if (dayDiff === 0 && next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + dayDiff);
  }

  const delayMinutes = Math.max(1, (next.getTime() - now.getTime()) / 60_000);
  chrome.alarms.create('weekly_digest', { delayInMinutes: delayMinutes, periodInMinutes: 7 * 24 * 60 });
  chrome.alarms.create('cache_cleanup', { periodInMinutes: 24 * 60 });

  log(`Weekly digest alarm set for ${next.toISOString()}`);
}

// ─── Message handler ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ success: true, data: result }))
    .catch((err) =>
      sendResponse({
        success: false,
        error: err?.message ?? 'An unexpected error occurred.',
        code: err?.code,
      }),
    );
  return true;
});

async function handleMessage(message: ExtensionMessage): Promise<unknown> {
  switch (message.type) {
    case 'ANALYZE_EMAIL':
      return handleAnalyzeEmail(message.payload as AnalyzeEmailPayload);

    case 'GET_CACHED_ANALYSIS': {
      const { emailId } = message.payload as { emailId: string };
      return getCachedAnalysis(emailId);
    }

    case 'VALIDATE_API_KEY': {
      const { apiKey } = message.payload as { apiKey: string };
      return validateApiKey(apiKey);
    }

    case 'GET_PREFERENCES':
      return getPreferences();

    case 'SAVE_PREFERENCES': {
      const prefs = message.payload as UserPreferences;
      await savePreferences(prefs);
      await setupWeeklyDigestAlarm();
      return prefs;
    }

    case 'SNOOZE_EMAIL':
      return handleSnooze(message.payload as SnoozePayload);

    case 'GET_SNOOZED':
      return getDueSnoozes();

    case 'CANCEL_SNOOZE': {
      const { id } = message.payload as { id: string };
      await deleteSnooze(id);
      await chrome.alarms.clear(`snooze_${id}`);
      return true;
    }

    case 'GENERATE_WEEKLY_DIGEST':
      await handleWeeklyDigest();
      return chrome.storage.local.get('pendingDigest');

    case 'GET_API_USAGE':
      return getApiUsage();

    case 'SEARCH_SUMMARIES': {
      const { query } = message.payload as { query: string };
      return searchAnalyses(query);
    }

    case 'GET_ALL_ANALYSES':
      return getAllAnalyses();

    case 'GET_ONBOARDING':
      return getOnboardingState();

    case 'SAVE_ONBOARDING': {
      const state = message.payload as import('@/types').OnboardingState;
      await saveOnboardingState(state);
      return state;
    }

    case 'RESET_ONBOARDING':
      return resetOnboarding();

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

async function handleAnalyzeEmail(payload: AnalyzeEmailPayload): Promise<EmailAnalysis> {
  const { email, forceRefresh } = payload;
  const prefs = await getPreferences();

  if (!prefs.apiKey) {
    throw { code: 'INVALID_KEY', message: 'Please add your API key in extension settings.' };
  }

  const isExcluded = prefs.excludedSenders.some(
    (s) =>
      email.senderEmail.toLowerCase().includes(s.toLowerCase()) ||
      email.sender.toLowerCase().includes(s.toLowerCase()),
  );
  if (isExcluded) {
    return {
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      summary: ['Sender is in excluded list.'],
      priority: 'Low Priority',
      sentiment: 'Neutral',
      needsFollowUp: false,
      analyzedAt: Date.now(),
      bodyHash: '',
      platform: email.platform,
    };
  }

  if (!forceRefresh) {
    const cached = await getCachedAnalysis(email.id);
    if (cached) {
      log('Returning cached analysis for', email.id);
      return cached;
    }
  }

  const analysis = await analyzeEmail(email, prefs);
  await cacheAnalysis(analysis);
  log('Analyzed email:', email.subject);
  return analysis;
}

async function handleSnooze(payload: SnoozePayload): Promise<SnoozeReminder> {
  const reminder: SnoozeReminder = {
    id: `snooze_${payload.emailId}_${Date.now()}`,
    emailId: payload.emailId,
    subject: payload.subject,
    sender: payload.sender,
    snoozedAt: Date.now(),
    resurfaceAt: Date.now() + payload.durationMs,
    platform: payload.platform,
  };

  await saveSnooze(reminder);
  chrome.alarms.create(`snooze_${reminder.id}`, {
    when: reminder.resurfaceAt,
  });

  log('Snoozed email until', new Date(reminder.resurfaceAt).toISOString());
  return reminder;
}

// Re-register alarms on service worker startup
setupWeeklyDigestAlarm();
purgeExpiredCache();

log('Service worker started');
