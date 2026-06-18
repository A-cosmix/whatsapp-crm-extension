# HireMate AI

**Land Jobs Faster. Apply Smarter.**

Premium AI-powered Chrome Extension — your personal career coach, resume optimizer, ATS analyzer, job matcher, cover letter writer, and application copilot.

## Features

| Feature | Description | Tier |
|---------|-------------|------|
| AI Resume Analyzer | ATS score (0-100), grade, missing keywords/skills, suggestions | Free (3 scans) |
| AI Job Matcher | Match score, missing skills, interview chance | Premium |
| Resume Optimizer | Tailor resume sections for any job | Premium |
| Cover Letter Generator | 5 styles: Professional, Startup, Corporate, Creative, Tech | Free (3 letters) |
| Application Assistant | Auto-fill answers for common application questions | All |
| Interview Prep AI | Questions + model answers (Easy/Medium/Hard) | Premium |
| LinkedIn Profile Auditor | Profile score, headline, keyword optimization | Premium |
| Job Tracker | Kanban board (Wishlist → Applied → Interview → Offer → Rejected) | All |
| Salary Insights | Market-rate salary estimates (INR) | Premium |
| Career Roadmap | 30-day, 90-day, 6-month plans | Premium |

## Tech Stack

- **Chrome Extension** Manifest V3 via [WXT](https://wxt.dev)
- **React 19** + **TypeScript** (strict)
- **TailwindCSS** — dark-first premium design
- **Zustand** — state management
- **TanStack Query** — async data layer
- **Framer Motion** — animations
- **Zod** — validation at boundaries
- **Clean Architecture** — domain → application → infrastructure → UI

## Project Structure

```
src/
├── domain/           # Pure business logic (no chrome/react/fetch)
│   ├── entities/     # Types and domain models
│   ├── repositories/ # Interface contracts
│   ├── value-objects/# Helpers, constants
│   └── errors.ts
├── application/      # Use cases orchestrating domain
│   ├── dto/          # Zod schemas & DTOs
│   └── use-cases/    # One use case per user action
├── infrastructure/   # Adapters implementing interfaces
│   ├── auth/
│   ├── di/           # Composition root & message bus
│   ├── job-boards/   # LinkedIn, Indeed, Naukri, Glassdoor
│   ├── llm/          # Mock + OpenAI providers
│   ├── payments/     # Stripe + Razorpay
│   └── storage/      # chrome.storage.local repos
├── ui/               # React presentation layer
│   ├── components/
│   ├── pages/
│   ├── stores/
│   └── styles/
└── entrypoints/      # MV3 bootstrap
    ├── background.ts
    ├── content.ts
    ├── popup/
    └── options/      # Full dashboard
```

## Quick Start

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Production build
npm run build

# Package for distribution
npm run zip
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `.output/chrome-mv3`

## Configuration

Open **Settings** in the dashboard to configure:

- **LLM Provider**: Demo mode (no API key) or OpenAI GPT-4
- **OpenAI API Key**: Stored encrypted in `chrome.storage.local`
- **Auto-scan jobs**: Detect job pages on LinkedIn, Indeed, Naukri, Glassdoor

## Pricing Plans

| Plan | Price | Type |
|------|-------|------|
| Free | ₹0 | 3 resume scans, 3 cover letters |
| Starter | ₹499/month | 10 scans, 10 letters, job tracker |
| Pro | ₹1,999 | Lifetime — unlimited core features |
| Career Boost | ₹2,999 | Lifetime — everything + roadmaps, salary, LinkedIn |

## License Keys (Demo)

For testing premium activation:
- `HM-PRO-XXXX-XXXX` → Pro plan
- `HM-CAREER-XXXX-XXXX` → Career Boost plan
- `HM-STARTER-XXXX-XXXX` → Starter plan

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Chrome Web Store Guide](docs/CHROME_WEB_STORE.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)

## Security

- API keys stored in `chrome.storage.local` (never hardcoded)
- All external data validated with Zod
- MV3 CSP — no eval, no remote code
- Rate limiting via usage counters on free tier
- Prompt injection defense for LLM inputs

## License

Proprietary — HireMate AI © 2026
