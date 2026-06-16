/**
 * Local feature usage analytics — stored in IndexedDB only, never sent externally.
 */

import type {
  AnalyticsEvent,
  AnalyticsFeature,
  AnalyticsSummary,
  EmailPlatform,
  TrackEventPayload,
} from '@/types';
import { ANALYTICS_FEATURE_LABELS } from '@/types';
import { getPreferences } from '@/utils/api';
import { db } from '@/utils/storage';

const ANALYTICS_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Record a feature usage event (no-op if analytics disabled) */
export async function trackFeatureUsage(
  feature: AnalyticsFeature,
  options?: {
    platform?: EmailPlatform;
    metadata?: Record<string, string | number | boolean>;
  },
): Promise<void> {
  try {
    const prefs = await getPreferences();
    if (!prefs.analyticsEnabled) return;

    const event: AnalyticsEvent = {
      feature,
      timestamp: Date.now(),
      platform: options?.platform,
      metadata: options?.metadata,
    };

    await db.analytics.add(event);

    // Probabilistic purge to avoid overhead on every event
    if (Math.random() < 0.02) {
      await purgeOldAnalytics();
    }
  } catch {
    // Analytics must never break core functionality
  }
}

export async function trackEventPayload(payload: TrackEventPayload): Promise<void> {
  await trackFeatureUsage(payload.feature, {
    platform: payload.platform,
    metadata: payload.metadata,
  });
}

/** Remove analytics events older than 90 days */
export async function purgeOldAnalytics(): Promise<number> {
  const cutoff = Date.now() - ANALYTICS_TTL_MS;
  return db.analytics.where('timestamp').below(cutoff).delete();
}

/** Clear all analytics data */
export async function clearAnalytics(): Promise<void> {
  await db.analytics.clear();
}

/** Build usage summary for the last N days */
export async function getAnalyticsSummary(periodDays = 30): Promise<AnalyticsSummary> {
  const since = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const events = await db.analytics.where('timestamp').above(since).toArray();

  const byFeature: Partial<Record<AnalyticsFeature, number>> = {};
  const byPlatform: Partial<Record<EmailPlatform, number>> = {};
  const dayMap = new Map<string, number>();

  for (const event of events) {
    byFeature[event.feature] = (byFeature[event.feature] ?? 0) + 1;
    if (event.platform) {
      byPlatform[event.platform] = (byPlatform[event.platform] ?? 0) + 1;
    }

    const date = new Date(event.timestamp).toISOString().slice(0, 10);
    dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
  }

  const byDay = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topFeatures = (Object.entries(byFeature) as [AnalyticsFeature, number][])
    .map(([feature, count]) => ({
      feature,
      label: ANALYTICS_FEATURE_LABELS[feature],
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEvents: events.length,
    periodDays,
    byFeature,
    byPlatform,
    byDay,
    topFeatures,
  };
}

/** Fire-and-forget track from content scripts / panel — see track-event.ts */
export { trackEvent } from '@/utils/track-event';
