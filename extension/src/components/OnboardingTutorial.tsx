import { useCallback, useState } from 'react';
import type { KeyboardShortcuts, UserPreferences } from '@/types';
import { DEFAULT_PREFERENCES } from '@/types';
import {
  FEATURE_HIGHLIGHTS,
  ONBOARDING_STEPS,
} from '@/utils/onboarding';
import type { OnboardingState } from '@/types';

async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else if (response?.success) resolve(response.data as T);
      else reject(new Error(response?.error ?? 'Unknown error'));
    });
  });
}

interface OnboardingTutorialProps {
  shortcuts: KeyboardShortcuts;
  onComplete: () => void;
}

export function OnboardingTutorial({
  shortcuts,
  onComplete,
}: OnboardingTutorialProps): React.ReactElement {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'valid' | 'error'>('idle');
  const [apiError, setApiError] = useState('');
  const [finishing, setFinishing] = useState(false);

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  const isFirst = step === 0;

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setApiError('Please enter your API key.');
      setApiStatus('error');
      return;
    }
    setApiStatus('testing');
    setApiError('');
    try {
      const result = await sendMessage<{ valid: boolean; error?: { message: string } }>(
        'VALIDATE_API_KEY',
        { apiKey },
      );
      if (result.valid) {
        const prefs = await sendMessage<UserPreferences>('GET_PREFERENCES');
        await sendMessage('SAVE_PREFERENCES', { ...prefs, apiKey });
        setApiStatus('valid');
      } else {
        setApiStatus('error');
        setApiError(result.error?.message ?? 'Invalid API key');
      }
    } catch (err) {
      setApiStatus('error');
      setApiError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const finish = useCallback(
    async (skipped: boolean) => {
      setFinishing(true);
      const state: OnboardingState = {
        popupCompleted: true,
        emailTourCompleted: false,
        completedAt: Date.now(),
        skipped,
      };
      await sendMessage('SAVE_ONBOARDING', state);
      onComplete();
    },
    [onComplete],
  );

  const goNext = () => {
    if (current.id === 'api-key' && apiStatus !== 'valid') {
      handleTestApiKey();
      return;
    }
    if (isLast) {
      finish(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  const openGmail = () => {
    chrome.tabs.create({ url: 'https://mail.google.com' });
    finish(false);
  };

  const openOutlook = () => {
    chrome.tabs.create({ url: 'https://outlook.live.com' });
    finish(false);
  };

  return (
    <div className="flex flex-col min-h-[520px] max-h-[520px] bg-white dark:bg-slate-900">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 mb-1">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-400 text-right">
          Step {step + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{current.icon}</div>
          <h2 className="text-lg font-bold">{current.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{current.subtitle}</p>
        </div>

        {current.id === 'welcome' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800">
              <p className="text-xs text-brand-800 dark:text-brand-200">
                Works on <strong>Gmail</strong> and <strong>Outlook</strong>. Your emails are analyzed
                by Claude AI — nothing is stored on external servers except the API call.
              </p>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span>✓</span> Summarize emails in seconds
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span> Auto-prioritize your inbox
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span> Draft replies with one click
              </li>
            </ul>
          </div>
        )}

        {current.id === 'api-key' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type={apiKeyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiStatus('idle');
                }}
                placeholder="sk-ant-api03-..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="px-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg"
              >
                {apiKeyVisible ? '🙈' : '👁'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleTestApiKey}
              disabled={apiStatus === 'testing'}
              className="w-full py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {apiStatus === 'testing' ? 'Testing...' : apiStatus === 'valid' ? '✓ Connected' : 'Test & Save Key'}
            </button>
            {apiError && <p className="text-xs text-red-500">{apiError}</p>}
            {apiStatus === 'valid' && (
              <p className="text-xs text-green-600">API key saved successfully!</p>
            )}
            <p className="text-xs text-slate-400">
              Get a key at{' '}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        )}

        {current.id === 'features' && (
          <div className="grid grid-cols-2 gap-2">
            {FEATURE_HIGHLIGHTS.map((f) => (
              <div
                key={f.title}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="text-lg">{f.icon}</span>
                <p className="text-xs font-semibold mt-1">{f.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {current.id === 'how-to-use' && (
          <div className="space-y-3">
            {[
              { step: '1', text: 'Open Gmail or Outlook in your browser' },
              { step: '2', text: 'Click any email to open it' },
              { step: '3', text: 'The AI panel appears on the right with summary & insights' },
              { step: '4', text: 'Use the left sidebar to filter by priority' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 pt-0.5">{item.text}</p>
              </div>
            ))}
            <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 A guided tour will appear when you first open Gmail or Outlook.
              </p>
            </div>
          </div>
        )}

        {current.id === 'shortcuts' && (
          <div className="space-y-2">
            {(
              [
                ['summarize', 'Summarize email'],
                ['togglePanel', 'Toggle panel'],
                ['smartReply', 'Smart reply'],
                ['quickSnooze', 'Quick snooze'],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-sm">{label}</span>
                <kbd className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600">
                  {shortcuts[key] ?? DEFAULT_PREFERENCES.shortcuts[key]}
                </kbd>
              </div>
            ))}
            <p className="text-xs text-slate-400 mt-2">
              Customize these anytime in Settings → Keyboard Shortcuts.
            </p>
          </div>
        )}

        {current.id === 'ready' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={openGmail}
              disabled={finishing}
              className="w-full py-2.5 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
            >
              📧 Open Gmail
            </button>
            <button
              type="button"
              onClick={openOutlook}
              disabled={finishing}
              className="w-full py-2.5 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
            >
              📬 Open Outlook
            </button>
            <p className="text-xs text-center text-slate-400">
              Or finish setup and explore later.
            </p>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => finish(true)}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          Skip tour
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={finishing || (current.id === 'api-key' && apiStatus === 'testing')}
            className="px-4 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {finishing
              ? 'Finishing...'
              : current.id === 'api-key' && apiStatus !== 'valid'
                ? 'Test Key'
                : isLast
                  ? 'Done'
                  : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
