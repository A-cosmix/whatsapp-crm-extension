import { useCallback, useEffect, useState } from 'react';
import { DarkModeSwitch, DarkModeToggle } from '@/components/DarkModeToggle';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ShortcutsSection } from '@/components/ShortcutRecorder';
import { useTheme } from '@/hooks/use-theme';
import type { ApiUsageStats, FeatureToggles, KeyboardShortcuts, SummaryLength, UserPreferences } from '@/types';
import { DEFAULT_PREFERENCES } from '@/types';
import { findShortcutConflicts } from '@/utils/shortcuts';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

const FEATURE_LABELS: Record<keyof FeatureToggles, string> = {
  summarization: 'Email Summarization',
  priority: 'Priority Classification',
  meetingExtractor: 'Meeting Extractor',
  followUp: 'Follow-up Detection',
  smartReply: 'Smart Reply Suggestions',
  sentiment: 'Sentiment Analysis',
  snooze: 'Snooze & Reminders',
  weeklyDigest: 'Weekly Digest',
};

export function Options(): React.ReactElement {
  const { isDark, darkMode, label, toggle: toggleTheme, useSystemTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [usage, setUsage] = useState<ApiUsageStats | null>(null);
  const [saved, setSaved] = useState(false);
  const [excludedInput, setExcludedInput] = useState('');
  const [shortcutError, setShortcutError] = useState('');

  useEffect(() => {
    sendMessage<UserPreferences>('GET_PREFERENCES').then(setPrefs).catch(() => {});
    sendMessage<ApiUsageStats>('GET_API_USAGE').then(setUsage).catch(() => {});
  }, []);

  const save = useCallback(async (updated: UserPreferences) => {
    setPrefs(updated);
    await sendMessage('SAVE_PREFERENCES', updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleTestApi = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const result = await sendMessage<{
        valid: boolean;
        error?: { message: string };
        usage?: { input_tokens: number; output_tokens: number };
      }>('VALIDATE_API_KEY', { apiKey: prefs.apiKey });

      if (result.valid) {
        setTestStatus('success');
        setTestMessage(
          `Connected! Test used ${(result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0)} tokens.`,
        );
      } else {
        setTestStatus('error');
        setTestMessage(result.error?.message ?? 'Invalid API key');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const toggleFeature = (key: keyof FeatureToggles) => {
    const updated = {
      ...prefs,
      features: { ...prefs.features, [key]: !prefs.features[key] },
    };
    save(updated);
  };

  const addExcludedSender = () => {
    const trimmed = excludedInput.trim();
    if (!trimmed || prefs.excludedSenders.includes(trimmed)) return;
    save({ ...prefs, excludedSenders: [...prefs.excludedSenders, trimmed] });
    setExcludedInput('');
  };

  const removeExcludedSender = (sender: string) => {
    save({ ...prefs, excludedSenders: prefs.excludedSenders.filter((s) => s !== sender) });
  };

  const handleShortcutsChange = (shortcuts: KeyboardShortcuts) => {
    const conflicts = findShortcutConflicts(shortcuts);
    if (conflicts.length > 0) {
      setShortcutError(conflicts[0]);
      return;
    }
    setShortcutError('');
    save({ ...prefs, shortcuts });
  };

  const resetShortcuts = () => {
    setShortcutError('');
    save({ ...prefs, shortcuts: { ...DEFAULT_PREFERENCES.shortcuts } });
  };

  const replayPopupTutorial = async () => {
    await sendMessage('RESET_ONBOARDING');
    try {
      await chrome.action.openPopup();
    } catch {
      alert('Click the extension icon in your toolbar to start the setup tutorial.');
    }
  };

  const replayEmailTour = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url ?? '';
    if (tab?.id && (url.includes('mail.google.com') || url.includes('outlook.live.com'))) {
      chrome.tabs.sendMessage(tab.id, { type: 'START_EMAIL_TOUR' });
    } else {
      alert('Open Gmail or Outlook in a tab, then click Replay email tour again.');
    }
  };

  const exportDigestPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">✨ AI Email Summarizer</h1>
          <p className="text-sm text-slate-500 mt-1">Settings &amp; Configuration · v1.0.0</p>
        </div>
        <DarkModeToggle isDark={isDark} onToggle={toggleTheme} />
      </header>

      {/* API Key */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Claude API Key</h2>
        <p className="text-sm text-slate-500 mb-3">
          Your API key is stored securely in Chrome sync storage and never leaves your browser except
          to call the Anthropic API.
        </p>
        <div className="flex gap-2">
          <input
            type={apiKeyVisible ? 'text' : 'password'}
            value={prefs.apiKey}
            onChange={(e) => setPrefs({ ...prefs, apiKey: e.target.value })}
            placeholder="sk-ant-api03-..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoComplete="off"
          />
          <button
            onClick={() => setApiKeyVisible(!apiKeyVisible)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg"
            aria-label="Toggle API key visibility"
          >
            {apiKeyVisible ? '🙈' : '👁'}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleTestApi}
            disabled={testStatus === 'testing' || !prefs.apiKey}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
          >
            {testStatus === 'testing' && <span className="spinner" />}
            Test Connection
          </button>
          <button
            onClick={() => save(prefs)}
            className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {saved ? '✓ Saved' : 'Save Key'}
          </button>
        </div>
        {testMessage && (
          <p
            className={`text-sm mt-2 ${testStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}
          >
            {testMessage}
          </p>
        )}
        {usage && (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
            <strong>API Usage:</strong> Last request — {usage.lastInputTokens} in /{' '}
            {usage.lastOutputTokens} out tokens · Total — {usage.totalInputTokens} in /{' '}
            {usage.totalOutputTokens} out tokens
            <br />
            <span className="text-slate-400">
              Note: Credit balance is managed on your Anthropic console. Token counts are tracked
              locally.
            </span>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Features</h2>
        <div className="space-y-3">
          {(Object.keys(FEATURE_LABELS) as Array<keyof FeatureToggles>).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{FEATURE_LABELS[key]}</span>
              <button
                className={`toggle ${prefs.features[key] ? 'on' : ''}`}
                onClick={() => toggleFeature(key)}
                aria-pressed={prefs.features[key]}
                aria-label={`Toggle ${FEATURE_LABELS[key]}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Summary length */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Summary Length</h2>
        <div className="flex gap-3">
          {(['brief', 'detailed'] as SummaryLength[]).map((len) => (
            <button
              key={len}
              onClick={() => save({ ...prefs, summaryLength: len })}
              className={`px-4 py-2 text-sm rounded-lg capitalize transition ${
                prefs.summaryLength === len
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-200 dark:border-slate-600'
              }`}
            >
              {len}
            </button>
          ))}
        </div>
      </section>

      {/* Weekly digest */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Weekly Digest</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Day</label>
            <select
              value={prefs.weeklyDigestDay}
              onChange={(e) => save({ ...prefs, weeklyDigestDay: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                (d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Hour</label>
            <input
              type="number"
              min={0}
              max={23}
              value={prefs.weeklyDigestHour}
              onChange={(e) => save({ ...prefs, weeklyDigestHour: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Minute</label>
            <input
              type="number"
              min={0}
              max={59}
              value={prefs.weeklyDigestMinute}
              onChange={(e) => save({ ...prefs, weeklyDigestMinute: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
        <button
          onClick={exportDigestPdf}
          className="mt-3 text-sm text-brand-600 hover:underline"
        >
          Export last digest as PDF (Print)
        </button>
      </section>

      {/* Excluded senders */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Excluded Senders</h2>
        <p className="text-sm text-slate-500 mb-2">Emails from these senders won&apos;t be summarized.</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={excludedInput}
            onChange={(e) => setExcludedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExcludedSender()}
            placeholder="email@example.com"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <button
            onClick={addExcludedSender}
            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {prefs.excludedSenders.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full"
            >
              {s}
              <button onClick={() => removeExcludedSender(s)} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Usage analytics */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Usage Analytics</h2>
        <AnalyticsDashboard
          enabled={prefs.analyticsEnabled}
          onToggle={(enabled) => save({ ...prefs, analyticsEnabled: enabled })}
        />
      </section>

      {/* Onboarding */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Onboarding Tutorial</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Replay the setup walkthrough or the in-page Gmail/Outlook tour.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={replayPopupTutorial}
            className="text-sm px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Replay setup tutorial
          </button>
          <button
            type="button"
            onClick={replayEmailTour}
            className="text-sm px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Replay email tour
          </button>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
        <ShortcutsSection
          shortcuts={prefs.shortcuts}
          onChange={handleShortcutsChange}
          onReset={resetShortcuts}
        />
        {shortcutError && (
          <p className="mt-2 text-sm text-red-500">{shortcutError}</p>
        )}
      </section>

      {/* Appearance */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <DarkModeSwitch
          isDark={isDark}
          enabled={darkMode !== 'system'}
          onToggle={toggleTheme}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Current: <strong>{label}</strong>
          </span>
          {darkMode !== 'system' ? (
            <button
              type="button"
              onClick={useSystemTheme}
              className="text-xs text-brand-600 hover:underline"
            >
              Use system theme
            </button>
          ) : (
            <span className="text-xs text-slate-400">Auto-detects OS preference</span>
          )}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold mb-3">Privacy &amp; Data</h2>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
          <li>Email content is sent only to the Anthropic Claude API for analysis.</li>
          <li>Summaries are cached locally in IndexedDB for 30 days.</li>
          <li>No data is sent to third-party servers besides Anthropic.</li>
          <li>Your API key is stored in Chrome encrypted sync storage.</li>
          <li>Usage analytics is stored locally in IndexedDB and never sent to third parties.</li>
        </ul>
      </section>

      <footer className="text-center text-xs text-slate-400 pb-8">
        AI Email Summarizer v1.0.0 · Customize shortcuts in settings above
      </footer>
    </div>
  );
}
