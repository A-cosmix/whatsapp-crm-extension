interface ReminderListProps {
  reminders: Array<{
    id: string;
    title: string;
    dueAt: number;
    leadId: string;
  }>;
  loading: boolean;
  onDismiss: (id: string) => void;
}

function formatDue(dueAt: number): string {
  const date = new Date(dueAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReminderList({ reminders, loading, onDismiss }: ReminderListProps) {
  if (loading) {
    return <p className="text-sm text-wa-muted">Loading reminders...</p>;
  }

  if (reminders.length === 0) {
    return (
      <p className="text-sm text-wa-muted">No pending reminders.</p>
    );
  }

  const sorted = [...reminders].sort((a, b) => a.dueAt - b.dueAt);

  return (
    <div className="space-y-2">
      {sorted.map((reminder) => {
        const overdue = reminder.dueAt < Date.now();
        return (
          <div
            key={reminder.id}
            className={`rounded-lg border p-3 ${
              overdue ? 'border-red-500 bg-red-950/30' : 'border-wa-border bg-wa-surface'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{reminder.title}</p>
                <p className={`text-xs ${overdue ? 'text-red-400' : 'text-wa-muted'}`}>
                  {overdue ? 'Overdue · ' : ''}
                  {formatDue(reminder.dueAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(reminder.id)}
                className="text-xs text-wa-muted hover:text-wa-text"
              >
                Done
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
