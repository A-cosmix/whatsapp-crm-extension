/**
 * Lightweight analytics tracker for content scripts.
 * Sends events to the background worker — no heavy dependencies.
 */

import type { AnalyticsFeature, EmailPlatform } from '@/types';

/** Fire-and-forget feature tracking (processed in background service worker) */
export function trackEvent(
  feature: AnalyticsFeature,
  options?: {
    platform?: EmailPlatform;
    metadata?: Record<string, string | number | boolean>;
  },
): void {
  chrome.runtime
    .sendMessage({ type: 'TRACK_EVENT', payload: { feature, ...options } })
    .catch(() => {});
}
