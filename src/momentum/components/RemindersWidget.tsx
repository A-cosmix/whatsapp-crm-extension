import { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { Reminder } from '../types';

interface RemindersWidgetProps {
  reminders: Reminder[];
}

export function RemindersWidget({ reminders }: RemindersWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [datetime, setDatetime] = useState('');

  const upcoming = reminders.filter((r) => !r.completed).sort((a, b) => a.scheduledAt - b.scheduledAt);

  const addReminder = async () => {
    if (!title.trim() || !datetime) return;
    await sendMessage(MessageTypes.ADD_REMINDER, {
      title: title.trim(),
      body: body.trim(),
      scheduledAt: new Date(datetime).getTime(),
    });
    setTitle('');
    setBody('');
    setDatetime('');
    setShowForm(false);
  };

  return (
    <div className="mx-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: 'var(--mx-accent)' }} />
          <p className="text-sm font-medium">Reminders</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="mx-btn-ghost px-2 py-1.5">
          <Plus size={14} />
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 mb-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mx-input text-xs" />
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Description" className="mx-input text-xs" />
          <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="mx-input text-xs" />
          <button type="button" onClick={addReminder} className="mx-btn-primary w-full text-xs py-2">Set Reminder</button>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {upcoming.length === 0 ? (
          <p className="text-xs opacity-40 text-center py-4">No upcoming reminders</p>
        ) : (
          upcoming.slice(0, 5).map((r) => (
            <div key={r.id} className="mx-glass rounded-lg p-2.5">
              <p className="text-sm font-medium">{r.title}</p>
              {r.body && <p className="text-xs opacity-40 mt-0.5">{r.body}</p>}
              <p className="text-[10px] opacity-30 mt-1">
                {new Date(r.scheduledAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
