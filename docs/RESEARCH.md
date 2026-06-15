# WhatsApp CRM Extension — Technology Research (2026)

> आधुनिक वेब तकनीकों का अनुसंधान: Chrome Extension MV3, AI Agents, Local LLM

## Executive Summary

A production-grade WhatsApp CRM Chrome Extension in 2026 requires a **thin-client extension + optional backend** architecture. WhatsApp Web has no official extension API — all automation relies on DOM observation, injected page scripts, and resilient state management via MV3 service workers. AI capabilities should be pluggable (cloud API, local Ollama, or in-browser WebLLM) with a supervisor-agent pattern for safe automation.

---

## 1. Chrome Extension Manifest V3 (MV3)

### 1.1 Core Constraints (Non-Negotiable)

| Constraint | Impact on WhatsApp CRM |
|---|---|
| **Service workers** replace background pages | No persistent in-memory state; use `chrome.storage`, IndexedDB, or backend |
| **No `eval()` / remote code** | All LLM inference code must be bundled at build time |
| **Stricter CSP** | No inline scripts; use bundled JS + `web_accessible_resources` |
| **`declarativeNetRequest`** replaces `webRequest` | Cannot intercept/modify WhatsApp network traffic programmatically |
| **Minimal permissions** | Scope to `https://web.whatsapp.com/*` only |

### 1.2 Recommended MV3 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Popup / Side Panel (React/Vue UI)                          │
│  — Lead dashboard, settings, campaign builder               │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.runtime.sendMessage
┌──────────────────────────▼──────────────────────────────────┐
│  Service Worker (background.ts)                             │
│  — Alarms, message routing, storage, API sync               │
│  — AI orchestration coordinator (supervisor)                │
└──────────────────────────┬──────────────────────────────────┘
                           │ chrome.tabs.sendMessage
┌──────────────────────────▼──────────────────────────────────┐
│  Content Script (isolated world)                            │
│  — DOM observer (MutationObserver)                          │
│  — UI injection (sidebar, labels, CRM panel)                │
│  — Message bridge to injected script                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ window.postMessage
┌──────────────────────────▼──────────────────────────────────┐
│  Injected Script (page world)                               │
│  — window.Store access (WhatsApp internal modules)          │
│  — Send message, read chats, contact metadata               │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Critical MV3 APIs for CRM

| API | Use Case |
|---|---|
| `chrome.storage.local` | Lead cache, settings, campaign state (10MB quota) |
| `chrome.storage.session` | Ephemeral per-session flags |
| `chrome.alarms` | Scheduled follow-ups, bulk campaign delays |
| `chrome.sidePanel` | Persistent CRM sidebar (Chrome 114+) |
| `chrome.runtime.onMessage` | Cross-context communication |
| `chrome.offscreen` | Long-running tasks (audio, DOM parsing) if needed |
| IndexedDB (via Dexie.js) | Large lead DB, conversation history, RAG vectors |

### 1.4 WhatsApp Web Integration Strategy

**Two approaches (use both with adapter pattern):**

1. **DOM-based (stable, limited):** Query `[data-testid]`, `role="textbox"`, dispatch `InputEvent` for typing. Works for reading visible messages and basic send.

2. **Store injection (powerful, brittle):** Inject script accessing `window.Store` (WhatsApp webpack modules). Enables programmatic send, contact list, chat metadata. Requires active maintenance when WhatsApp updates.

**Risk mitigation:**
- Abstract behind `IWhatsAppAdapter` interface
- Feature-flag Store injection; fallback to DOM
- Version-detection + graceful degradation
- Human-like delays (random jitter 2–8s) for bulk actions

### 1.5 Build Tooling (2026 Standard)

| Tool | Purpose |
|---|---|
| **Vite + CRXJS** or **WXT** | MV3 bundling with HMR |
| **TypeScript** | Type safety across contexts |
| **React 19** or **Preact** | Side panel / popup UI |
| **Zustand** or **Jotai** | Lightweight state in UI |
| **Vitest** | Unit tests for domain logic |
| **Playwright** | E2E against WhatsApp Web (mocked) |

---

## 2. AI Agents for CRM

### 2.1 Multi-Agent Pattern (2026 Industry Standard)

Replace monolithic "one prompt does everything" with **supervisor + specialists**:

```
                    ┌─────────────────┐
                    │  Supervisor     │
                    │  Agent          │
                    │  (orchestrator) │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Reply-Triage  │ │ Lead-Scoring  │ │ Outreach      │
   │ Agent         │ │ Agent         │ │ Agent         │
   └───────────────┘ └───────────────┘ └───────────────┘
```

### 2.2 Agent Responsibilities

| Agent | Input | Output | CRM Action |
|---|---|---|---|
| **Reply-Triage** | Incoming message text | Intent class + confidence | Route to human / auto-reply / nurture |
| **Lead-Scoring** | Contact metadata + history | Score 0–100 + rationale | Update lead stage |
| **Outreach** | Lead profile + templates | Personalized message draft | Queue for send |
| **Supervisor** | Agent proposals | Approved/rejected action | Execute writes only |

### 2.3 Handoff Contracts (Typed, Auditable)

Every inter-agent message must be a **versioned JSON contract**:

```typescript
interface AgentHandoff<T> {
  contractVersion: '1.0';
  agentId: string;
  timestamp: string;
  confidence: number;        // 0.0 – 1.0
  rationale: string;
  payload: T;
  provenance: 'user' | 'prospect' | 'system';  // NEVER treat prospect text as instructions
}
```

