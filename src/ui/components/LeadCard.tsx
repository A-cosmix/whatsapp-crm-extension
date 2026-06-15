import type { LeadStage } from '@domain/entities/lead';

const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

const STAGE_COLORS: Record<LeadStage, string> = {
  new: 'bg-blue-600',
  contacted: 'bg-yellow-600',
  qualified: 'bg-purple-600',
  proposal: 'bg-orange-600',
  won: 'bg-wa-green',
  lost: 'bg-gray-600',
};

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    phone: string;
    stage: LeadStage;
    score?: number;
    chatId: string;
  };
  onStageChange: (leadId: string, stage: LeadStage) => void;
  onSetReminder: (lead: { id: string; chatId: string; name: string }) => void;
  onToggleAutoReply: (chatId: string, enabled: boolean) => void;
}

const NEXT_STAGES: Partial<Record<LeadStage, LeadStage>> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'proposal',
  proposal: 'won',
};

export function LeadCard({ lead, onStageChange, onSetReminder, onToggleAutoReply }: LeadCardProps) {
  const nextStage = NEXT_STAGES[lead.stage];

  return (
    <div className="rounded-lg border border-wa-border bg-wa-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-wa-text">{lead.name}</h3>
          <p className="text-sm text-wa-muted">{lead.phone}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs text-white ${STAGE_COLORS[lead.stage]}`}>
          {STAGE_LABELS[lead.stage]}
        </span>
      </div>

      {lead.score !== undefined && (
        <p className="mt-2 text-xs text-wa-muted">Score: {lead.score}/100</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {nextStage && (
          <button
            type="button"
            onClick={() => onStageChange(lead.id, nextStage)}
            className="rounded bg-wa-green px-2 py-1 text-xs font-medium text-white hover:opacity-90"
          >
            → {STAGE_LABELS[nextStage]}
          </button>
        )}
        <button
          type="button"
          onClick={() => onSetReminder(lead)}
          className="rounded border border-wa-border px-2 py-1 text-xs text-wa-text hover:bg-wa-border"
        >
          Remind
        </button>
        <button
          type="button"
          onClick={() => onToggleAutoReply(lead.chatId, true)}
          className="rounded border border-wa-border px-2 py-1 text-xs text-wa-text hover:bg-wa-border"
        >
          AI Reply
        </button>
      </div>
    </div>
  );
}
