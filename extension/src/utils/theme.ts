/**
 * Theme utilities — resolves dark mode preference and applies it to the document.
 */

import type { UserPreferences } from '@/types';

export type DarkModeSetting = UserPreferences['darkMode'];

/** Resolve whether dark mode should be active for a given setting */
export function isDarkModeActive(setting: DarkModeSetting): boolean {
  if (setting === 'dark') return true;
  if (setting === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Apply dark class to document root; returns resolved dark state */
export function applyDocumentTheme(setting: DarkModeSetting): boolean {
  const dark = isDarkModeActive(setting);
  document.documentElement.classList.toggle('dark', dark);
  return dark;
}

/** Flip between light and dark based on the current resolved appearance */
export function toggleDarkModeSetting(current: DarkModeSetting): DarkModeSetting {
  return isDarkModeActive(current) ? 'light' : 'dark';
}

export function darkModeLabel(setting: DarkModeSetting, isDark: boolean): string {
  if (setting === 'system') return `System (${isDark ? 'dark' : 'light'})`;
  return isDark ? 'Dark' : 'Light';
}

/** Read dark mode setting from Chrome storage (for content scripts / panel) */
export async function loadDarkModeSetting(): Promise<DarkModeSetting> {
  const result = await chrome.storage.sync.get('preferences');
  const prefs = result.preferences as UserPreferences | undefined;
  return prefs?.darkMode ?? 'system';
}

/** Persist a new dark mode setting */
export async function saveDarkModeSetting(setting: DarkModeSetting): Promise<void> {
  const result = await chrome.storage.sync.get('preferences');
  const prefs = (result.preferences as UserPreferences | undefined) ?? {
    apiKey: '',
    features: {
      summarization: true,
      priority: true,
      meetingExtractor: true,
      followUp: true,
      smartReply: true,
      sentiment: true,
      snooze: true,
      weeklyDigest: true,
    },
    summaryLength: 'brief' as const,
    weeklyDigestDay: 0,
    weeklyDigestHour: 9,
    weeklyDigestMinute: 0,
    excludedSenders: [],
    darkMode: 'system' as const,
    shortcuts: {
      summarize: 'Alt+S',
      togglePanel: 'Alt+P',
      smartReply: 'Alt+R',
      quickSnooze: 'Alt+Z',
    },
  };
  await chrome.storage.sync.set({ preferences: { ...prefs, darkMode: setting } });
}

/** Toggle dark mode in storage and return the new setting */
export async function toggleStoredDarkMode(): Promise<DarkModeSetting> {
  const current = await loadDarkModeSetting();
  const next = toggleDarkModeSetting(current);
  await saveDarkModeSetting(next);
  return next;
}
