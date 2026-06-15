import { useState, useEffect } from 'react';
import type { AIConfig } from '@domain/messages';
import type { CrmSyncConfig } from '@domain/services/crm-sync.interface';

interface SettingsPanelProps {
  ai: AIConfig | null;
  crm: CrmSyncConfig | null;
  loading: boolean;
  saved: boolean;
  onSaveAI: (config: Partial<AIConfig>) => Promise<void>;
  onSaveCrm: (config: CrmSyncConfig) => Promise<void>;
}

export function SettingsPanel({ ai, crm, loading, saved, onSaveAI, onSaveCrm }: SettingsPanelProps) {
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');
  const [threshold, setThreshold] = useState(0.75);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [dailyCap, setDailyCap] = useState(50);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [crmEnabled, setCrmEnabled] = useState(false);

  useEffect(() => {
    if (ai) {
      setOllamaUrl(ai.ollamaUrl);
      setOllamaModel(ai.ollamaModel);
      setThreshold(ai.autoReplyConfidenceThreshold);
      setSystemPrompt(ai.systemPrompt);
      setDailyCap(ai.dailyBulkCap);
    }
    if (crm) {
      setWebhookUrl(crm.webhookUrl);
      setApiKey(crm.apiKey ?? '');
      setCrmEnabled(crm.enabled);
    }
  }, [ai, crm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-wa-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saved && (
        <div className="rounded-lg border border-wa-green/30 bg-wa-green/10 px-3 py-2 text-center text-xs text-wa-green">
          Settings saved
        </div>
      )}

      <div className="crm-card space-y-3">
        <h2 className="text-sm font-semibold text-wa-text">AI Auto-Reply (Ollama)</h2>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">Ollama URL</label>
          <input value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} className="crm-input" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">Model</label>
          <input value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} className="crm-input" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">
            Confidence threshold: {threshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-wa-green"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">System prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="crm-input resize-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">Daily bulk send cap</label>
          <input
            type="number"
            min={1}
            max={200}
            value={dailyCap}
            onChange={(e) => setDailyCap(parseInt(e.target.value, 10))}
            className="crm-input"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            onSaveAI({
              ollamaUrl,
              ollamaModel,
              autoReplyConfidenceThreshold: threshold,
              systemPrompt,
              dailyBulkCap: dailyCap,
            })
          }
          className="crm-btn-primary w-full"
        >
          Save AI Settings
        </button>
      </div>

      <div className="crm-card space-y-3">
        <h2 className="text-sm font-semibold text-wa-text">CRM Webhook Sync</h2>
        <label className="flex items-center gap-2 text-sm text-wa-text">
          <input
            type="checkbox"
            checked={crmEnabled}
            onChange={(e) => setCrmEnabled(e.target.checked)}
            className="accent-wa-green"
          />
          Enable webhook sync
        </label>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">Webhook URL (HubSpot/Zoho)</label>
          <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="crm-input" placeholder="https://..." />
        </div>
        <div>
          <label className="mb-1 block text-xs text-wa-muted">API Key (optional)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="crm-input"
          />
        </div>
        <button
          type="button"
          onClick={() => onSaveCrm({ enabled: crmEnabled, webhookUrl, apiKey: apiKey || undefined })}
          className="crm-btn-primary w-full"
        >
          Save CRM Settings
        </button>
      </div>

      <div className="crm-card">
        <h2 className="text-sm font-semibold text-wa-text">Safety Rules</h2>
        <ul className="mt-2 space-y-1.5 text-xs text-wa-muted">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-wa-green" />
            Bulk send: random 3–8s delay between messages
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-wa-green" />
            Daily cap enforced on campaigns
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-wa-green" />
            Groups excluded from auto-reply
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-wa-warning" />
            Escalation keywords → human review
          </li>
        </ul>
      </div>
    </div>
  );
}
