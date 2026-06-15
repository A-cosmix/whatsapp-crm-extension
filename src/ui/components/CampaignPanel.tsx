import { useState } from 'react';
import type { CampaignView } from '@ui/hooks/use-campaigns';

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-wa-green/20 text-wa-green',
  paused: 'bg-wa-warning/20 text-wa-warning',
  completed: 'bg-blue-500/20 text-blue-300',
  cancelled: 'bg-gray-500/20 text-wa-muted',
  draft: 'bg-gray-500/20 text-wa-muted',
  scheduled: 'bg-purple-500/20 text-purple-300',
};

interface CampaignListProps {
  campaigns: CampaignView[];
  loading: boolean;
  onPause: (id: string) => void;
  onCancel: (id: string) => void;
}

export function CampaignList({ campaigns, loading, onPause, onCancel }: CampaignListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-wa-green border-t-transparent" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="crm-card border-dashed text-center">
        <p className="text-sm text-wa-muted">No campaigns yet</p>
        <p className="mt-1 text-xs text-wa-muted">Create a bulk follow-up below</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <div key={c.id} className="crm-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-wa-text">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-wa-muted">{c.template}</p>
            </div>
            <span className={`crm-badge ${STATUS_COLORS[c.status] ?? 'bg-dark-hover text-wa-muted'}`}>
              {c.status}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-wa-muted">
            <span className="text-wa-green">✓ {c.sentCount} sent</span>
            {c.failedCount > 0 && <span className="text-wa-danger">✗ {c.failedCount} failed</span>}
            <span>Cap: {c.dailyCap}/day</span>
          </div>
          {c.status === 'running' && (
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => onPause(c.id)} className="crm-btn-secondary">
                Pause
              </button>
              <button type="button" onClick={() => onCancel(c.id)} className="crm-btn-danger">
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface CampaignBuilderProps {
  selectedLeadIds: string[];
  onCreate: (input: { name: string; template: string; leadIds: string[] }) => Promise<void>;
}

export function CampaignBuilder({ selectedLeadIds, onCreate }: CampaignBuilderProps) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('Hi {{name}}, following up on our conversation!');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !template || selectedLeadIds.length === 0) return;
    setSubmitting(true);
    try {
      await onCreate({ name, template, leadIds: selectedLeadIds });
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crm-card space-y-3">
      <h2 className="text-sm font-semibold text-wa-text">New Bulk Campaign</h2>
      <p className="text-xs text-wa-muted">
        {selectedLeadIds.length} lead(s) selected · Use {'{{name}}'} {'{{phone}}'} variables
      </p>
      <input
        type="text"
        placeholder="Campaign name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="crm-input"
      />
      <textarea
        placeholder="Message template..."
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        rows={3}
        className="crm-input resize-none"
      />
      <button
        type="submit"
        disabled={submitting || selectedLeadIds.length === 0}
        className="crm-btn-primary w-full"
      >
        {submitting ? 'Starting...' : 'Start Campaign'}
      </button>
    </form>
  );
}
