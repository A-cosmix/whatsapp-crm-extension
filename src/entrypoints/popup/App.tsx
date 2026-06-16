import { Bot, Timer, Target, FileText, Settings, PanelRight, Sparkles } from 'lucide-react';
import { useExtensionState } from '@momentum/hooks/use-extension-state';
import { MessageTypes, sendMessage } from '@momentum/lib/messages';
import { FocusTimer } from '@momentum/components/FocusTimer';

export function PopupApp() {
  const { state, loading } = useExtensionState();

  if (loading || !state) {
    return (
      <div className="w-[380px] h-[520px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--mx-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedGoals = state.goals.filter((g) => g.completed).length;

  return (
    <div className="w-[380px] min-h-[520px] p-4">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl mx-glass flex items-center justify-center">
            <Sparkles size={16} style={{ color: 'var(--mx-accent)' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold">Momentum <span style={{ color: 'var(--mx-accent)' }}>X</span></h1>
            <p className="text-[10px] opacity-40">Productivity Command Center</p>
          </div>
        </div>
        <a href="options.html" className="p-2 opacity-40 hover:opacity-80 transition-opacity" aria-label="Settings">
          <Settings size={16} />
        </a>
      </header>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: Target, label: 'Goals', value: `${completedGoals}/${state.settings.dailyGoalTarget}` },
          { icon: FileText, label: 'Notes', value: String(state.notes.length) },
          { icon: Timer, label: 'Focus', value: state.timer.isRunning ? 'Active' : 'Ready' },
          { icon: Bot, label: 'AI Chat', value: String(state.chatHistory.length) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="mx-glass rounded-xl p-3">
            <Icon size={14} className="mb-1 opacity-50" style={{ color: 'var(--mx-accent)' }} />
            <p className="text-[10px] opacity-40">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <FocusTimer
          timer={state.timer}
          focusDuration={state.settings.focusDuration}
          breakDuration={state.settings.breakDuration}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => sendMessage(MessageTypes.OPEN_SIDEPANEL)}
          className="mx-btn-primary flex-1"
        >
          <PanelRight size={16} /> Open AI Assistant
        </button>
        <a href="newtab.html" className="mx-btn-ghost flex-1 text-center">
          Dashboard
        </a>
      </div>
    </div>
  );
}
