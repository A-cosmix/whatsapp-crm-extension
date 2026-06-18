import type { AnalyticsEvent } from '@/types';
import { trackEvent as saveEvent } from '@/services/storage/indexed-db';

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 30;
let eventTimestamps: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  eventTimestamps = eventTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  return eventTimestamps.length >= MAX_EVENTS_PER_WINDOW;
}

export async function trackAnalytics(
  name: string,
  properties: Record<string, string | number | boolean> = {},
  userId?: string,
): Promise<void> {
  if (isRateLimited()) return;

  const settings = await chrome.storage.sync.get('settings');
  const analyticsEnabled = (settings.settings as { analyticsEnabled?: boolean })?.analyticsEnabled ?? true;
  if (!analyticsEnabled) return;

  eventTimestamps.push(Date.now());

  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
    userId,
  };

  try {
    await saveEvent(event);
  } catch {
    // idb can fail in MV3 service worker — chrome.storage batch below is enough
  }

  // Batch sync to Firebase analytics endpoint when online
  try {
    const batch = await chrome.storage.local.get('analyticsBatch');
    const events = (batch.analyticsBatch as AnalyticsEvent[]) || [];
    events.push(event);
    if (events.length >= 10) {
      await flushAnalytics(events);
      await chrome.storage.local.set({ analyticsBatch: [] });
    } else {
      await chrome.storage.local.set({ analyticsBatch: events });
    }
  } catch {
    // Analytics should never block user flow
  }
}

async function flushAnalytics(events: AnalyticsEvent[]): Promise<void> {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'your-project-id') return;

  await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  }).catch(() => {});
}

export async function getMetrics(): Promise<{
  totalExplanations: number;
  popularModes: Record<string, number>;
  dailyActive: boolean;
}> {
  const result = await chrome.storage.local.get(['metrics', 'userProfile']);
  const metrics = (result.metrics as {
    totalExplanations: number;
    popularModes: Record<string, number>;
    lastActiveDate: string;
  }) || { totalExplanations: 0, popularModes: {}, lastActiveDate: '' };

  const today = new Date().toISOString().split('T')[0];
  return {
    totalExplanations: metrics.totalExplanations,
    popularModes: metrics.popularModes,
    dailyActive: metrics.lastActiveDate === today,
  };
}

export async function incrementMetric(mode: string): Promise<void> {
  const result = await chrome.storage.local.get('metrics');
  const metrics = (result.metrics as {
    totalExplanations: number;
    popularModes: Record<string, number>;
    lastActiveDate: string;
  }) || { totalExplanations: 0, popularModes: {}, lastActiveDate: '' };

  const today = new Date().toISOString().split('T')[0];
  metrics.totalExplanations++;
  metrics.popularModes[mode] = (metrics.popularModes[mode] || 0) + 1;
  metrics.lastActiveDate = today;

  await chrome.storage.local.set({ metrics });
}
