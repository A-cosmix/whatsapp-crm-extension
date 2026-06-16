import { useCallback, useEffect, useState } from 'react';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useTheme } from '@/hooks/use-theme';
import type { ApiRequestLog, ApiUsageDashboard } from '@/types';
import { exportApiLogsCsv } from '@/utils/api-usage';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatUsd(n: number): string {
  return n < 0.01 && n > 0 ? '<$0.01' : `$${n.toFixed(2)}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString();
}

function StatusBadge({ success, errorCode }: { success: boolean; errorCode?: string }): React.ReactElement {
  if (success) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        OK
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
      {errorCode ?? 'Error'}
    </span>
  );
}

export function AdminDashboard({ embedded = false }: { embedded?: boolean }): React.ReactElement {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [dashboard, setDashboard] = useState<ApiUsageDashboard | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await sendMessage<ApiUsageDashboard>('GET_API_DASHBOARD', { periodDays: period });
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const handleExport = () => {
    if (!dashboard?.recentLogs.length) return;
    const csv = exportApiLogsCsv(dashboard.recentLogs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (!confirm('Clear all API usage logs and reset counters? This cannot be undone.')) return;
    await sendMessage('CLEAR_API_LOGS');
    load();
  };

  const openSettings = () => {
    if (embedded) {
      window.location.hash = '';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      chrome.runtime.openOptionsPage();
    }
  };

  const maxDayTokens = dashboard?.byDay.reduce(
    (m, d) => Math.max(m, d.inputTokens + d.outputTokens),
    1,
  ) ?? 1;

  return (
    <div className={embedded ? '' : 'min-h-screen'}>
      {!embedded ? (
        <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">📊 API Admin Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Claude API usage monitoring · claude-opus-4-6
              </p>
            </div>
            <ToolbarControls
              autoRefresh={autoRefresh}
              setAutoRefresh={setAutoRefresh}
              period={period}
              setPeriod={setPeriod}
              load={load}
              isDark={isDark}
              toggleTheme={toggleTheme}
              openSettings={openSettings}
            />
          </div>
        </header>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">API Usage Monitoring</h2>
          <ToolbarControls
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            period={period}
            setPeriod={setPeriod}
            load={load}
            isDark={isDark}
            toggleTheme={toggleTheme}
            openSettings={openSettings}
            compact
          />
        </div>
      )}

      <main className={embedded ? '' : 'max-w-6xl mx-auto px-6 py-6'}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : !dashboard ? (
          <p className="text-center text-slate-500 py-20">Failed to load dashboard data.</p>
        ) : (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <p className="text-xs text-slate-500 uppercase font-semibold">Requests Today</p>
                <p className="text-2xl font-bold mt-1">{dashboard.requestsToday}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTokens(dashboard.tokensToday)} tokens</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 uppercase font-semibold">Period Requests</p>
                <p className="text-2xl font-bold mt-1">{dashboard.totalRequests}</p>
                <p className="text-xs text-slate-400 mt-1">{dashboard.periodDays} day window</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 uppercase font-semibold">Est. Cost</p>
                <p className="text-2xl font-bold mt-1">{formatUsd(dashboard.estimatedCostUsd)}</p>
                <p className="text-xs text-slate-400 mt-1">Today: {formatUsd(dashboard.estimatedCostTodayUsd)}</p>
              </div>
              <div className="stat-card">
                <p className="text-xs text-slate-500 uppercase font-semibold">Error Rate</p>
                <p className={`text-2xl font-bold mt-1 ${dashboard.errorRate > 0.1 ? 'text-red-500' : ''}`}>
                  {(dashboard.errorRate * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 mt-1">{dashboard.errorCount} errors · avg {dashboard.avgDurationMs}ms</p>
              </div>
            </div>

            {/* Lifetime totals */}
            <div className="stat-card">
              <h2 className="text-sm font-semibold mb-3">Lifetime Token Usage</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Input tokens</p>
                  <p className="font-semibold text-lg">{formatTokens(dashboard.stats.totalInputTokens)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Output tokens</p>
                  <p className="font-semibold text-lg">{formatTokens(dashboard.stats.totalOutputTokens)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total requests</p>
                  <p className="font-semibold text-lg">{dashboard.stats.totalRequests}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last request</p>
                  <p className="font-semibold text-sm">
                    {dashboard.stats.lastRequestAt
                      ? formatTime(dashboard.stats.lastRequestAt)
                      : 'Never'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Cost estimates are approximate based on Claude Opus pricing. Check your{' '}
                <a
                  href="https://console.anthropic.com/settings/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Anthropic billing console
                </a>{' '}
                for actual charges.
              </p>
            </div>

            {/* Daily chart */}
            {dashboard.byDay.length > 1 && (
              <div className="stat-card">
                <h2 className="text-sm font-semibold mb-1">Daily Token Usage</h2>
                <div className="flex gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-500" /> Input
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-violet-500" /> Output
                  </span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {dashboard.byDay.slice(-21).map((d) => {
                    const total = d.inputTokens + d.outputTokens;
                    const inH = (d.inputTokens / maxDayTokens) * 100;
                    const outH = (d.outputTokens / maxDayTokens) * 100;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.date}: ${total} tokens, ${d.requests} reqs`}>
                        <div className="w-full flex items-end gap-px h-24">
                          <div className="chart-bar-in flex-1" style={{ height: `${Math.max(2, inH)}%` }} />
                          <div className="chart-bar-out flex-1" style={{ height: `${Math.max(2, outH)}%` }} />
                        </div>
                        <span className="text-[8px] text-slate-400 rotate-0 truncate w-full text-center">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Request type breakdown */}
            {dashboard.byRequestType.length > 0 && (
              <div className="stat-card">
                <h2 className="text-sm font-semibold mb-3">Requests by Type</h2>
                <div className="space-y-2">
                  {dashboard.byRequestType.map((t) => (
                    <div key={t.type} className="flex items-center gap-3">
                      <span className="text-sm w-36 shrink-0">{t.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{
                            width: `${(t.count / Math.max(dashboard.totalRequests, 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-24 text-right">
                        {t.count} · {formatTokens(t.tokens)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent requests table */}
            <div className="stat-card overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Recent API Requests</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    disabled={!dashboard.recentLogs.length}
                    className="text-xs px-3 py-1 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleClear}
                    className="text-xs px-3 py-1 text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Clear logs
                  </button>
                </div>
              </div>
              {dashboard.recentLogs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No API requests logged yet. Analyze an email to see data here.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                        <th className="text-left py-2 px-4 font-medium">Time</th>
                        <th className="text-left py-2 px-4 font-medium">Type</th>
                        <th className="text-right py-2 px-4 font-medium">In</th>
                        <th className="text-right py-2 px-4 font-medium">Out</th>
                        <th className="text-right py-2 px-4 font-medium">Duration</th>
                        <th className="text-center py-2 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentLogs.map((log: ApiRequestLog) => (
                        <tr
                          key={log.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-2 px-4 whitespace-nowrap">{formatTime(log.timestamp)}</td>
                          <td className="py-2 px-4 capitalize">{log.requestType}</td>
                          <td className="py-2 px-4 text-right font-mono">{log.inputTokens}</td>
                          <td className="py-2 px-4 text-right font-mono">{log.outputTokens}</td>
                          <td className="py-2 px-4 text-right">{log.durationMs}ms</td>
                          <td className="py-2 px-4 text-center">
                            <StatusBadge success={log.success} errorCode={log.errorCode} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Error log */}
            {dashboard.recentErrors.length > 0 && (
              <div className="stat-card border-red-200 dark:border-red-900/50">
                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                  Recent Errors ({dashboard.recentErrors.length})
                </h2>
                <div className="space-y-2">
                  {dashboard.recentErrors.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
                    >
                      <span>{formatTime(log.timestamp)}</span>
                      <span className="font-mono text-red-600 dark:text-red-400">{log.errorCode}</span>
                      <span className="text-slate-500 capitalize">{log.requestType}</span>
                      <span className="text-slate-400">{log.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ToolbarControls({
  autoRefresh,
  setAutoRefresh,
  period,
  setPeriod,
  load,
  isDark,
  toggleTheme,
  openSettings,
  compact = false,
}: {
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  period: number;
  setPeriod: (v: number) => void;
  load: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  openSettings: () => void;
  compact?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="rounded"
        />
        Auto-refresh
      </label>
      <select
        value={period}
        onChange={(e) => setPeriod(Number(e.target.value))}
        className="text-sm px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
      >
        <option value={7}>7 days</option>
        <option value={30}>30 days</option>
        <option value={90}>90 days</option>
      </select>
      <button
        onClick={load}
        className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        ↻ Refresh
      </button>
      {!compact && <DarkModeToggle isDark={isDark} onToggle={toggleTheme} size="sm" />}
      {!compact && (
        <button onClick={openSettings} className="text-sm px-3 py-1.5 text-brand-600 hover:underline">
          Settings
        </button>
      )}
    </div>
  );
}
