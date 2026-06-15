# WhatsApp CRM Extension

Chrome Extension (Manifest V3) for WhatsApp Web — CRM with AI-powered auto-reply, lead management, bulk follow-up, and reminders.

## Documentation

| Document | Description |
|---|---|
| [Research (2026 Tech)](docs/RESEARCH.md) | MV3, AI Agents, Local LLM analysis |
| [Feature Requirements](docs/FEATURE_REQUIREMENTS.md) | Auto-reply, leads, bulk follow-up, reminders specs |
| [Architecture](docs/ARCHITECTURE.md) | Clean Architecture layers, SOLID mapping |
| [Prompt Template](docs/PROMPT_TEMPLATE.md) | Master Cursor prompt with all rules |

## Cursor Rules

AI coding rules in `.cursor/rules/` enforce clean architecture:

- `project-core.mdc` — Project context, SOLID, MV3 constraints
- `domain-layer.mdc` — Pure domain logic rules
- `application-layer.mdc` — Use case patterns
- `infrastructure-layer.mdc` — Adapter and mapper patterns
- `presentation-layer.mdc` — React UI rules
- `ai-agents.mdc` — Agent supervisor pattern, LLM safety

## Quick Start (Development)

```bash
# 1. Install dependencies (when scaffold is added)
npm install

# 2. Start dev server
npm run dev

# 3. Load extension in Chrome
#    chrome://extensions → Developer mode → Load unpacked → .output/chrome-mv3
```

## Architecture Overview

```
Presentation (React UI, Content Scripts)
    ↓
Application (Use Cases)
    ↓
Domain (Entities, Interfaces) ← Infrastructure (Adapters, Storage, LLM)
```

## Tech Stack (Planned)

- **WXT** + TypeScript + React
- **Dexie.js** (IndexedDB)
- **Zod** (validation)
- **Ollama** / WebLLM (local AI)
- **Tailwind CSS** (UI)

## MVP Features (Phase 1)

1. Lead capture and stage management
2. Reminders with Chrome notifications
3. Basic AI auto-reply (Ollama)
4. Single-step bulk follow-up with safety caps

## License

MIT
