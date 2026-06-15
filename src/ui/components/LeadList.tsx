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
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
}

export function LeadList({
  leads,
  loading,
  onStageChange,
  onSetReminder,
  onToggleAutoReply,
  selectedIds,
  onSelect,
}: LeadListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-wa-green border-t-transparent" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="crm-card border-dashed text-center">
        <p className="text-sm text-wa-muted">No leads found</p>
        <p className="mt-1 text-xs text-wa-muted">Capture from WhatsApp or add manually</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onStageChange={onStageChange}
          onSetReminder={onSetReminder}
          onToggleAutoReply={onToggleAutoReply}
          selected={selectedIds?.has(lead.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
