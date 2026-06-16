import type { ExtensionState } from '../lib/messages';
import {
  DEFAULT_SETTINGS,
  DEFAULT_TIMER,
  type AppSettings,
  type ChatMessage,
  type DailyGoal,
  type FocusSession,
  type Note,
  type PageAnalytics,
  type Reminder,
  type TimerState,
} from '../types';

const KEYS = {
  settings: 'mx_settings',
  notes: 'mx_notes',
  goals: 'mx_goals',
  focusSessions: 'mx_focus_sessions',
  timer: 'mx_timer',
  chatHistory: 'mx_chat_history',
  reminders: 'mx_reminders',
  analytics: 'mx_analytics',
} as const;

async function getLocal<T>(key: string, fallback: T): Promise<T> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? fallback;
}

async function setLocal(key: string, value: unknown): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

async function getSync<T>(key: string, fallback: T): Promise<T> {
  const result = await chrome.storage.sync.get(key);
  return (result[key] as T) ?? fallback;
}

async function setSync(key: string, value: unknown): Promise<void> {
  await chrome.storage.sync.set({ [key]: value });
}

export async function getSettings(): Promise<AppSettings> {
  const sync = await getSync<Partial<AppSettings>>(KEYS.settings, {});
  const local = await getLocal<Partial<AppSettings>>(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...sync, ...local };
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await setSync(KEYS.settings, {
    theme: updated.theme,
    accent: updated.accent,
    onboardingComplete: updated.onboardingComplete,
    floatingAssistant: updated.floatingAssistant,
    voiceEnabled: updated.voiceEnabled,
    notificationsEnabled: updated.notificationsEnabled,
    dailyGoalTarget: updated.dailyGoalTarget,
    focusDuration: updated.focusDuration,
    breakDuration: updated.breakDuration,
    model: updated.model,
  });
  await setLocal(KEYS.settings, {
    apiKey: updated.apiKey,
    apiBaseUrl: updated.apiBaseUrl,
    model: updated.model,
  });
  return updated;
}

export async function getNotes(): Promise<Note[]> {
  return getSync(KEYS.notes, []);
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await setSync(KEYS.notes, notes);
}

export async function getGoals(): Promise<DailyGoal[]> {
  const today = new Date().toDateString();
  const goals = await getSync<DailyGoal[]>(KEYS.goals, []);
  return goals.filter((g) => new Date(g.createdAt).toDateString() === today);
}

export async function saveGoals(goals: DailyGoal[]): Promise<void> {
  await setSync(KEYS.goals, goals);
}

export async function getTimer(): Promise<TimerState> {
  return getLocal(KEYS.timer, DEFAULT_TIMER);
}

export async function saveTimer(timer: TimerState): Promise<void> {
  await setLocal(KEYS.timer, timer);
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  return getLocal(KEYS.chatHistory, []);
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  const trimmed = messages.slice(-50);
  await setLocal(KEYS.chatHistory, trimmed);
}

export async function getReminders(): Promise<Reminder[]> {
  return getSync(KEYS.reminders, []);
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await setSync(KEYS.reminders, reminders);
}

export async function getAnalytics(): Promise<PageAnalytics[]> {
  return getLocal(KEYS.analytics, []);
}

export async function saveAnalytics(analytics: PageAnalytics[]): Promise<void> {
  await setLocal(KEYS.analytics, analytics);
}

export async function getFocusSessions(): Promise<FocusSession[]> {
  return getSync(KEYS.focusSessions, []);
}

export async function addFocusSession(session: FocusSession): Promise<void> {
  const sessions = await getFocusSessions();
  await setSync(KEYS.focusSessions, [...sessions, session].slice(-100));
}

export async function getFullState(): Promise<ExtensionState> {
  const [settings, notes, goals, timer, chatHistory, reminders, analytics] = await Promise.all([
    getSettings(),
    getNotes(),
    getGoals(),
    getTimer(),
    getChatHistory(),
    getReminders(),
    getAnalytics(),
  ]);
  return { settings, notes, goals, timer, chatHistory, reminders, analytics };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
