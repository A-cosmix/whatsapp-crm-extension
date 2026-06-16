import { useCallback, useEffect, useState } from 'react';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { AnalyticsMini } from '@/components/AnalyticsDashboard';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { useTheme } from '@/hooks/use-theme';
import type { ApiUsageStats, EmailAnalysis, OnboardingState, UserPreferences } from '@/types';
import { DEFAULT_PREFERENCES, PRIORITY_COLORS, SENTIMENT_EMOJI } from '@/types';
import { shouldShowPopupOnboarding } from '@/utils/onboarding';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

export function Popup(): React.ReactElement {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [usage, setUsage] = useState<ApiUsageStats | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [digestLoading, setDigestLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [p, a, u, onboarding] = await Promise.all([
        sendMessage<UserPreferences>('GET_PREFERENCES'),
        sendMessage<EmailAnalysis[]>('GET_ALL_ANALYSES'),
        sendMessage<ApiUsageStats>('GET_API_USAGE'),
        sendMessage<OnboardingState>('GET_ONBOARDING'),
      ]);
      setPrefs(p);
      setAnalyses(a);
      setUsage(u);
      setShowOnboarding(shouldShowPopupOnboarding(onboarding));
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadData();
  };

  const filtered = analyses
    .filter((a) => filter === 'All' || a.priority === filter)
    .filter(
      (a) =>
        !search ||
        a.subject.toLowerCase().includes(search.toLowerCase()) ||
        a.sender.toLowerCase().includes(search.toLowerCase()),
    );

  const handleGenerateDigest = async () => {
    setDigestLoading(true);
    try {
      await sendMessage('GENERATE_WEEKLY_DIGEST');
      alert('Weekly digest generated! Check notifications.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate digest');
    } finally {
      setDigestLoading(false);
    }
  };

  const openOptions = () => chrome.runtime.openOptionsPage();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="spinner" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingTutorial
        shortcuts={prefs?.shortcuts ?? DEFAULT_PREFERENCES.shortcuts}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (!prefs?.apiKey) {
    return (
      <div className="p-6 text-center relative">
        <div className="absolute top-3 right-3">
          <DarkModeToggle isDark={isDark} onToggle={toggleTheme} size="sm" />
        </div>
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-lg font-semibold mb-2">AI Email Summarizer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Add your Claude API key to get started.
        </p>
        <button
          onClick={openOptions}
          className="w-full py-2 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition mb-2"
        >
          Open Settings
        </button>
        <button
          onClick={() => setShowOnboarding(true)}
          className="w-full py-2 px-4 text-sm text-brand-600 hover:underline"
        >
          View setup tutorial
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[480px]">
      <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold flex items-center gap-1.5">
            ✨ Email Summarizer
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                chrome.tabs.create({
                  url: chrome.runtime.getURL('src/options/options.html#admin'),
                })
              }
              className="text-xs p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              title="API Admin Dashboard"
              aria-label="API Admin Dashboard"
            >
              📊
            </button>
            <DarkModeToggle isDark={isDark} onToggle={toggleTheme} size="sm" />
            <button
              onClick={openOptions}
              className="text-xs text-brand-600 hover:underline p-1"
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
        {usage && (
          <p className="text-xs text-slate-500 mt-1">
            Last request: {usage.lastInputTokens + usage.lastOutputTokens} tokens · Total:{' '}
            {usage.totalInputTokens + usage.totalOutputTokens}
          </p>
        )}
      </header>

      {prefs.analyticsEnabled && <AnalyticsMini />}

      <div className="px-3 py-2 flex gap-1 flex-wrap">
        {['All', 'Important', 'Routine', 'Low Priority'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2 py-1 rounded-full transition ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-3 pb-2">
        <input
          type="search"
          placeholder="Search summaries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            Open an email in Gmail or Outlook to analyze it.
          </p>
        ) : (
          filtered.slice(0, 20).map((a) => (
            <div
              key={a.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
                  style={{ background: PRIORITY_COLORS[a.priority] }}
                >
                  {a.priority}
                </span>
                <span title={a.sentiment}>{SENTIMENT_EMOJI[a.sentiment]}</span>
                {a.needsFollowUp && (
                  <span className="text-xs text-amber-500">↩ needs reply</span>
                )}
              </div>
              <p className="text-xs font-medium truncate">{a.subject}</p>
              <p className="text-xs text-slate-500 truncate">{a.sender}</p>
              <ul className="mt-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                {a.summary.slice(0, 2).map((s, i) => (
                  <li key={i} className="truncate">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <footer className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleGenerateDigest}
          disabled={digestLoading}
          className="w-full text-xs py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
        >
          {digestLoading ? 'Generating...' : '📊 Generate Weekly Digest'}
        </button>
        <p className="text-center text-[10px] text-slate-400 mt-1">
          {prefs?.shortcuts?.summarize ?? 'Alt+S'} to summarize · v1.0.0
        </p>
      </footer>
    </div>
  );
}
