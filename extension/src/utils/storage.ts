/**
 * IndexedDB wrapper for caching email analyses and snooze reminders.
 * Auto-deletes cache entries older than 30 days.
 */

import Dexie, { type Table } from 'dexie';
import type { AnalyticsEvent, EmailAnalysis, SnoozeReminder, WeeklyDigest } from '@/types';

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

class EmailSummarizerDB extends Dexie {
  analyses!: Table<EmailAnalysis, string>;
  snoozes!: Table<SnoozeReminder, string>;
  digests!: Table<WeeklyDigest, number>;
  analytics!: Table<AnalyticsEvent, number>;

  constructor() {
    super('EmailSummarizerDB');
    this.version(1).stores({
      analyses: 'id, sender, priority, analyzedAt, platform',
      snoozes: 'id, emailId, resurfaceAt, platform',
      digests: '++generatedAt',
    });
    this.version(2).stores({
      analyses: 'id, sender, priority, analyzedAt, platform',
      snoozes: 'id, emailId, resurfaceAt, platform',
      digests: '++generatedAt',
      analytics: '++id, feature, timestamp, platform',
    });
  }
}

export const db = new EmailSummarizerDB();

/** Remove analyses older than 30 days */
export async function purgeExpiredCache(): Promise<number> {
  const cutoff = Date.now() - CACHE_TTL_MS;
  const expired = await db.analyses.where('analyzedAt').below(cutoff).toArray();
  await db.analyses.where('analyzedAt').below(cutoff).delete();
  return expired.length;
}

export async function getCachedAnalysis(emailId: string): Promise<EmailAnalysis | undefined> {
  const cached = await db.analyses.get(emailId);
  if (!cached) return undefined;

  const age = Date.now() - cached.analyzedAt;
  if (age > CACHE_TTL_MS) {
    await db.analyses.delete(emailId);
    return undefined;
  }

  return cached;
}

export async function cacheAnalysis(analysis: EmailAnalysis): Promise<void> {
  await db.analyses.put(analysis);
}

export async function getAllAnalyses(): Promise<EmailAnalysis[]> {
  await purgeExpiredCache();
  return db.analyses.orderBy('analyzedAt').reverse().toArray();
}

export async function searchAnalyses(query: string): Promise<EmailAnalysis[]> {
  const lower = query.toLowerCase();
  const all = await getAllAnalyses();
  return all.filter(
    (a) =>
      a.subject.toLowerCase().includes(lower) ||
      a.sender.toLowerCase().includes(lower) ||
      a.summary.some((s) => s.toLowerCase().includes(lower)),
  );
}

export async function getAnalysesByPriority(priority: string): Promise<EmailAnalysis[]> {
  if (priority === 'All') return getAllAnalyses();
  return db.analyses.where('priority').equals(priority).reverse().sortBy('analyzedAt');
}

export async function getAnalysesForWeek(start: number, end: number): Promise<EmailAnalysis[]> {
  return db.analyses
    .where('analyzedAt')
    .between(start, end, true, true)
    .toArray();
}

export async function saveSnooze(reminder: SnoozeReminder): Promise<void> {
  await db.snoozes.put(reminder);
}

export async function getSnooze(id: string): Promise<SnoozeReminder | undefined> {
  return db.snoozes.get(id);
}

export async function getAllSnoozes(): Promise<SnoozeReminder[]> {
  return db.snoozes.toArray();
}

export async function getDueSnoozes(): Promise<SnoozeReminder[]> {
  const now = Date.now();
  return db.snoozes.where('resurfaceAt').belowOrEqual(now).toArray();
}

export async function deleteSnooze(id: string): Promise<void> {
  await db.snoozes.delete(id);
}

export async function saveDigest(digest: WeeklyDigest): Promise<void> {
  await db.digests.put(digest);
}

export async function getLatestDigest(): Promise<WeeklyDigest | undefined> {
  const all = await db.digests.orderBy('generatedAt').reverse().limit(1).toArray();
  return all[0];
}

/** Simple hash for email body to detect content changes */
export async function hashBody(body: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(body.slice(0, 5000));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
