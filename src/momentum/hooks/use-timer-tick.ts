import { useEffect } from 'react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { TimerState } from '../types';

export function useTimerTick(timer: TimerState | undefined, onUpdate: (t: TimerState) => void) {
  useEffect(() => {
    if (!timer?.isRunning || !timer.startedAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timer.startedAt!) / 1000);
      const total = timer.remaining + elapsed;
      const baseTotal = timer.remaining;
      const remaining = Math.max(0, baseTotal - (elapsed % (baseTotal + 1)));

      // Recalculate from startedAt
      const settings = timer;
      const currentRemaining = Math.max(0, timer.remaining - elapsed);
      
      if (currentRemaining <= 0) {
        onUpdate({ ...timer, remaining: 0, isRunning: false, startedAt: null });
        sendMessage(MessageTypes.UPDATE_TIMER, { ...timer, remaining: 0, isRunning: false, startedAt: null });
      } else if (currentRemaining !== timer.remaining) {
        onUpdate({ ...timer, remaining: currentRemaining });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.isRunning, timer?.startedAt, timer?.remaining]);
}
