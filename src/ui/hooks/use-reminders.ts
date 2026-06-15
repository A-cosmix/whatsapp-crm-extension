import { useCallback, useEffect, useState } from 'react';
import { MessageTypes } from '@domain/messages';
import { onRuntimeMessage, sendRuntimeMessage } from '../lib/messaging';

export interface ReminderView {
  id: string;
  leadId: string;
  title: string;
  dueAt: number;
  status: string;
  chatId: string;
}

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = await sendRuntimeMessage<{ reminders: ReminderView[] }>('GET_STATE');
      setReminders(state.reminders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onRuntimeMessage<{ reminders: ReminderView[] }>(
      MessageTypes.REMINDERS_SYNC,
      (payload) => setReminders(payload.reminders),
    );
    return unsub;
  }, [refresh]);

  const createReminder = async (input: {
    leadId: string;
    chatId: string;
    title: string;
    dueAt: number;
    note?: string;
  }) => {
    await sendRuntimeMessage('CREATE_REMINDER', input);
    await refresh();
  };

  const dismissReminder = async (reminderId: string) => {
    await sendRuntimeMessage('DISMISS_REMINDER', { reminderId });
    await refresh();
  };

  return { reminders, loading, refresh, createReminder, dismissReminder };
}
