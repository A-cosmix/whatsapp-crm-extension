# WhatsApp CRM Extension

Chrome Extension (Manifest V3) for WhatsApp Web — CRM with AI-powered auto-reply, lead management, bulk follow-up, and reminders.

## Quick Start

```bash
npm install
npm run dev          # Dev mode with HMR — load .output/chrome-mv3 in Chrome
npm run build        # Production build
npm test             # Unit tests
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `.output/chrome-mv3`
4. Open [web.whatsapp.com](https://web.whatsapp.com)
5. Click the extension icon to open the **side panel**

### AI Auto-Reply (Ollama)

```bash
# Install Ollama, then pull a model
ollama pull llama3.2:3b
ollama serve
```

Enable auto-reply per lead via the **AI Reply** button in the side panel.

## MVP Features (Phase 1)

| Feature | Status |
|---|---|
| Lead management (stages, tags, search) | ✅ |
| Reminders (chrome.alarms + notifications) | ✅ |
| AI auto-reply (Ollama, per-chat toggle) | ✅ |
| Content script message detection | ✅ |
| Bulk follow-up campaigns | 🔜 Phase 2 |

## Architecture

```
Presentation (React side panel, content script)
    ↓
Application (Use Cases)
    ↓
Domain (Entities, Interfaces) ← Infrastructure (Dexie, Ollama, Chrome APIs)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Documentation

| Document | Description |
|---|---|
| [Research (2026 Tech)](docs/RESEARCH.md) | MV3, AI Agents, Local LLM analysis |
| [Feature Requirements](docs/FEATURE_REQUIREMENTS.md) | Detailed feature specs |
| [Architecture](docs/ARCHITECTURE.md) | Clean Architecture + SOLID |
| [Prompt Template](docs/PROMPT_TEMPLATE.md) | Cursor AI master prompt |

## Cursor Rules

AI coding rules in `.cursor/rules/` enforce clean architecture during development.

## Project Structure

```
src/
├── domain/           # Pure business logic (no framework imports)
├── application/      # Use cases
├── infrastructure/   # Dexie, Ollama, Chrome adapters
├── ui/               # React components + hooks
└── entrypoints/      # background.ts, content.ts, sidepanel/
```

## Tech Stack

- **WXT** + TypeScript + React 19
- **Dexie.js** (IndexedDB)
- **Zod** (validation)
- **Tailwind CSS** (UI)
- **Ollama** (local LLM)
- **Vitest** (tests)

## License

MIT
