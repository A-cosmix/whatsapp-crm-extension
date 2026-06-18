# Explain Like WhatsApp 💬

> AI Chrome Extension that converts difficult internet content into ultra-simple, human-friendly explanations instantly.

Highlight any difficult text on any website → Get instant explanations in WhatsApp-style simple language.

## Features

- **Highlight-to-Explain** — Select text, click floating 💬 button or press `Alt+E`
- **12 Explanation Modes** — WhatsApp, Hindi, GenZ, Teacher, Exam Notes, Gamer, Mom, Meme & more
- **PDF Simplifier** — Summarize, explain, and export study notes from PDFs
- **YouTube Simplifier** — Summarize videos with timestamps and study notes
- **Smart Word Explainer** — Hover any word for meaning, pronunciation, and Hindi translation
- **Focus Reading Mode** — Remove distractions, dark/sepia themes, focus timer
- **Study Notes Generator** — Exam notes, flashcards, revision sheets with export
- **Daily Learning Report** — Spotify Wrapped for learning
- **Streaks & Achievements** — Gamified learning retention
- **Monetization** — 5-day free trial, ₹150/month recurring Pro plan via Razorpay Subscriptions

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (glassmorphism UI)
- Chrome Manifest V3
- Firebase Authentication
- Claude API (claude-opus-4-6)
- IndexedDB + Chrome Storage
- Razorpay Payments

## Quick Start

### Prerequisites

- Node.js 18+
- Chrome browser
- Claude API key from [console.anthropic.com](https://console.anthropic.com)
- Firebase project (for auth)

### Installation

```bash
cd extension
npm install
cp .env.example .env
# Edit .env with your Firebase and Razorpay credentials
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` folder
5. Click the extension icon → Sign up → Add your Claude API key in Settings

### Development

```bash
npm run dev
```

## Project Structure

```
extension/
├── manifest.json          # Chrome MV3 manifest
├── src/
│   ├── background/        # Service worker (AI, auth, payments)
│   ├── content/           # Content scripts (highlight, YouTube, PDF)
│   ├── popup/             # Extension popup UI
│   ├── auth/              # Login, signup, onboarding
│   ├── dashboard/         # Dashboard, reports, notes
│   ├── options/           # Full settings page
│   ├── payments/          # Subscription & Razorpay
│   ├── components/        # Shared React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # AI, auth, storage, analytics
│   ├── styles/            # Global CSS + Tailwind
│   ├── types/             # TypeScript types
│   └── lib/               # Prompt templates
├── public/                # Extension icons
└── dist/                  # Built extension (load this in Chrome)
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: `explain-like-whatsapp`
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** (production mode)
5. Create Firestore collections:
   - `users/{uid}` — User profiles
   - `users/{uid}/explanations` — Explanation history
   - `analytics` — Usage analytics
6. Copy config to `.env`:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=explain-like-whatsapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=explain-like-whatsapp
VITE_FIREBASE_STORAGE_BUCKET=explain-like-whatsapp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /explanations/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /analytics/{docId} {
      allow create: if request.auth != null;
    }
  }
}
```

## Razorpay Subscription Setup

The Pro plan is a **₹150/month recurring subscription** powered by Razorpay
Subscriptions and a Firebase Cloud Functions backend (`functions/`). Pro is
granted only by the signature-verified webhook after a real payment — never from
the extension UI.

See [docs/RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md) for the full guide. In short:

1. Create a Razorpay account, enable **Subscriptions**, get API keys.
2. Create the monthly ₹150 plan: `cd functions && npm run create-plan`.
3. Configure params (`RAZORPAY_KEY_ID`, `RAZORPAY_PLAN_ID`) and secrets
   (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`), then `firebase deploy --only functions`.
4. Add the deployed `razorpayWebhook` URL as a Razorpay webhook.

The extension itself only needs the standard Firebase config — it calls the
callable `createSubscription` via the Firebase SDK.

## Claude API Setup

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Users enter their key in Extension Settings (stored locally in `chrome.storage.local`)
3. All API calls go through the background service worker

## Chrome Web Store Submission

### Prepare

1. `npm run build` — creates `dist/` folder
2. Zip the `dist/` folder: `cd dist && zip -r ../elw-extension.zip .`
3. Create 1280x800 screenshots of the extension in action
4. Write store listing description

### Submit

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee
3. Click **New Item** → Upload `elw-extension.zip`
4. Fill in:
   - **Name**: Explain Like WhatsApp
   - **Category**: Productivity
   - **Description**: Highlight any text → get instant AI explanations in simple language
   - **Privacy policy URL**: Required (host `privacy.html`)
5. Submit for review (typically 1-3 business days)

### Required Permissions Justification

| Permission | Reason |
|-----------|--------|
| `activeTab` | Read selected text on current tab |
| `storage` | Save settings, cache, user data |
| `scripting` | Inject explanation UI on pages |
| `contextMenus` | Right-click "Explain" option |
| `notifications` | Daily learning reports |
| `alarms` | Cache cleanup, renewal reminders |
| `<all_urls>` | Work on any website user visits |

## Monetization

| Plan | Price | Features |
|------|-------|----------|
| Free Trial | ₹0 (5 days) | 30 explanations/day, basic modes |
| Pro Monthly | ₹150/month | Unlimited, all modes, PDF/YouTube, exports |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+E` | Explain selected text |
| Right-click → Explain | Context menu explain |

## Architecture

```
User highlights text
    ↓
Content Script (floating button)
    ↓
Background Service Worker
    ├── Check usage limits
    ├── Check cache (IndexedDB)
    ├── Call Claude API
    ├── Save to cache + history
    └── Update analytics
    ↓
Explanation Popup (content script)
```

## License

MIT
