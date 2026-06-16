# AI Email Summarizer & Priority Manager

A production-ready Chrome extension (Manifest V3) that uses Claude AI to summarize emails, classify priority, extract meetings, suggest replies, and manage your inbox in **Gmail** and **Outlook**.

## Features

- **Email Summarization** — 2–3 bullet point summaries via Claude API
- **Priority Classification** — Important / Routine / Low Priority with color badges
- **Meeting Extractor** — Dates, attendees, agenda, links + Add to Calendar
- **Follow-up Detection** — Highlights emails needing a response
- **Smart Reply Suggestions** — Formal, casual, and urgent reply drafts
- **Sentiment Analysis** — Tone indicators with emoji and color coding
- **Snooze & Reminders** — Context menu and panel snooze options
- **Weekly Digest** — Configurable Sunday report with action items
- **Sidebar Filters** — Filter by priority, search summarized content
- **Offline Cache** — IndexedDB cache with 30-day auto-expiry
- **Keyboard Shortcuts** — Customizable shortcuts for summarize, toggle panel, smart reply, and quick snooze (default: Alt+S, Alt+P, Alt+R, Alt+Z)

## Tech Stack

- Manifest V3 · Vite · React · TypeScript · Tailwind CSS
- IndexedDB (Dexie.js) · Chrome Alarms · Chrome Notifications
- Anthropic Claude API (`claude-opus-4-6`)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Anthropic API key](https://console.anthropic.com/)

## Setup & Installation

### 1. Install dependencies

```bash
cd extension
npm install
```

### 2. Build the extension

```bash
npm run build
```

The production bundle is output to `extension/dist/`.

### 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` folder

### 4. Configure API key

1. Click the extension icon → **Settings** (or right-click → Options)
2. Enter your Anthropic API key
3. Click **Test Connection** to validate
4. Toggle features on/off as needed

## Development

```bash
npm run dev
```

Load the `dist` folder in Chrome. Vite watches for changes and rebuilds automatically.

## Project Structure

```
extension/
├── manifest.json
├── src/
│   ├── background/service-worker.ts   # Alarms, notifications, API routing
│   ├── content/
│   │   ├── gmail-content.ts         # Gmail DOM integration
│   │   ├── outlook-content.ts       # Outlook DOM integration
│   │   └── content-base.ts          # Shared content logic
│   ├── popup/                       # Extension popup UI
│   ├── options/                     # Settings page
│   ├── shared/panel.ts              # Floating analysis panel
│   ├── utils/
│   │   ├── api.ts                   # Claude API calls
│   │   ├── storage.ts               # IndexedDB wrapper
│   │   └── parser.ts                # Email DOM extraction
│   └── types/index.ts
├── public/icons/
└── package.json
```

## Usage

### Gmail / Outlook

1. Open any email — the AI panel appears automatically on the right
2. View summary, priority badge, sentiment, and meeting info
3. Click **Smart Reply** for draft responses
4. Use **Snooze** to hide and resurface later
5. Use the left sidebar to filter by priority or search

### Snooze (Context Menu)

Right-click on the page → **Snooze until...** → pick a duration.

### Weekly Digest

Configured in Settings (default: Sunday 9:00 AM). Generates a summary notification. Use **Generate Weekly Digest** in the popup for manual generation.

## Packaging for Chrome Web Store

```bash
cd extension
npm run build
cd dist
zip -r ../ai-email-summarizer-v1.0.0.zip .
```

Upload `ai-email-summarizer-v1.0.0.zip` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Privacy

- Email content is sent only to the Anthropic Claude API
- API key stored in Chrome sync storage (encrypted by Chrome)
- Summaries cached locally in IndexedDB for 30 days
- No third-party analytics or tracking

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | API key and preferences |
| `alarms` | Snooze reminders and weekly digest |
| `notifications` | Snooze and digest alerts |
| `contextMenus` | Right-click snooze |
| `activeTab` / `scripting` | Email page interaction |
| `mail.google.com` / `outlook.live.com` | Content script injection |
| `api.anthropic.com` | Claude API calls |

## Troubleshooting

| Issue | Solution |
|---|---|
| Panel doesn't appear | Refresh the email page; ensure API key is set |
| "Invalid API key" | Re-enter key in Settings and test connection |
| Rate limit error | Wait a few minutes; check Anthropic usage limits |
| Summary shows cached data | Click ↻ to force re-analyze |
| Outlook selectors changed | Extension uses fallback selectors; report issues |

## License

MIT
