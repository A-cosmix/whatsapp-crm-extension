import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsSummary } from '@/types';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

interface AnalyticsDashboardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function AnalyticsDashboard({
  enabled,
  onToggle,
}: AnalyticsDashboardProps): React.ReactElement {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sendMessage<AnalyticsSummary>('GET_ANALYTICS', { periodDays: period });
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (enabled) load();
    else setLoading(false);
  }, [enabled, load]);

  const handleClear = async () => {
    if (!confirm('Clear all usage analytics data? This cannot be undone.')) return;
    await sendMessage('CLEAR_ANALYTICS');
    load();
  };

  const maxDayCount = summary?.byDay.reduce((m, d) => Math.max(m, d.count), 1) ?? 1;
  const maxFeatureCount = summary?.topFeatures[0]?.count ?? 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Track feature usage locally. Data never leaves your device.
        </p>
        <button
          type="button"
          className={`toggle ${enabled ? 'on' : ''}`}
          onClick={() => onToggle(!enabled)}
          aria-pressed={enabled}
          aria-label="Toggle usage analytics"
        />
      </div>

      {!enabled ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          Usage analytics is disabled. Enable to track how you use extension features.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <div className="spinner" />
        </div>
      ) : summary ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <span className="text-sm font-semibold">{summary.totalEvents} events</span>
          </div>

          {(summary.byPlatform.gmail || summary.byPlatform.outlook) && (
            <div className="flex gap-3 text-xs">
              {summary.byPlatform.gmail != null && (
                <span className="px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                  Gmail: {summary.byPlatform.gmail}
                </span>
              )}
              {summary.byPlatform.outlook != null && (
                <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  Outlook: {summary.byPlatform.outlook}
                </span>
              )}
            </div>
          )}

          {summary.topFeatures.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Features</h3>
              <div className="space-y-2">
                {summary.topFeatures.slice(0, 8).map((f) => (
                  <div key={f.feature}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{f.label}</span>
                      <span className="text-slate-500">{f.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${(f.count / maxFeatureCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No usage data yet. Start using features to see stats here.
            </p>
          )}

          {summary.byDay.length > 1 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Daily Activity</h3>
              <div className="flex items-end gap-0.5 h-16">
                {summary.byDay.slice(-14).map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 bg-brand-500 dark:bg-brand-600 rounded-t opacity-80 hover:opacity-100 transition"
                    style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}%` }}
                    title={`${d.date}: ${d.count} events`}
                  />
                ))}
              </div>
            </div>
          )}

          <button type="button" onClick={handleClear} className="text-xs text-red-500 hover:underline">
            Clear all analytics data
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface AnalyticsMiniProps {
  periodDays?: number;
}

/** Compact stats row for the popup */
export function AnalyticsMini({ periodDays = 7 }: AnalyticsMiniProps): React.ReactElement | null {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    sendMessage<AnalyticsSummary>('GET_ANALYTICS', { periodDays })
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [periodDays]);

  if (!summary || summary.totalEvents === 0) return null;

  const top = summary.topFeatures.slice(0, 3);

  return (
    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
      <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
        Usage · last {periodDays}d
      </p>
      <div className="flex gap-2 flex-wrap">
        {top.map((f) => (
          <span
            key={f.feature}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {f.label}: <strong>{f.count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
