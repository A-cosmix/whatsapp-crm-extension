import { useCallback, useEffect, useState } from 'react';
import { MessageTypes } from '@domain/messages';
import { onRuntimeMessage, sendRuntimeMessage } from '../lib/messaging';

export interface CampaignView {
  id: string;
  name: string;
  template: string;
  status: string;
  sentCount: number;
  failedCount: number;
  createdAt: number;
  dailyCap: number;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await sendRuntimeMessage<{ campaigns: CampaignView[] }>('GET_STATE');
      setCampaigns(state.campaigns ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onRuntimeMessage<{ campaigns: CampaignView[] }>(
      MessageTypes.CAMPAIGNS_SYNC,
      (payload) => {
        if (payload.campaigns) setCampaigns(payload.campaigns);
        else refresh();
      },
    );
    return unsub;
  }, [refresh]);

  const createCampaign = async (input: {
    name: string;
    template: string;
    leadIds: string[];
  }) => {
    await sendRuntimeMessage('CREATE_CAMPAIGN', input);
    await refresh();
  };

  const pauseCampaign = async (campaignId: string) => {
    await sendRuntimeMessage('PAUSE_CAMPAIGN', { campaignId });
    await refresh();
  };

  const cancelCampaign = async (campaignId: string) => {
    await sendRuntimeMessage('CANCEL_CAMPAIGN', { campaignId });
    await refresh();
  };

  return { campaigns, loading, createCampaign, pauseCampaign, cancelCampaign };
}
