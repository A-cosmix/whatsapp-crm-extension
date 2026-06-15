import { useCallback, useEffect, useState } from 'react';
import { MessageTypes } from '@domain/messages';
import type { LeadStage } from '@domain/entities/lead';
import { onRuntimeMessage, sendRuntimeMessage } from '../lib/messaging';

export interface LeadView {
  id: string;
  phone: string;
  name: string;
  stage: LeadStage;
  chatId: string;
  tags: string[];
  updatedAt: number;
  score?: number;
  autoReplyEnabled?: boolean;
}

export function useLeads() {
  const [leads, setLeads] = useState<LeadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await sendRuntimeMessage<{ leads: LeadView[] }>('GET_STATE');
      setLeads(state.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onRuntimeMessage<{ leads: LeadView[] }>(MessageTypes.LEADS_SYNC, (payload) => {
      setLeads(payload.leads);
    });
    return unsub;
  }, [refresh]);

  const createLead = async (input: { phone: string; name: string; chatId: string }) => {
    await sendRuntimeMessage('CREATE_LEAD', input);
    await refresh();
  };

  const captureFromChat = async () => {
    await sendRuntimeMessage('CAPTURE_LEAD_FROM_CHAT');
    await refresh();
  };

  const updateStage = async (leadId: string, stage: LeadStage) => {
    await sendRuntimeMessage('UPDATE_LEAD_STAGE', { leadId, stage });
    await refresh();
  };

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.stage.includes(search.toLowerCase()),
  );

  return { leads: filtered, allLeads: leads, loading, error, search, setSearch, refresh, createLead, captureFromChat, updateStage };
}
