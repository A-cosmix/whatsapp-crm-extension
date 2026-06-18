import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { EXPLANATION_MODES, type ExplanationMode } from '@/types';
import { ModeCard } from '@/components/ModeCard';
import { logOut, updateUserProfile } from '@/services/auth/firebase-auth';
import { clearAllData, clearLocalProfile } from '@/services/storage/indexed-db';
import { useSettings } from '@/hooks/use-settings';

interface SettingsPageProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPage({ user, onBack, onLogout }: SettingsPageProps) {
  const { settings, update } = useSettings();
  const [apiKey, setApiKey] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [aiProvider, setAiProvider] = useState<'cosmiq' | 'claude'>('cosmiq');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['claudeApiKey', 'razorpayPaymentLink', 'aiProvider']).then((r) => {
      if (r.claudeApiKey) setApiKey('••••••••' + (r.claudeApiKey as string).slice(-4));
      if (r.razorpayPaymentLink) setPaymentLink(r.razorpayPaymentLink as string);
      if (r.aiProvider) setAiProvider(r.aiProvider as 'cosmiq' | 'claude');
    });
  }, []);

  const handleSaveSettings = async () => {
    const updates: Record<string, string> = { aiProvider };
    if (apiKey && !apiKey.startsWith('••')) updates.claudeApiKey = apiKey;
    if (paymentLink) updates.razorpayPaymentLink = paymentLink;
    await chrome.storage.local.set(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleModeChange = async (mode: ExplanationMode) => {
    await update({ defaultMode: mode });
    await updateUserProfile(user.uid, { preferredMode: mode });
  };

  const handleLogout = async () => {
    await logOut();
    await clearLocalProfile();
    onLogout();
  };

  const handleClearData = async () => {
    await clearAllData();
    alert('All local data cleared!');
  };

  const handleExport = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'EXPORT_DATA' });
    if (response.success) {
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'explain-like-whatsapp-data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Settings</h2>
      </div>

      {/* AI Provider */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">AI Engine</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAiProvider('cosmiq')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${aiProvider === 'cosmiq' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-gray-200'}`}
          >
            🚀 CosmiQ (Free)
          </button>
          <button
            onClick={() => setAiProvider('claude')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${aiProvider === 'claude' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-gray-200'}`}
          >
            🤖 Claude (Paid)
          </button>
        </div>
        <p className="text-[10px] text-gray-400">Default: CosmiQ AI on Hugging Face — FREE, no API key needed</p>
      </div>

      {/* Claude API Key (only if Claude selected) */}
      {aiProvider === 'claude' && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Claude API Key</h3>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field"
            placeholder="sk-ant-..."
          />
        </div>
      )}

      {/* Razorpay Payment Link */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Razorpay Payment Link</h3>
        <input
          type="url"
          value={paymentLink}
          onChange={(e) => setPaymentLink(e.target.value)}
          className="input-field"
          placeholder="https://rzp.io/l/your-link"
        />
        <p className="text-[10px] text-gray-400">Razorpay Dashboard → Payment Links → copy link</p>
      </div>

      <button onClick={handleSaveSettings} className="btn-primary text-sm py-2">
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>

      <hr className="border-gray-100" />

      {/* Default Mode */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Default Mode</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
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
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Features</h3>
        {[
          { key: 'wordExplainerEnabled' as const, label: 'Word Explainer', icon: '📖' },
          { key: 'focusModeEnabled' as const, label: 'Focus Mode', icon: '🎯' },
          { key: 'notificationsEnabled' as const, label: 'Notifications', icon: '🔔' },
          { key: 'analyticsEnabled' as const, label: 'Analytics', icon: '📊' },
        ].map((toggle) => (
          <label key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 cursor-pointer">
            <span className="text-sm flex items-center gap-2">{toggle.icon} {toggle.label}</span>
            <input
              type="checkbox"
              checked={settings?.[toggle.key] ?? true}
              onChange={(e) => update({ [toggle.key]: e.target.checked })}
              className="w-4 h-4 accent-brand-500"
            />
          </label>
        ))}
      </div>

      {/* Data */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Data</h3>
        <button onClick={handleExport} className="btn-secondary text-sm py-2">📥 Export Data</button>
        <button onClick={handleClearData} className="btn-secondary text-sm py-2">🗑️ Clear Cache</button>
      </div>

      {/* Account */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <button onClick={handleLogout} className="btn-secondary text-sm py-2">Logout</button>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-2 text-sm text-red-500 hover:underline">Delete Account</button>
        ) : (
          <button onClick={handleLogout} className="w-full py-2 text-sm text-red-600 font-semibold bg-red-50 rounded-xl">
            Confirm Delete (contact support)
          </button>
        )}
      </div>
    </div>
  );
}
