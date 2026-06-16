/**
 * API usage logging and admin dashboard data aggregation.
 */

import type { ApiRequestLog, ApiRequestType, ApiUsageDashboard, ApiUsageStats } from '@/types';
import { db } from '@/utils/storage';

const USAGE_STORAGE_KEY = 'apiUsageStats';
const LOG_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Approximate Claude Opus pricing (USD per million tokens) — estimates only */
const PRICE_INPUT_PER_M = 15;
const PRICE_OUTPUT_PER_M = 75;

const REQUEST_TYPE_LABELS: Record<ApiRequestType, string> = {
  analyze: 'Email Analysis',
  validate: 'API Validation',
  digest: 'Weekly Digest',
  other: 'Other',
};

const DEFAULT_STATS: ApiUsageStats = {
  lastInputTokens: 0,
  lastOutputTokens: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  lastRequestAt: 0,
  totalRequests: 0,
  totalErrors: 0,
};

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * PRICE_INPUT_PER_M + (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
}

export async function getApiUsageStats(): Promise<ApiUsageStats> {
  const result = await chrome.storage.local.get(USAGE_STORAGE_KEY);
  return { ...DEFAULT_STATS, ...(result[USAGE_STORAGE_KEY] as Partial<ApiUsageStats> | undefined) };
}

/** Log an individual API request for the admin dashboard */
export async function logApiRequest(
  entry: Omit<ApiRequestLog, 'id' | 'timestamp'> & { timestamp?: number },
): Promise<void> {
  const log: ApiRequestLog = {
    ...entry,
    timestamp: entry.timestamp ?? Date.now(),
  };

  await db.apiLogs.add(log);

  const current = await getApiUsageStats();
  const updated: ApiUsageStats = {
    lastInputTokens: log.inputTokens,
    lastOutputTokens: log.outputTokens,
    totalInputTokens: current.totalInputTokens + log.inputTokens,
    totalOutputTokens: current.totalOutputTokens + log.outputTokens,
    lastRequestAt: log.timestamp,
    totalRequests: current.totalRequests + 1,
    totalErrors: current.totalErrors + (log.success ? 0 : 1),
  };
  await chrome.storage.local.set({ [USAGE_STORAGE_KEY]: updated });

  if (Math.random() < 0.02) {
    await purgeOldApiLogs();
  }
}

export async function purgeOldApiLogs(): Promise<number> {
  const cutoff = Date.now() - LOG_TTL_MS;
  return db.apiLogs.where('timestamp').below(cutoff).delete();
}

export async function clearApiLogs(): Promise<void> {
  await db.apiLogs.clear();
  await chrome.storage.local.set({ [USAGE_STORAGE_KEY]: { ...DEFAULT_STATS } });
}

export async function getApiUsageDashboard(periodDays = 30): Promise<ApiUsageDashboard> {
  const since = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const logs = await db.apiLogs.where('timestamp').above(since).reverse().sortBy('timestamp');
  const stats = await getApiUsageStats();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const todayLogs = logs.filter((l) => l.timestamp >= todayMs);
  const errors = logs.filter((l) => !l.success);

  let periodInput = 0;
  let periodOutput = 0;
  let totalDuration = 0;
  const dayMap = new Map<string, { inputTokens: number; outputTokens: number; requests: number; errors: number }>();
  const typeMap = new Map<ApiRequestType, { count: number; tokens: number }>();

  for (const log of logs) {
    periodInput += log.inputTokens;
    periodOutput += log.outputTokens;
    totalDuration += log.durationMs;

    const date = new Date(log.timestamp).toISOString().slice(0, 10);
    const day = dayMap.get(date) ?? { inputTokens: 0, outputTokens: 0, requests: 0, errors: 0 };
    day.inputTokens += log.inputTokens;
    day.outputTokens += log.outputTokens;
    day.requests += 1;
    if (!log.success) day.errors += 1;
    dayMap.set(date, day);

    const typeEntry = typeMap.get(log.requestType) ?? { count: 0, tokens: 0 };
    typeEntry.count += 1;
    typeEntry.tokens += log.inputTokens + log.outputTokens;
    typeMap.set(log.requestType, typeEntry);
  }

  const todayTokens = todayLogs.reduce((s, l) => s + l.inputTokens + l.outputTokens, 0);

  const byDay = [...dayMap.entries()]
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byRequestType = (Object.keys(REQUEST_TYPE_LABELS) as ApiRequestType[])
    .map((type) => ({
      type,
      label: REQUEST_TYPE_LABELS[type],
      count: typeMap.get(type)?.count ?? 0,
      tokens: typeMap.get(type)?.tokens ?? 0,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    stats,
    periodDays,
    totalRequests: logs.length,
    requestsToday: todayLogs.length,
    tokensToday: todayTokens,
    errorCount: errors.length,
    errorRate: logs.length > 0 ? errors.length / logs.length : 0,
    estimatedCostUsd: estimateCostUsd(periodInput, periodOutput),
    estimatedCostTodayUsd: estimateCostUsd(
      todayLogs.reduce((s, l) => s + l.inputTokens, 0),
      todayLogs.reduce((s, l) => s + l.outputTokens, 0),
    ),
    avgDurationMs: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
    byDay,
    byRequestType,
    recentLogs: logs.slice(0, 50),
    recentErrors: errors.slice(0, 20),
  };
}

export function exportApiLogsCsv(logs: ApiRequestLog[]): string {
  const header = 'timestamp,requestType,inputTokens,outputTokens,success,errorCode,durationMs,model';
  const rows = logs.map((l) =>
    [
      new Date(l.timestamp).toISOString(),
      l.requestType,
      l.inputTokens,
      l.outputTokens,
      l.success,
      l.errorCode ?? '',
      l.durationMs,
      l.model,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export { REQUEST_TYPE_LABELS };
