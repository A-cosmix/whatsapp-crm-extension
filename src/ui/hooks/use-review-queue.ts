import { useCallback, useEffect, useState } from 'react';
import { MessageTypes } from '@domain/messages';
import { onRuntimeMessage, sendRuntimeMessage } from '../lib/messaging';

export interface ReviewItemView {
  id: string;
  chatId: string;
  prospectMessage: string;
  draftMessage: string;
  reason: string;
  confidence: number;
  status: string;
  createdAt: number;
}

export function useReviewQueue() {
  const [items, setItems] = useState<ReviewItemView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await sendRuntimeMessage<{ reviewQueue: ReviewItemView[] }>('GET_STATE');
      setItems(state.reviewQueue ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onRuntimeMessage<{ items?: ReviewItemView[] }>(
      MessageTypes.REVIEW_QUEUE_SYNC,
      (payload) => {
        if (payload.items) setItems(payload.items);
        else refresh();
      },
    );
    return unsub;
  }, [refresh]);

  const approve = async (itemId: string) => {
    await sendRuntimeMessage('APPROVE_REVIEW', { itemId });
    await refresh();
  };

  const reject = async (itemId: string) => {
    await sendRuntimeMessage('REJECT_REVIEW', { itemId });
    await refresh();
  };

  return { items, loading, approve, reject };
}
