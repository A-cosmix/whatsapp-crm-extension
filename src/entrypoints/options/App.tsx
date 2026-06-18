import { useState, useEffect } from 'react';
import { Sparkles, Key, Palette, Bell, Mic, Timer, Save, Check } from 'lucide-react';
import { useExtensionState } from '@momentum/hooks/use-extension-state';
import { useTheme } from '@momentum/components/ThemeProvider';
import { MessageTypes, sendMessage } from '@momentum/lib/messages';
import type { AccentTheme, AppSettings, ThemeMode } from '@momentum/types';

const ACCENTS: AccentTheme[] = ['electric', 'neon', 'cyan', 'emerald', 'rose'];
const THEMES: ThemeMode[] = ['dark', 'light', 'system'];

export function OptionsApp() {
  const { state, refresh } = useExtensionState();
  const { setTheme, setAccent } = useTheme();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state?.settings) setForm({ ...state.settings });
  }, [state?.settings]);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--mx-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const save = async () => {
    await sendMessage(MessageTypes.UPDATE_SETTINGS, form);
    await setTheme(form.theme);
    await setAccent(form.accent);
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setForm((f) => f ? { ...f, [key]: value } : f);
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-10">
      <header className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl mx-glass flex items-center justify-center">
          <Sparkles size={20} style={{ color: 'var(--mx-accent)' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Momentum X Settings</h1>
          <p className="text-sm opacity-40">Configure your productivity experience</p>
        </div>
      </header>

      <div className="space-y-6">
        <section className="mx-card">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} style={{ color: 'var(--mx-accent)' }} />
            <h2 className="text-sm font-semibold">AI Configuration</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mx-label block mb-1.5">OpenAI API Key</label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) => update('apiKey', e.target.value)}
                placeholder="sk-..."
                className="mx-input"
              />
            </div>
            <div>
              <label className="mx-label block mb-1.5">API Base URL</label>
              <input
                value={form.apiBaseUrl}
                onChange={(e) => update('apiBaseUrl', e.target.value)}
                className="mx-input"
              />
            </div>
            <div>
              <label className="mx-label block mb-1.5">Model</label>
              <input
                value={form.model}
                onChange={(e) => update('model', e.target.value)}
                className="mx-input"
                placeholder="gpt-4o-mini"
              />
            </div>
          </div>
        </section>

        <section className="mx-card">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} style={{ color: 'var(--mx-accent)' }} />
            <h2 className="text-sm font-semibold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mx-label block mb-2">Theme</label>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('theme', t)}
                    className={`mx-btn-ghost capitalize flex-1 ${form.theme === t ? 'ring-2' : ''}`}
                    style={form.theme === t ? { ringColor: 'var(--mx-accent)' } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mx-label block mb-2">Accent Color</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => update('accent', a)}
                    data-accent={a}
                    className={`w-10 h-10 rounded-xl border-2 capitalize text-[10px] font-medium ${
                      form.accent === a ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ background: `var(--mx-accent)`, ['--mx-accent' as string]: getAccentColor(a) }}
                  >
                    {a[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-card">
          <div className="flex items-center gap-2 mb-4">
            <Timer size={16} style={{ color: 'var(--mx-accent)' }} />
            <h2 className="text-sm font-semibold">Focus & Goals</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mx-label block mb-1.5">Focus (min)</label>
              <input type="number" value={form.focusDuration} onChange={(e) => update('focusDuration', +e.target.value)} className="mx-input" min={1} max={120} />
            </div>
            <div>
              <label className="mx-label block mb-1.5">Break (min)</label>
              <input type="number" value={form.breakDuration} onChange={(e) => update('breakDuration', +e.target.value)} className="mx-input" min={1} max={30} />
            </div>
            <div>
              <label className="mx-label block mb-1.5">Daily Goals</label>
              <input type="number" value={form.dailyGoalTarget} onChange={(e) => update('dailyGoalTarget', +e.target.value)} className="mx-input" min={1} max={20} />
            </div>
          </div>
        </section>

        <section className="mx-card space-y-3">
          {[
            { key: 'notificationsEnabled' as const, icon: Bell, label: 'Notifications' },
            { key: 'voiceEnabled' as const, icon: Mic, label: 'Voice Commands' },
            { key: 'floatingAssistant' as const, icon: Sparkles, label: 'Floating AI Assistant' },
          ].map(({ key, icon: Icon, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Icon size={16} className="opacity-50" />
                <span className="text-sm">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 accent-[var(--mx-accent)]"
              />
            </label>
          ))}
        </section>

        <button type="button" onClick={save} className="mx-btn-primary w-full py-3">
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}

function getAccentColor(accent: AccentTheme): string {
  const map: Record<AccentTheme, string> = {
    electric: '#3b82f6',
    neon: '#a855f7',
    cyan: '#06b6d4',
    emerald: '#10b981',
    rose: '#f43f5e',
  };
  return map[accent];
}
