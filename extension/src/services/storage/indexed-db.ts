import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  ExplanationRecord,
  StudyNote,
  Bookmark,
  UserSettings,
  AnalyticsEvent,
  DailyLearningReport,
} from '@/types';
import { CACHE_TTL_DAYS } from '@/types';

interface ELWDatabase extends DBSchema {
  explanations: {
    key: string;
    value: ExplanationRecord;
    indexes: { 'by-timestamp': number };
  };
  notes: {
    key: string;
    value: StudyNote;
    indexes: { 'by-created': number };
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-created': number };
  };
  analytics: {
    key: string;
    value: AnalyticsEvent;
    indexes: { 'by-timestamp': number };
  };
  dailyReports: {
    key: string;
    value: DailyLearningReport;
  };
}

const DB_NAME = 'explain-like-whatsapp';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ELWDatabase>> | null = null;

function getDB(): Promise<IDBPDatabase<ELWDatabase>> {
  if (!dbPromise) {
    dbPromise = openDB<ELWDatabase>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const explanations = db.createObjectStore('explanations', { keyPath: 'id' });
        explanations.createIndex('by-timestamp', 'timestamp');

        const notes = db.createObjectStore('notes', { keyPath: 'id' });
        notes.createIndex('by-created', 'createdAt');

        const bookmarks = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bookmarks.createIndex('by-created', 'createdAt');

        const analytics = db.createObjectStore('analytics', { keyPath: 'name' });
        analytics.createIndex('by-timestamp', 'timestamp');

        db.createObjectStore('dailyReports', { keyPath: 'date' });
      },
    });
  }
  return dbPromise;
}

export async function cacheExplanation(record: ExplanationRecord): Promise<void> {
  const db = await getDB();
  await db.put('explanations', record);
}

export async function getCachedExplanation(id: string): Promise<ExplanationRecord | undefined> {
  const db = await getDB();
  const record = await db.get('explanations', id);
  if (!record) return undefined;

  const age = Date.now() - record.timestamp;
  const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  if (age > maxAge) {
    await db.delete('explanations', id);
    return undefined;
  }
  return record;
}

export async function getAllCachedExplanations(): Promise<ExplanationRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('explanations', 'by-timestamp');
}

export async function saveNote(note: StudyNote): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function getNotes(): Promise<StudyNote[]> {
  const db = await getDB();
  return db.getAllFromIndex('notes', 'by-created');
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const db = await getDB();
  await db.put('bookmarks', bookmark);
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDB();
  return db.getAllFromIndex('bookmarks', 'by-created');
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const db = await getDB();
  const key = `${event.name}_${event.timestamp}`;
  await db.put('analytics', { ...event, name: key });
}

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const db = await getDB();
  return db.getAllFromIndex('analytics', 'by-timestamp');
}

export async function saveDailyReport(report: DailyLearningReport): Promise<void> {
  const db = await getDB();
  await db.put('dailyReports', report);
}

export async function getDailyReport(date: string): Promise<DailyLearningReport | undefined> {
  const db = await getDB();
  return db.get('dailyReports', date);
}

export async function getAllDailyReports(): Promise<DailyLearningReport[]> {
  const db = await getDB();
  return db.getAll('dailyReports');
}

export async function clearExpiredCache(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('explanations');
  const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let deleted = 0;

  for (const record of all) {
    if (now - record.timestamp > maxAge) {
      await db.delete('explanations', record.id);
      deleted++;
    }
  }
  return deleted;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const stores = ['explanations', 'notes', 'bookmarks', 'analytics', 'dailyReports'] as const;
  for (const store of stores) {
    await db.clear(store);
  }
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const data = {
    explanations: await db.getAll('explanations'),
    notes: await db.getAll('notes'),
    bookmarks: await db.getAll('bookmarks'),
    dailyReports: await db.getAll('dailyReports'),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'whatsapp',
  language: 'en',
  shortcutEnabled: true,
  wordExplainerEnabled: true,
  focusModeEnabled: true,
  darkMode: false,
  readingFont: 'sans',
  focusTimerMinutes: 25,
  notificationsEnabled: true,
  analyticsEnabled: true,
};

export async function getSettings(): Promise<UserSettings> {
  const result = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(result.settings as Partial<UserSettings> | undefined) };
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...settings } });
}

export async function getLocalProfile(): Promise<Record<string, unknown> | null> {
  const result = await chrome.storage.local.get('userProfile');
  return (result.userProfile as Record<string, unknown>) || null;
}

export async function saveLocalProfile(profile: Record<string, unknown>): Promise<void> {
  await chrome.storage.local.set({ userProfile: profile });
}

export async function clearLocalProfile(): Promise<void> {
  await chrome.storage.local.remove('userProfile');
}
