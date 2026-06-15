import { useState } from 'react';
import { useLeads } from '@ui/hooks/use-leads';
import { useReminders } from '@ui/hooks/use-reminders';
import { useCampaigns } from '@ui/hooks/use-campaigns';
import { useReviewQueue } from '@ui/hooks/use-review-queue';
import { useSettings } from '@ui/hooks/use-settings';
import { LeadList } from '@ui/components/LeadList';
import { ReminderList } from '@ui/components/ReminderList';
import { CampaignList, CampaignBuilder } from '@ui/components/CampaignPanel';
import { ReviewQueuePanel } from '@ui/components/ReviewQueuePanel';
import { SettingsPanel } from '@ui/components/SettingsPanel';
import { sendRuntimeMessage } from '@ui/lib/messaging';

type Tab = 'leads' | 'campaigns' | 'reminders' | 'review' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'leads', label: 'Leads', icon: '👤' },
  { id: 'campaigns', label: 'Bulk', icon: '📤' },
  { id: 'reminders', label: 'Remind', icon: '⏰' },
  { id: 'review', label: 'Review', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('leads');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureLoading, setCaptureLoading] = useState(false);

  const {
    leads,
    loading,
    error,
    search,
    setSearch,
    createLead,
    captureFromChat,
    updateStage,
  } = useLeads();

  const { reminders, loading: remindersLoading, createReminder, dismissReminder, snoozeReminder } =
    useReminders();

  const { campaigns, loading: campaignsLoading, createCampaign, pauseCampaign, cancelCampaign } =
    useCampaigns();

  const { items: reviewItems, loading: reviewLoading, approve, reject } = useReviewQueue();

  const { ai, crm, loading: settingsLoading, saved, saveAI, saveCrm } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [chatId, setChatId] = useState('');

  const toggleLeadSelect = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCapture = async () => {
    setCaptureError(null);
    setCaptureLoading(true);
    try {
      await captureFromChat();
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Capture failed');
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !chatId) return;
    await createLead({ name, phone, chatId });
    setName('');
    setPhone('');
    setChatId('');
  };

  const handleSetReminder = async (lead: { id: string; chatId: string; name: string }) => {
    await createReminder({
      leadId: lead.id,
      chatId: lead.chatId,
      title: `Follow up with ${lead.name}`,
      dueAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    setTab('reminders');
  };

  const handleToggleAutoReply = async (chatId: string, enabled: boolean) => {
    await sendRuntimeMessage('TOGGLE_AUTO_REPLY', { chatId, enabled });
  };

  const reviewCount = reviewItems.length;

  return (
    <div className="flex h-screen flex-col bg-dark-bg">
      <header className="border-b border-dark-border bg-dark-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wa-green/20 text-sm">
            💬
          </div>
          <div>
            <h1 className="text-base font-semibold text-wa-text">WhatsApp CRM</h1>
            <p className="text-[10px] text-wa-muted">Leads · Bulk · AI · Reminders</p>
          </div>
        </div>
      </header>

      <nav className="flex border-b border-dark-border bg-dark-panel">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
              tab === t.id ? 'text-wa-green' : 'text-wa-muted hover:text-wa-text'
            }`}
          >
            <span className="text-sm">{t.icon}</span>
            {t.label}
            {t.id === 'review' && reviewCount > 0 && (
              <span className="absolute right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wa-danger text-[9px] text-white">
                {reviewCount}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-wa-green" />
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4">
        {tab === 'leads' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCapture}
              disabled={captureLoading}
              className="crm-btn-primary w-full"
            >
              {captureLoading ? 'Capturing...' : '📲 Capture Lead from Active Chat'}
            </button>
            {captureError && (
              <p className="rounded-lg border border-wa-danger/30 bg-wa-danger/10 px-3 py-2 text-xs text-wa-danger">
                {captureError}
              </p>
            )}
            {error && (
              <p className="rounded-lg border border-wa-danger/30 bg-wa-danger/10 px-3 py-2 text-xs text-wa-danger">
                {error}
              </p>
            )}

            <input
              type="search"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="crm-input"
            />

            <details className="crm-card group">
              <summary className="cursor-pointer text-sm font-medium text-wa-text">
                + Add Lead Manually
              </summary>
              <form onSubmit={handleCreateLead} className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="crm-input"
                />
                <input
                  type="tel"
                  placeholder="Phone (+91...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="crm-input"
                />
                <input
                  type="text"
                  placeholder="Chat ID"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="crm-input"
                />
                <button type="submit" className="crm-btn-secondary w-full">
                  Save Lead
                </button>
              </form>
            </details>

            <LeadList
              leads={leads}
              loading={loading}
              onStageChange={updateStage}
              onSetReminder={handleSetReminder}
              onToggleAutoReply={handleToggleAutoReply}
              selectedIds={selectedLeadIds}
              onSelect={toggleLeadSelect}
            />
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-4">
            <CampaignBuilder
              selectedLeadIds={[...selectedLeadIds]}
              onCreate={createCampaign}
            />
            {selectedLeadIds.size === 0 && (
              <p className="text-center text-xs text-wa-muted">
                Select leads in the Leads tab to create a campaign
              </p>
            )}
            <CampaignList
              campaigns={campaigns}
              loading={campaignsLoading}
              onPause={pauseCampaign}
              onCancel={cancelCampaign}
            />
          </div>
        )}

        {tab === 'reminders' && (
          <ReminderList
            reminders={reminders}
            loading={remindersLoading}
            onDismiss={dismissReminder}
            onSnooze={snoozeReminder}
          />
        )}

        {tab === 'review' && (
          <ReviewQueuePanel
            items={reviewItems}
            loading={reviewLoading}
            onApprove={approve}
            onReject={reject}
          />
        )}

        {tab === 'settings' && (
          <SettingsPanel
            ai={ai}
            crm={crm}
            loading={settingsLoading}
            saved={saved}
            onSaveAI={saveAI}
            onSaveCrm={saveCrm}
          />
        )}
      </main>
    </div>
  );
}
