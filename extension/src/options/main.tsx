import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { EXPLANATION_MODES, type ExplanationMode } from '@/types';
import { ModeCard } from '@/components/ModeCard';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/use-auth';
import { updateUserProfile } from '@/services/auth/firebase-auth';
import '@/styles/globals.css';

function OptionsApp() {
  const { settings, update } = useSettings();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'modes' | 'api' | 'data'>('general');

  useEffect(() => {
    chrome.storage.local.get('claudeApiKey').then((r) => {
      if (r.claudeApiKey) setApiKey('••••••••' + (r.claudeApiKey as string).slice(-4));
    });
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.startsWith('••')) {
      await chrome.storage.local.set({ claudeApiKey: apiKey });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleModeChange = async (mode: ExplanationMode) => {
    await update({ defaultMode: mode });
    if (user) await updateUserProfile(user.uid, { preferredMode: mode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">💬</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explain Like WhatsApp</h1>
            <p className="text-sm text-gray-500">Settings & Configuration</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['general', 'modes', 'api', 'data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                activeTab === tab ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">General Settings</h2>
              {[
                { key: 'wordExplainerEnabled' as const, label: 'Smart Word Explainer', desc: 'Hover over words to see meanings' },
                { key: 'focusModeEnabled' as const, label: 'Focus Reading Mode', desc: 'Remove distractions from pages' },
                { key: 'notificationsEnabled' as const, label: 'Notifications', desc: 'Daily reports and reminders' },
                { key: 'analyticsEnabled' as const, label: 'Analytics', desc: 'Help us improve the product' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.[item.key] ?? true}
                    onChange={(e) => update({ [item.key]: e.target.checked })}
                    className="w-5 h-5 accent-brand-500"
                  />
                </label>
              ))}

              <div className="p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium">Reading Font</label>
                <select
                  value={settings?.readingFont || 'sans'}
                  onChange={(e) => update({ readingFont: e.target.value as 'sans' | 'serif' | 'mono' })}
                  className="mt-2 w-full input-field"
                >
                  <option value="sans">Sans-serif (Inter)</option>
                  <option value="serif">Serif (Georgia)</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-gray-100">
                <label className="text-sm font-medium">Focus Timer (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings?.focusTimerMinutes || 25}
                  onChange={(e) => update({ focusTimerMinutes: parseInt(e.target.value) })}
                  className="mt-2 w-full input-field"
                />
              </div>
            </div>
          )}

          {activeTab === 'modes' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900 mb-4">Explanation Modes</h2>
              {EXPLANATION_MODES.map((mode) => (
                <ModeCard
                  key={mode.id}
                  emoji={mode.emoji}
                  name={mode.name}
                  description={mode.description}
                  isPremium={mode.isPremium}
                  selected={settings?.defaultMode === mode.id}
                  onClick={() => handleModeChange(mode.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Claude API Configuration</h2>
              <p className="text-sm text-gray-500">
                Get your API key from{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-brand-600 underline">
                  console.anthropic.com
                </a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-field"
                placeholder="sk-ant-api03-..."
              />
              <button onClick={handleSaveApiKey} className="btn-primary">
                {saved ? '✅ Saved!' : 'Save API Key'}
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Data Management</h2>
              <button
                onClick={async () => {
                  const response = await chrome.runtime.sendMessage({ type: 'EXPORT_DATA' });
                  if (response.success) {
                    const blob = new Blob([response.data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'elw-export.json';
                    a.click();
                  }
                }}
                className="btn-secondary"
              >
                📥 Export All Data
              </button>
              <button
                onClick={async () => {
                  await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
                  alert('Cache cleared!');
                }}
                className="btn-secondary"
              >
                🗑️ Clear Explanation Cache
              </button>
              <p className="text-xs text-gray-400">Cached explanations auto-delete after 30 days.</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Explain Like WhatsApp v1.0.0 • Made with 💚 in India
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<OptionsApp />);
