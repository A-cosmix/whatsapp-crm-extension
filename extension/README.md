# AI Email Summarizer & Priority Manager

A production-ready **Chrome Extension (Manifest V3)** that uses the **Anthropic Claude API** to summarize emails, classify priority, extract meetings, suggest replies, and manage your inbox in **Gmail** and **Outlook**.

![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![React](https://img.shields.io/badge/React-18-61DAFB)

## Features

| Feature | Description |
| --- | --- |
| **Email Summarization** | 2–3 bullet summaries via Claude API |
| **Priority Classification** | Important / Routine / Low Priority badges |
| **Meeting Extractor** | Dates, attendees, agenda, links + calendar actions |
| **Follow-up Detection** | Highlights emails needing a response |
| **Smart Reply Suggestions** | Formal, casual, and urgent reply drafts |
| **Sentiment Analysis** | Tone indicators with emoji and color coding |
| **Snooze & Reminders** | Context menu and panel snooze with Chrome alarms |
| **Weekly Digest** | Configurable Sunday report with action items |
| **Sidebar Filters** | Filter by priority, search summarized content |
| **Dark Mode** | System / light / dark theme across popup, options, and panel |
| **Keyboard Shortcuts** | Customizable Alt+S/P/R/Z shortcuts |
| **Onboarding Tutorial** | 6-step setup wizard + in-page Gmail/Outlook tour |
| **Usage Analytics** | Local feature tracking (privacy-first, no external telemetry) |
| **Admin Dashboard** | API token usage, costs, errors, CSV export |
| **Offline Cache** | IndexedDB cache with 30-day auto-expiry |

## Screenshots

> Add screenshots after loading the extension:
>
> - Popup with priority filters
> - Floating analysis panel on Gmail
> - Options / API Admin dashboard
> - Dark mode comparison

Place images in `docs/screenshots/` and reference them here.

## Tech Stack

- **Manifest V3** · **Vite** · **React** · **TypeScript** · **Tailwind CSS**
- **IndexedDB** (Dexie.js) · **Chrome Alarms** · **Chrome Notifications**
- **Anthropic Claude API** (`claude-opus-4-6`)
- **Zod** validation at API boundaries

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [Google Chrome](https://www.google.com/chrome/) (or Chromium-based browser)
- [Anthropic API key](https://console.anthropic.com/)

## Installation (End Users)

### 1. Build or download the extension

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <repo>/extension
npm install
npm run build
```

### 2. Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

### 3. Configure your API key

1. Click the extension icon → **Settings** (⚙️)
2. Paste your Anthropic API key
3. Click **Test Connection**
4. Toggle features on/off as needed

### 4. Open Gmail or Outlook

Visit [Gmail](https://mail.google.com) or [Outlook](https://outlook.live.com) and open any email. The AI panel appears on the right.

## Development Setup

```bash
cd extension
npm install
npm run dev
```

Vite watches for changes and rebuilds into `dist/`. Reload the extension in `chrome://extensions/` after changes.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development build with watch mode |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | TypeScript validation only |
| `npm run validate` | Typecheck + production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run package` | Build + create `ai-email-summarizer-v1.0.1.zip` |

## API Setup Guide

1. Create an account at [console.anthropic.com](https://console.anthropic.com/)
2. Generate an API key under **API Keys**
3. Paste the key in extension **Settings → Claude API Key**
4. Click **Test Connection** — a successful test confirms billing and key validity
5. Monitor usage in **Settings → API Admin** tab

**Estimated cost:** ~500–1500 tokens per email analysis depending on length.

## Project Structure

```
extension/
├── manifest.json                 # MV3 manifest
├── vite.config.ts                # Vite + CRX plugin
├── vitest.config.ts              # Unit test config
├── scripts/package.mjs           # Zip packaging script
├── public/icons/                 # Extension icons (16–128px)
├── src/
│   ├── background/
│   │   └── service-worker.ts     # Alarms, notifications, API routing
│   ├── content/
│   │   ├── gmail-content.ts      # Gmail DOM integration
│   │   ├── outlook-content.ts    # Outlook DOM integration
│   │   └── content-base.ts       # Shared content logic
│   ├── popup/                    # Extension popup UI
│   ├── options/                  # Settings page
│   ├── admin/                    # API usage dashboard
│   ├── components/               # Shared React components
│   ├── shared/                   # Floating panel, email tour
│   ├── hooks/                    # React hooks (theme)
│   ├── utils/                    # API, storage, parser, analytics
│   └── types/                    # Shared TypeScript types
└── dist/                         # Production build output (generated)
```

## Usage

### Gmail / Outlook

1. Open any email — the AI panel appears on the right
2. View summary, priority badge, sentiment, and meeting info
3. Click **Smart Reply** for draft responses
4. Use **Snooze** to hide and resurface later
5. Use popup sidebar filters to search by priority or keyword

### Keyboard Shortcuts (default)

| Shortcut | Action |
| --- | --- |
| `Alt+S` | Summarize current email |
| `Alt+P` | Toggle analysis panel |
| `Alt+R` | Open smart reply suggestions |
| `Alt+Z` | Quick snooze (1 hour) |

Customize shortcuts in **Settings → Keyboard Shortcuts**.

### Snooze (Context Menu)

Right-click on the page → **Snooze until...** → pick a duration.

### Weekly Digest

Configured in Settings (default: Sunday 9:00 AM). Use **Generate Weekly Digest** in the popup for manual generation.

## Build for Production

```bash
cd extension
npm run validate    # typecheck + build
npm run test        # unit tests
npm run package     # creates ai-email-summarizer-v1.0.1.zip
```

The `dist/` folder is the loadable extension. The zip is ready for Chrome Web Store upload.

## Chrome Web Store Deployment

1. Run `npm run package` to create the zip
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Create a new item and upload `ai-email-summarizer-v1.0.1.zip`
4. Fill in listing details, privacy policy, and screenshots
5. Submit for review

## GitHub Upload

If starting a fresh repository for the extension:

```bash
cd extension
git init
git add .
git commit -m "Initial production-ready commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

> **Note:** `node_modules/`, `dist/`, and `*.zip` are excluded via `.gitignore`. Never commit API keys.

### Suggested commit messages

- `feat: add AI email summarizer Chrome extension v1.0.1`
- `fix: harden XSS escaping and API retry logic`
- `perf: split content script bundle to reduce Gmail/Outlook payload`
- `docs: add production README and deployment guide`

## Privacy & Security

- Email content is sent **only** to the Anthropic Claude API
- API key stored in `chrome.storage.sync` (encrypted by Chrome)
- Summaries cached locally in IndexedDB for 30 days
- User-facing content escaped before DOM injection (XSS protection)
- No third-party analytics or external telemetry
- Local usage analytics stored in IndexedDB only

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | API key and user preferences |
| `alarms` | Snooze reminders and weekly digest |
| `notifications` | Snooze and digest alerts |
| `contextMenus` | Right-click snooze menu |
| `activeTab` / `scripting` | Email page interaction |
| `mail.google.com` | Gmail content scripts |
| `outlook.live.com` / `outlook.office.com` / `outlook.office365.com` | Outlook content scripts |
| `api.anthropic.com` | Claude API calls |

## Troubleshooting

| Issue | Solution |
| --- | --- |
| Panel doesn't appear | Refresh the email page; ensure API key is set |
| Invalid API key | Re-enter key in Settings and test connection |
| Rate limit error | Wait a few minutes; extension retries automatically |
| Summary shows cached data | Click ↻ to force re-analyze |
| Outlook selectors changed | Extension uses fallback selectors; report issues |
| Build fails | Run `npm run typecheck` for detailed errors |

## License

MIT
