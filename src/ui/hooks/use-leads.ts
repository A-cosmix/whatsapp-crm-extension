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
}

export function useLeads() {
  const [leads, setLeads] = useState<LeadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const createLead = async (input: {
    phone: string;
    name: string;
    chatId: string;
  }) => {
    await sendRuntimeMessage('CREATE_LEAD', input);
    await refresh();
  };

  const updateStage = async (leadId: string, stage: LeadStage) => {
    await sendRuntimeMessage('UPDATE_LEAD_STAGE', { leadId, stage });
    await refresh();
  };

  return { leads, loading, error, refresh, createLead, updateStage };
}
