import { useState } from 'react';
import { useLeads } from '@ui/hooks/use-leads';
import { useReminders } from '@ui/hooks/use-reminders';
import { LeadList } from '@ui/components/LeadList';
import { ReminderList } from '@ui/components/ReminderList';
import { sendRuntimeMessage } from '@ui/lib/messaging';

type Tab = 'leads' | 'reminders' | 'settings';

export function App() {
  const [tab, setTab] = useState<Tab>('leads');
  const { leads, loading, createLead, updateStage } = useLeads();
  const { reminders, loading: remindersLoading, createReminder, dismissReminder } = useReminders();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [chatId, setChatId] = useState('');

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !chatId) return;
    await createLead({ name, phone, chatId });
    setName('');
    setPhone('');
    setChatId('');
  };

  const handleSetReminder = async (lead: { id: string; chatId: string; name: string }) => {
    const dueAt = Date.now() + 24 * 60 * 60 * 1000;
    await createReminder({
      leadId: lead.id,
      chatId: lead.chatId,
      title: `Follow up with ${lead.name}`,
      dueAt,
    });
    setTab('reminders');
  };

  const handleToggleAutoReply = async (chatId: string, enabled: boolean) => {
    await sendRuntimeMessage('TOGGLE_AUTO_REPLY', { chatId, enabled });
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-wa-border bg-wa-dark px-4 py-3">
        <h1 className="text-lg font-semibold text-wa-green">WhatsApp CRM</h1>
        <p className="text-xs text-wa-muted">Leads · Reminders · AI Auto-Reply</p>
      </header>

      <nav className="flex border-b border-wa-border">
        {(['leads', 'reminders', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm capitalize ${
              tab === t
                ? 'border-b-2 border-wa-green text-wa-green'
                : 'text-wa-muted hover:text-wa-text'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'leads' && (
          <div className="space-y-4">
            <form onSubmit={handleCreateLead} className="space-y-2 rounded-lg border border-wa-border bg-wa-surface p-3">
              <h2 className="text-sm font-medium">Add Lead</h2>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-wa-border bg-wa-panel px-3 py-2 text-sm text-wa-text placeholder:text-wa-muted"
              />
              <input
                type="tel"
                placeholder="Phone (+91...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded border border-wa-border bg-wa-panel px-3 py-2 text-sm text-wa-text placeholder:text-wa-muted"
              />
              <input
                type="text"
                placeholder="Chat ID (e.g. contact_name)"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full rounded border border-wa-border bg-wa-panel px-3 py-2 text-sm text-wa-text placeholder:text-wa-muted"
              />
              <button
                type="submit"
                className="w-full rounded bg-wa-green py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Save Lead
              </button>
            </form>

            <LeadList
              leads={leads}
              loading={loading}
              onStageChange={updateStage}
              onSetReminder={handleSetReminder}
              onToggleAutoReply={handleToggleAutoReply}
            />
          </div>
        )}

        {tab === 'reminders' && (
          <ReminderList
            reminders={reminders}
            loading={remindersLoading}
            onDismiss={dismissReminder}
          />
        )}

        {tab === 'settings' && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-wa-border bg-wa-surface p-3">
              <h2 className="font-medium">AI Auto-Reply</h2>
              <p className="mt-1 text-wa-muted">
                Requires Ollama running at <code className="text-wa-green">localhost:11434</code>
              </p>
              <p className="mt-2 text-xs text-wa-muted">
                Model: llama3.2:3b · Confidence threshold: 0.75
              </p>
            </div>
            <div className="rounded-lg border border-wa-border bg-wa-surface p-3">
              <h2 className="font-medium">Safety</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-wa-muted">
                <li>Bulk send daily cap: 50 messages</li>
                <li>Auto-reply delay: 2–5 seconds</li>
                <li>Groups excluded by default</li>
                <li>Low-confidence replies queued for review</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
