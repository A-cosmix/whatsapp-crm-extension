# Momentum X

**Your Browser. Reimagined.**

Momentum X is a premium AI-powered Chrome extension that transforms your browser into an intelligent productivity command center.

## Features

### Core Productivity
- **AI Sidebar Assistant** — GPT-powered chat with full context awareness
- **Smart Dashboard** — Beautiful new tab page with widgets
- **Focus Timer** — Pomodoro-style deep work sessions with break mode
- **Daily Goals** — Track and complete daily objectives
- **Smart Notes** — Create, pin, and organize notes
- **Reminders** — Scheduled notifications via chrome.alarms

### AI Capabilities
- Summarize any webpage
- YouTube video summarizer
- Summarize / rewrite / explain selected text (context menu)
- Smart productivity suggestions
- Voice command support (Web Speech API)

### Analytics & Customization
- Website productivity analytics (time per domain)
- Dark / light / system theme modes
- 5 accent color themes (electric, neon, cyan, emerald, rose)
- Floating AI assistant button on every page
- Chrome sync storage for settings, notes, and goals

### Extension Surfaces
| Surface | Description |
|---------|-------------|
| **Popup** | Quick stats + focus timer + shortcuts |
| **Side Panel** | Full AI chat + page/YouTube summarizers |
| **New Tab** | Complete productivity dashboard |
| **Options** | API key, themes, focus settings |
| **Onboarding** | First-run setup wizard |

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Alt+Shift+M` | Open AI sidebar |
| `Alt+Shift+S` | Summarize current page |
| `Alt+Shift+N` | Quick note |
| `Alt+Shift+T` | Toggle focus timer |

## Quick Start

### Install dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```
Load the extension from `.output/chrome-mv3/` in `chrome://extensions` (Developer mode → Load unpacked).

### Production build
```bash
npm run build
npm run zip    # Creates .output/momentum-x-1.0.0-chrome.zip for Chrome Web Store
```

## AI Setup

1. Install the extension
2. Complete the onboarding flow (or go to Settings)
3. Add your OpenAI API key
4. Optionally change the model (default: `gpt-4o-mini`)

Works with any OpenAI-compatible API endpoint.

## Project Structure

```
src/
├── entrypoints/
│   ├── background.ts      # Service worker
│   ├── content.ts         # Page analytics, floating AI, context bridge
│   ├── popup/             # Extension popup
│   ├── sidepanel/         # AI sidebar
│   ├── newtab/            # New tab dashboard
│   ├── options/           # Settings page
│   └── onboarding/        # First-run wizard
├── momentum/
│   ├── components/        # Shared UI components
│   ├── hooks/             # React hooks
│   ├── services/          # Storage, AI, notifications
│   ├── background/        # Message handlers
│   ├── lib/               # Messaging utilities
│   ├── schemas/           # Zod validation
│   ├── styles/            # Global CSS + design system
│   └── types/             # TypeScript types
website/                   # Marketing landing page
```

## Tech Stack

- **WXT** — Manifest V3 extension framework
- **React 19** + **TypeScript**
- **Tailwind CSS** — Premium glassmorphism design system
- **Framer Motion** — Smooth animations
- **Zod** — Runtime validation
- **Chrome APIs** — storage.sync, alarms, notifications, sidePanel, contextMenus, commands

## Marketing Website

The premium landing page lives in `website/`:

```bash
cd website && npm install && npm run dev
```

## License

Private — All rights reserved.
