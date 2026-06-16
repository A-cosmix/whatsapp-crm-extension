import { useCallback } from 'react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { TimerState } from '../types';

export function useFocusTimer(timer: TimerState | undefined, focusDuration: number, breakDuration: number) {
  const update = useCallback(async (partial: Partial<TimerState>) => {
    const current = timer ?? {
      isRunning: false,
      isBreak: false,
      remaining: focusDuration * 60,
      startedAt: null,
    };
    const updated = { ...current, ...partial };
    return sendMessage<TimerState>(MessageTypes.UPDATE_TIMER, updated);
  }, [timer, focusDuration, breakDuration]);

  const start = useCallback(async () => {
    const duration = (timer?.isBreak ? breakDuration : focusDuration) * 60;
    await update({ isRunning: true, remaining: duration, startedAt: Date.now() });
  }, [update, timer?.isBreak, focusDuration, breakDuration]);

  const pause = useCallback(async () => {
    await update({ isRunning: false, startedAt: null });
  }, [update]);

  const reset = useCallback(async () => {
    await update({
      isRunning: false,
      isBreak: false,
      remaining: focusDuration * 60,
      startedAt: null,
    });
  }, [update, focusDuration]);

  const toggleBreak = useCallback(async () => {
    const isBreak = !timer?.isBreak;
    const duration = (isBreak ? breakDuration : focusDuration) * 60;
    await update({ isBreak, remaining: duration, isRunning: false, startedAt: null });
  }, [update, timer?.isBreak, focusDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { start, pause, reset, toggleBreak, formatTime, update };
}
