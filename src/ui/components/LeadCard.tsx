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
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  contacted: 'bg-wa-warning/20 text-wa-warning border-wa-warning/30',
  qualified: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  proposal: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  won: 'bg-wa-green/20 text-wa-green border-wa-green/30',
  lost: 'bg-gray-500/20 text-wa-muted border-gray-500/30',
};

const NEXT_STAGES: Partial<Record<LeadStage, LeadStage>> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'proposal',
  proposal: 'won',
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
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export function LeadCard({
  lead,
  onStageChange,
  onSetReminder,
  onToggleAutoReply,
  selected,
  onSelect,
}: LeadCardProps) {
  const nextStage = NEXT_STAGES[lead.stage];

  return (
    <div
      className={`crm-card transition-all hover:border-wa-green/30 ${
        selected ? 'border-wa-green/50 shadow-glow' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(lead.id)}
            className="mt-1 accent-wa-green"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-wa-text">{lead.name}</h3>
              <p className="text-xs text-wa-muted">{lead.phone}</p>
            </div>
            <span className={`crm-badge border ${STAGE_COLORS[lead.stage]}`}>
              {STAGE_LABELS[lead.stage]}
            </span>
          </div>

          {lead.score !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-dark-hover">
                <div
                  className="h-1.5 rounded-full bg-wa-green"
                  style={{ width: `${lead.score}%` }}
                />
              </div>
              <span className="text-xs text-wa-muted">{lead.score}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {nextStage && (
              <button type="button" onClick={() => onStageChange(lead.id, nextStage)} className="crm-btn-primary !py-1.5 !text-xs">
                → {STAGE_LABELS[nextStage]}
              </button>
            )}
            <button type="button" onClick={() => onSetReminder(lead)} className="crm-btn-secondary">
              Remind
            </button>
            <button type="button" onClick={() => onToggleAutoReply(lead.chatId, true)} className="crm-btn-secondary">
              AI Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
