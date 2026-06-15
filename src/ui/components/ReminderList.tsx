interface ReminderListProps {
  reminders: Array<{
    id: string;
    title: string;
    dueAt: number;
    leadId: string;
    chatId: string;
  }>;
  loading: boolean;
  onDismiss: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

function formatDue(dueAt: number): string {
  const date = new Date(dueAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ReminderList({ reminders, loading, onDismiss, onSnooze }: ReminderListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-wa-green border-t-transparent" />
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="crm-card border-dashed text-center">
        <p className="text-sm text-wa-muted">No pending reminders</p>
      </div>
    );
  }

  const sorted = [...reminders].sort((a, b) => a.dueAt - b.dueAt);

  return (
    <div className="space-y-3">
      {sorted.map((reminder) => {
        const overdue = reminder.dueAt < Date.now();
        return (
          <div
            key={reminder.id}
            className={`crm-card ${overdue ? 'border-wa-danger/50 bg-wa-danger/5' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-wa-text">{reminder.title}</p>
                <p className={`mt-0.5 text-xs ${overdue ? 'text-wa-danger' : 'text-wa-muted'}`}>
                  {overdue ? 'Overdue · ' : ''}
                  {formatDue(reminder.dueAt)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onSnooze(reminder.id, 15)} className="crm-btn-secondary">
                +15m
              </button>
              <button type="button" onClick={() => onSnooze(reminder.id, 60)} className="crm-btn-secondary">
                +1h
              </button>
              <button
                type="button"
                onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                className="crm-btn-secondary"
              >
                Open WA
              </button>
              <button type="button" onClick={() => onDismiss(reminder.id)} className="crm-btn-danger ml-auto">
                Done
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