### 2.4 Safety Requirements

- **Prompt injection defense:** Prospect replies are untrusted input; triage agent classifies, never executes instructions from message body
- **Human-in-the-loop:** Auto-send only when confidence ≥ threshold; else queue for review
- **Tool gating:** Agents propose actions; supervisor commits to CRM/WhatsApp
- **Audit log:** Every AI decision logged with input hash, model, latency, outcome

### 2.5 Protocols & Integration

| Protocol | Use |
|---|---|
| **MCP (Model Context Protocol)** | Connect agents to CRM data, calendars, knowledge base |
| **Structured outputs** | JSON schema / Zod validation on all LLM responses |
| **LangGraph / custom FSM** | Deterministic state machine for lead lifecycle |

---

## 3. Local LLM Integration

### 3.1 Three Deployment Modes

| Mode | Engine | Privacy | Performance | Best For |
|---|---|---|---|---|
| **A. Ollama / LM Studio** | Local server (`localhost:11434`) | Highest — data never leaves machine | Fast (GPU-dependent) | Auto-reply, lead scoring |
| **B. WebLLM (WebGPU)** | In-browser inference | High — no server needed | 5–10× slower than native; memory-limited | Small models (Phi-3, Gemma 2B) |
| **C. Cloud API** | OpenAI / Gemini / Claude | Lower — data sent to provider | Fastest | Complex reasoning, fallback |

### 3.2 Recommended: Pluggable `ILLMProvider` Interface

```typescript
interface ILLMProvider {
  readonly id: string;
  generate(request: LLMRequest): AsyncIterable<string>;  // streaming
  embed(text: string): Promise<number[]>;
  isAvailable(): Promise<boolean>;
}
```

Implementations: `OllamaProvider`, `WebLLMProvider`, `CloudAPIProvider`.

### 3.3 Ollama in Extension (Proven Pattern)

- Service worker calls `http://localhost:11434/api/generate`
- Set `OLLAMA_ORIGINS=chrome-extension://<extension-id>` for CORS
- Bundle LangChain.js or lightweight fetch wrapper (no eval)
- RAG: chunk conversation history → embed via Ollama → retrieve → inject context

### 3.4 WebLLM in MV3 Extension

- Bundle `@mlc-ai/web-llm` at build time (CSP-compliant)
- Use OPFS or IndexedDB for model weights cache
- Limit to ≤3B parameter quantized models
- WebGPU required; graceful fallback to Ollama/cloud

### 3.5 Model Selection Guide

| Task | Recommended Model | Mode |
|---|---|---|
| Auto-reply (Hindi/English) | `llama3.2:3b` or `gemma2:2b` | Ollama |
| Lead intent classification | `phi3:mini` | Ollama / WebLLM |
| Long-form outreach copy | `llama3.1:8b` or cloud | Ollama / Cloud |
| Embeddings for RAG | `nomic-embed-text` | Ollama |

---

## 4. Data Layer & Sync

### 4.1 Local-First with Optional Cloud Sync

```
IndexedDB (Dexie)
├── leads          — contact, stage, score, tags
├── conversations  — message history per chat
├── campaigns      — bulk follow-up queues
├── reminders      — scheduled actions
├── ai_audit_log   — agent decisions
└── settings       — user preferences
```

### 4.2 External CRM Integration

- **Webhook/API sync** to HubSpot, Zoho, Salesforce
- **Bidirectional:** extension pushes leads; backend pulls stage updates
- **Offline-first:** queue sync operations; retry with exponential backoff

---

## 5. Security & Compliance

| Area | Requirement |
|---|---|
| **Permissions** | `web.whatsapp.com` only; no `<all_urls>` |
| **Data encryption** | AES-256 for sensitive fields in storage |
| **Privacy policy** | Required for Chrome Web Store |
| **WhatsApp ToS** | Automation risks account ban — implement rate limits, human-like behavior |
| **GDPR/DPDP** | Consent tracking, data export, right to delete |
| **No credential storage** | WhatsApp session stays in browser; never extract auth tokens |

---

## 6. Technology Stack Recommendation

```
Frontend (Extension)
├── WXT + TypeScript + React
├── Tailwind CSS (side panel UI)
├── Dexie.js (IndexedDB ORM)
├── Zod (runtime validation)
└── Vitest (unit tests)

AI Layer
├── ILLMProvider (Ollama / WebLLM / Cloud)
├── Agent orchestrator (supervisor pattern)
└── RAG pipeline (local embeddings)

Optional Backend
├── Node.js / Hono or Fastify
├── PostgreSQL (multi-user sync)
├── Redis (job queue for bulk campaigns)
└── Webhook receivers (CRM sync)
```

---

## 7. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WhatsApp DOM/Store API breaks | Adapter pattern + version detection + rapid patch pipeline |
| MV3 service worker termination | Persist state in storage; use alarms for scheduling |
| Account ban from automation | Rate limits, random delays, daily caps, opt-in per chat |
| LLM hallucination in replies | Confidence thresholds + human review queue |
| Chrome Web Store rejection | Minimal permissions, privacy policy, no remote code |

---

## References

- [Chrome MV3 Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
- [WebLLM GitHub](https://github.com/mlc-ai/web-llm)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [WXT Framework](https://wxt.dev/)
- [Agentic CRM Playbook 2026](https://www.digitalapplied.com/blog/agentic-crm-lead-nurturing-2026-playbook)
