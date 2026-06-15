import { useCallback, useEffect, useState } from 'react';
import { MessageTypes } from '@domain/messages';
import type { AIConfig } from '@domain/messages';
import type { CrmSyncConfig } from '@domain/services/crm-sync.interface';
import { onRuntimeMessage, sendRuntimeMessage } from '../lib/messaging';

export function useSettings() {
  const [ai, setAi] = useState<AIConfig | null>(null);
  const [crm, setCrm] = useState<CrmSyncConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await sendRuntimeMessage<{
        settings: { ai: AIConfig; crm: CrmSyncConfig };
      }>('GET_STATE');
      setAi(state.settings?.ai ?? null);
      setCrm(state.settings?.crm ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onRuntimeMessage(MessageTypes.SETTINGS_UPDATED, () => refresh());
    return unsub;
  }, [refresh]);

  const saveAI = async (config: Partial<AIConfig>) => {
    const updated = await sendRuntimeMessage<AIConfig>('UPDATE_AI_CONFIG', config);
    setAi(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveCrm = async (config: CrmSyncConfig) => {
    await sendRuntimeMessage('UPDATE_CRM_SYNC', config);
    setCrm(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return { ai, crm, loading, saved, saveAI, saveCrm };
}
