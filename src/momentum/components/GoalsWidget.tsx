import { useState } from 'react';
import { Plus, Check, Trash2, Target } from 'lucide-react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { DailyGoal } from '../types';

interface GoalsWidgetProps {
  goals: DailyGoal[];
  target: number;
}

export function GoalsWidget({ goals, target }: GoalsWidgetProps) {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  const completed = goals.filter((g) => g.completed).length;

  const addGoal = async () => {
    if (!input.trim()) return;
    setAdding(true);
    try {
      await sendMessage(MessageTypes.ADD_GOAL, { text: input.trim() });
      setInput('');
    } finally {
      setAdding(false);
    }
  };

  const toggle = (id: string) => sendMessage(MessageTypes.TOGGLE_GOAL, { id });
  const remove = (id: string) => sendMessage(MessageTypes.DELETE_GOAL, { id });

  return (
    <div className="mx-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'var(--mx-accent)' }} />
          <p className="text-sm font-medium">Daily Goals</p>
        </div>
        <span className="text-xs opacity-50">{completed}/{target}</span>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--mx-border)] mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, (completed / target) * 100)}%`,
            background: 'var(--mx-accent)',
          }}
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto mb-3">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-2 group">
            <button
              type="button"
              onClick={() => toggle(goal.id)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                goal.completed ? 'border-transparent' : 'border-[var(--mx-border)]'
              }`}
              style={goal.completed ? { background: 'var(--mx-accent)' } : {}}
            >
              {goal.completed && <Check size={12} className="text-white" />}
            </button>
            <span className={`text-sm flex-1 ${goal.completed ? 'line-through opacity-40' : ''}`}>
              {goal.text}
            </span>
            <button
              type="button"
              onClick={() => remove(goal.id)}
              className="opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity p-1"
              aria-label="Delete goal"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-xs opacity-40 text-center py-4">No goals yet. Add your first one!</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a goal..."
          className="mx-input flex-1 text-xs"
          disabled={adding}
        />
        <button type="button" onClick={addGoal} disabled={adding || !input.trim()} className="mx-btn-primary px-3">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
