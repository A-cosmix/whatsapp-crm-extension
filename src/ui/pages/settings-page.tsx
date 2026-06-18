import { useState, useEffect } from 'react';
import { Header, GlassCard, Button, Input, Select } from '../components';
import { useSettingsStore, useAuthStore } from '../stores';
import { sendMessage } from '../lib/utils';
import { useMutation } from '@tanstack/react-query';
import { Save, Key, User } from 'lucide-react';

export function SettingsPage() {
  const { settings, load, save } = useSettingsStore();
  const { user, loadUser } = useAuthStore();
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<'openai' | 'mock'>('mock');
  const [autoScan, setAutoScan] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    load();
    loadUser();
  }, [load, loadUser]);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey ?? '');
      setLlmProvider(settings.llmProvider);
      setAutoScan(settings.autoScanJobs);
      setNotifications(settings.notificationsEnabled);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => save({ apiKey, llmProvider, autoScanJobs: autoScan, notificationsEnabled: notifications }),
  });

  const signInMutation = useMutation({
    mutationFn: () => sendMessage('SIGN_IN', { email, password }),
    onSuccess: () => loadUser(),
  });

  return (
    <div>
      <Header title="Settings" subtitle="Configure your HireMate AI experience" />

      <div className="p-8 space-y-8 max-w-2xl">
        {!user && (
          <GlassCard className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-hiremate-secondary" />
              Sign In
            </h3>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={() => signInMutation.mutate()} loading={signInMutation.isPending}>
              Sign In
            </Button>
          </GlassCard>
        )}

        <GlassCard className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-4 h-4 text-hiremate-secondary" />
            AI Configuration
          </h3>
          <Select
            label="LLM Provider"
            value={llmProvider}
            onChange={(e) => setLlmProvider(e.target.value as 'openai' | 'mock')}
            options={[
              { value: 'mock', label: 'Demo Mode (No API Key)' },
              { value: 'openai', label: 'OpenAI GPT-4' },
            ]}
          />
          {llmProvider === 'openai' && (
            <Input
              label="OpenAI API Key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="font-semibold">Preferences</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-hiremate-primary focus:ring-hiremate-primary/50"
            />
            <span className="text-sm">Auto-scan job descriptions on LinkedIn, Indeed, Naukri, Glassdoor</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-hiremate-primary focus:ring-hiremate-primary/50"
            />
            <span className="text-sm">Enable notifications for job match alerts</span>
          </label>
        </GlassCard>

        <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
