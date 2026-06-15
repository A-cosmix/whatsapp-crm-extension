import type { LeadStage } from '@domain/entities/lead';
import { LeadCard } from './LeadCard';

interface LeadListProps {
  leads: Array<{
    id: string;
    name: string;
    phone: string;
    stage: LeadStage;
    score?: number;
    chatId: string;
  }>;
  loading: boolean;
  onStageChange: (leadId: string, stage: LeadStage) => void;
  onSetReminder: (lead: { id: string; chatId: string; name: string }) => void;
  onToggleAutoReply: (chatId: string, enabled: boolean) => void;
}

export function LeadList({
  leads,
  loading,
  onStageChange,
  onSetReminder,
  onToggleAutoReply,
}: LeadListProps) {
  if (loading) {
    return <p className="text-sm text-wa-muted">Loading leads...</p>;
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-wa-border p-6 text-center">
        <p className="text-sm text-wa-muted">No leads yet.</p>
        <p className="mt-1 text-xs text-wa-muted">Add a lead from the form above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onStageChange={onStageChange}
          onSetReminder={onSetReminder}
          onToggleAutoReply={onToggleAutoReply}
        />
      ))}
    </div>
  );
}
