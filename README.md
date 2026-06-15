# WhatsApp CRM Extension

Chrome Extension (Manifest V3) for WhatsApp Web — full CRM with dark-themed UI, AI auto-reply, lead management, bulk follow-up, reminders, and review queue.

## Quick Start

```bash
npm install
npm run dev          # Dev mode — load .output/chrome-mv3 in Chrome
npm run build        # Production build
npm test             # Unit tests
```

### Load in Chrome

1. Open `chrome://extensions` → Enable **Developer mode**
2. **Load unpacked** → select `.output/chrome-mv3`
3. Open [web.whatsapp.com](https://web.whatsapp.com)
4. Click extension icon → **Side Panel** opens (dark theme)

### AI Auto-Reply (Ollama)

```bash
ollama pull llama3.2:3b
ollama serve
```

Enable per-lead via **AI Reply** button in side panel.

## Features

| Feature | Description |
|---|---|
| **Lead Management** | Capture from active chat, manual add, stage FSM, search |
| **Bulk Follow-Up** | Template campaigns with `{{name}}` variables, daily cap, pause/cancel |
| **Reminders** | Scheduled alerts, snooze (+15m, +1h), overdue highlighting |
| **AI Auto-Reply** | Ollama-powered, confidence gating, human review queue |
| **Review Queue** | Approve/reject low-confidence AI drafts before sending |
| **CRM Webhook Sync** | Push leads to HubSpot/Zoho via configurable webhook |
| **Dark Theme UI** | WhatsApp-inspired dark palette across all panels |

## Safety

- Bulk send: daily cap (default 50), random 3–8s delays
- Auto-reply: 2–5s human-like delay, groups excluded
- Escalation keywords → review queue (not auto-sent)
- Prospect messages treated as untrusted input

## Architecture

```
Presentation (React dark UI, content script)
    ↓
Application (Use Cases)
    ↓
Domain (Entities, Interfaces) ← Infrastructure (Dexie, Ollama, Chrome)
```

## Documentation

- [Research](docs/RESEARCH.md) · [Features](docs/FEATURE_REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md) · [Cursor Prompts](docs/PROMPT_TEMPLATE.md)

## Tech Stack

WXT · TypeScript · React 19 · Tailwind CSS · Dexie.js · Zod · Ollama · Vitest

## License

MIT
