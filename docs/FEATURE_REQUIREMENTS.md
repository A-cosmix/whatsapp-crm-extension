# Feature Technical Requirements — WhatsApp CRM Extension

> ऑटो-रिप्लाई, लीड मैनेजमेंट, बल्क फॉलो-अप, रिमाइंडर्स

---

## F1: Auto-Reply (AI-Powered)

### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F1.1 | Per-chat enable/disable toggle for auto-reply | P0 |
| F1.2 | Detect incoming messages via DOM/Store observer | P0 |
| F1.3 | Batch rapid messages (debounce 3–5s) before responding | P0 |
| F1.4 | Generate reply using configured LLM provider | P0 |
| F1.5 | Support Hindi, English, Hinglish responses | P1 |
| F1.6 | Configurable reply delay (simulate human typing) | P0 |
| F1.7 | Exclude groups / broadcast lists (configurable) | P1 |
| F1.8 | Business hours gate (only auto-reply 9am–6pm) | P2 |
| F1.9 | Human review queue for low-confidence replies | P1 |
| F1.10 | Custom system prompt per lead stage | P1 |

### Technical Architecture

```
Message Detected (content script)
    → Debounce timer (3-5s)
    → Collect last N messages (default: 20)
    → Build AgentHandoff<ConversationContext>
    → Send to Service Worker
    → Reply-Triage Agent: classify intent
    → If auto-reply eligible:
        → Outreach/Reply Agent: generate draft
        → Confidence check (threshold: 0.75)
        → If pass: inject + send via WhatsApp adapter
        → If fail: add to review queue
    → Log to ai_audit_log
```

### Data Models

```typescript
interface AutoReplyConfig {
  chatId: string;
  enabled: boolean;
  systemPrompt?: string;
  maxHistoryMessages: number;    // default 20
  minDelayMs: number;            // default 2000
  maxDelayMs: number;            // default 5000
  confidenceThreshold: number;   // default 0.75
  businessHours?: { start: string; end: string; timezone: string };
  excludeGroups: boolean;
}

interface ConversationMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'prospect';
  text: string;
  timestamp: number;
  provenance: 'dom' | 'store';
}
```

### Non-Functional Requirements

| Metric | Target |
|---|---|
| Reply generation latency | < 5s (Ollama 3B) / < 2s (cloud) |
| Message detection latency | < 500ms from DOM mutation |
| False auto-reply rate | < 2% (with triage agent) |
| Uptime during WhatsApp session | 99% (reconnect on SW restart) |

### Dependencies

- `IWhatsAppAdapter` — read/send messages
- `ILLMProvider` — generate replies
- `IReplyTriageAgent` — intent classification
- `IAutoReplyRepository` — per-chat config storage
- `chrome.alarms` — business hours check

---

## F2: Lead Management

### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F2.1 | Auto-capture leads from new WhatsApp conversations | P0 |
| F2.2 | Manual lead creation from current chat | P0 |
| F2.3 | Lead stages: New → Contacted → Qualified → Proposal → Won/Lost | P0 |
| F2.4 | Tags, notes, custom fields per lead | P0 |
| F2.5 | AI lead scoring (0–100) with rationale | P1 |
| F2.6 | Search and filter leads (name, phone, stage, tag) | P0 |
| F2.7 | Lead assignment to team member (multi-user backend) | P2 |
| F2.8 | Import/export CSV | P1 |
| F2.9 | Sync to external CRM (HubSpot, Zoho) | P2 |
| F2.10 | Conversation history linked to lead | P0 |

### Technical Architecture

```
New Chat Detected / Manual Action
    → LeadCaptureUseCase
    → Extract: phone, name, profile pic URL, first message
    → Deduplicate by phone number (E.164 normalized)
    → Create Lead entity in IndexedDB
    → Optional: Lead-Scoring Agent async job
    → Update side panel UI via message bus

Lead Stage Change
    → UpdateLeadStageUseCase
    → Validate stage transition (FSM)
    → Trigger stage-specific automations (e.g., Proposal → send template)
    → Queue CRM sync if configured
```

### Data Models

```typescript
type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

interface Lead {
  id: string;
  phone: string;              // E.164 format
  name: string;
  stage: LeadStage;
  score?: number;             // 0-100
  scoreRationale?: string;
  tags: string[];
  notes: string;
  customFields: Record<string, string>;
  chatId: string;             // WhatsApp chat ID
  source: 'whatsapp' | 'import' | 'manual';
  createdAt: number;
  updatedAt: number;
  lastContactedAt?: number;
  assignedTo?: string;
}

// Valid stage transitions (Finite State Machine)
const STAGE_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: [],
};
```

### Storage

- **Primary:** IndexedDB via Dexie (`leads` table)
- **Indexes:** `phone`, `stage`, `tags`, `updatedAt`
- **Quota management:** Archive leads older than 1 year to compressed export

### UI Components

- Lead list (side panel) with virtualized scroll
- Lead detail card with timeline
- Quick actions: change stage, add note, enable auto-reply
- Kanban view (optional P2)

---

## F3: Bulk Follow-Up

### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F3.1 | Create campaign with recipient list + message template | P0 |
| F3.2 | Template variables: `{{name}}`, `{{company}}`, `{{custom_field}}` | P0 |
| F3.3 | Schedule campaign start date/time | P0 |
| F3.4 | Random delay between messages (min/max configurable) | P0 |
| F3.5 | Daily send cap (default: 50 messages/day) | P0 |
| F3.6 | Pause / resume / cancel campaign | P0 |
| F3.7 | Skip if lead already replied since campaign creation | P1 |
| F3.8 | Multi-step sequences (Day 1, Day 3, Day 7) | P1 |
| F3.9 | Campaign analytics (sent, delivered, replied, failed) | P1 |
| F3.10 | AI-personalized message per lead (optional) | P2 |

### Technical Architecture

```
Campaign Created
    → Validate recipients (dedupe, opt-out check)
    → Store in campaigns + campaign_recipients tables
    → Schedule chrome.alarm for start time

Alarm Fires (service worker)
    → CampaignExecutorUseCase
    → Pick next pending recipient (FIFO)
    → Check daily cap
    → Personalize message (template engine / AI)
    → Send via IWhatsAppAdapter
    → Update recipient status: sent | failed | skipped
    → Schedule next alarm with random delay
    → If campaign complete: notify user

Safety Guards
    → MAX_DAILY_SENDS = 50 (configurable)
    → MIN_DELAY_MS = 3000, MAX_DELAY_MS = 8000
    → Abort if WhatsApp session disconnected
    → Abort if user manually pauses
```

### Data Models

```typescript
interface Campaign {
  id: string;
  name: string;
  template: string;           // with {{variables}}
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduledAt?: number;
  createdAt: number;
  dailyCap: number;
  minDelayMs: number;
  maxDelayMs: number;
  steps?: CampaignStep[];     // multi-step sequences
}

interface CampaignRecipient {
  id: string;
  campaignId: string;
  leadId: string;
  phone: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped' | 'replied';
  sentAt?: number;
  error?: string;
  personalizedMessage?: string;
}

interface CampaignStep {
  stepNumber: number;
  delayDays: number;          // days after previous step
  template: string;
}
```

### Critical Safety Requirements

> **WhatsApp account ban risk is highest here.** Implement aggressively.

- Hard cap: 50 messages/day default
- Random jitter: 3–8 seconds between sends
- Never send to contacts who haven't messaged first (unless user explicitly overrides with consent flag)
- Detect "blocked" or "not on WhatsApp" errors and skip
- Campaign state must survive service worker restarts (persist in IndexedDB)

---

## F4: Reminders

### Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F4.1 | Set reminder on any lead ("follow up tomorrow 10am") | P0 |
| F4.2 | Natural language input ("remind me in 2 days") | P2 |
| F4.3 | Chrome notification when reminder fires | P0 |
| F4.4 | Snooze reminder (15min, 1hr, tomorrow) | P1 |
| F4.5 | Recurring reminders (weekly check-in) | P2 |
| F4.6 | Auto-create reminder on stage change (configurable) | P1 |
| F4.7 | Reminder list view with overdue highlighting | P0 |
| F4.8 | Click reminder → open WhatsApp chat | P0 |

### Technical Architecture

```
Create Reminder
    → CreateReminderUseCase
    → Parse dueAt timestamp
    → Store in reminders table (IndexedDB)
    → Register chrome.alarm with name: `reminder:{id}`

Alarm Fires
    → ReminderHandler in service worker
    → Show chrome.notifications.create()
    → Update reminder status: 'fired'
    → Optional: pre-fill message in WhatsApp input

Snooze
    → Update dueAt, re-register alarm
```

### Data Models

```typescript
interface Reminder {
  id: string;
  leadId: string;
  chatId: string;
  title: string;
  note?: string;
  dueAt: number;              // Unix timestamp
  status: 'pending' | 'fired' | 'snoozed' | 'dismissed';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: number;
  snoozedUntil?: number;
}
```

### MV3 Alarm Strategy

```typescript
// Service worker must re-register alarms on startup
chrome.runtime.onStartup.addListener(async () => {
  const pending = await reminderRepo.findPending();
  for (const r of pending) {
    if (r.dueAt > Date.now()) {
      chrome.alarms.create(`reminder:${r.id}`, { when: r.dueAt });
    }
  }
});
```

---

## Cross-Feature Integration Matrix

| Feature | Reads From | Writes To | Triggers |
|---|---|---|---|
| Auto-Reply | conversations, auto_reply_config | conversations, ai_audit_log | New message |
| Lead Mgmt | WhatsApp contacts | leads | New chat, manual |
| Bulk Follow-Up | leads, campaigns | campaign_recipients | Alarm, schedule |
| Reminders | leads, reminders | reminders | Alarm, stage change |

---

## MVP Scope (Phase 1)

1. **Lead Management** — capture, stages, tags, search (F2.1–F2.6, F2.10)
2. **Reminders** — create, notify, list (F4.1, F4.3, F4.7, F4.8)
3. **Auto-Reply** — basic with Ollama, per-chat toggle (F1.1–F1.6)
4. **Bulk Follow-Up** — single-step with safety caps (F3.1–F3.6)

Phase 2: AI scoring, multi-step campaigns, CRM sync, WebLLM fallback.
