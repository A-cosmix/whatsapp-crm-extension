import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useFocusTimer } from '../hooks/use-timer';
import type { TimerState } from '../types';

interface FocusTimerProps {
  timer: TimerState;
  focusDuration: number;
  breakDuration: number;
}

export function FocusTimer({ timer: initialTimer, focusDuration, breakDuration }: FocusTimerProps) {
  const [timer, setTimer] = useState(initialTimer);

  useEffect(() => {
    setTimer(initialTimer);
  }, [initialTimer]);

  useEffect(() => {
    if (!timer.isRunning || !timer.startedAt) return;

    const interval = setInterval(() => {
      const total = (timer.isBreak ? breakDuration : focusDuration) * 60;
      const elapsed = Math.floor((Date.now() - timer.startedAt!) / 1000);
      const remaining = Math.max(0, total - elapsed);
      setTimer((t) => ({ ...t, remaining }));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startedAt, timer.isBreak, focusDuration, breakDuration]);

  const { start, pause, reset, toggleBreak, formatTime } = useFocusTimer(
    timer,
    focusDuration,
    breakDuration,
  );

  const progress = timer.isBreak
    ? 1 - timer.remaining / (breakDuration * 60)
    : 1 - timer.remaining / (focusDuration * 60);

  return (
    <div className="mx-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="mx-label">Focus Timer</p>
          <p className="text-sm opacity-60">{timer.isBreak ? 'Break Time' : 'Deep Work'}</p>
        </div>
        <button type="button" onClick={toggleBreak} className="mx-btn-ghost px-2 py-1.5 text-xs" title="Toggle break">
          <Coffee size={14} />
        </button>
      </div>

      <div className="relative w-36 h-36 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--mx-border)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--mx-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 283} 283`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{formatTime(timer.remaining)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {timer.isRunning ? (
          <button type="button" onClick={pause} className="mx-btn-primary">
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button type="button" onClick={start} className="mx-btn-primary">
            <Play size={16} /> Start
          </button>
        )}
        <button type="button" onClick={reset} className="mx-btn-ghost">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
