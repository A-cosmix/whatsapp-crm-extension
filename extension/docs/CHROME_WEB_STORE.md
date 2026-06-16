# Chrome Web Store Deployment Guide

## Pre-Submission Checklist

- [ ] `npm run build` succeeds without errors
- [ ] Extension tested on Chrome 120+
- [ ] All permissions justified in listing
- [ ] Privacy policy hosted and URL ready
- [ ] Screenshots prepared (1280x800 or 640x400)
- [ ] Promotional images (440x280 small tile, 920x680 marquee)
- [ ] Icons: 128x128 store icon

## Build Release Package

```bash
cd extension
npm run build
cd dist
zip -r ../explain-like-whatsapp-v1.0.0.zip .
```

## Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee
3. Verify identity if prompted

## Store Listing

### Basic Info

| Field | Value |
|-------|-------|
| Name | Explain Like WhatsApp |
| Summary | Highlight text → get instant AI explanations in simple language |
| Category | Productivity |
| Language | English |

### Description Template

```
Struggling with difficult English, technical articles, or coding docs?

Explain Like WhatsApp converts ANY difficult text into ultra-simple,
human-friendly explanations — instantly.

✨ HIGHLIGHT & EXPLAIN
Select any text on any website. Click the floating 💬 button or press Alt+E.

🎭 12 EXPLANATION MODES
• WhatsApp Mode — casual Hinglish explanations
• Hindi Mode — simple Hindi
• GenZ Mode — no cap fr fr
• Exam Notes — revision-ready bullet points
• Teacher, Interview, Gamer, Mom, Meme modes & more!

📄 PDF & YOUTUBE TOOLS
Summarize PDFs and YouTube videos. Generate study notes. Export to Markdown.

📖 SMART WORD EXPLAINER
Hover any difficult word for meaning, pronunciation, and Hindi translation.

🎯 FOCUS READING MODE
Remove ads and distractions. Dark mode, sepia, reading fonts, focus timer.

🔥 LEARNING STREAKS
Track daily progress. Earn achievements. Get daily learning reports.

FREE: 5-day trial, 30 explanations/day
PRO: ₹150/year — unlimited everything

Made with 💚 in India
```

### Privacy

- Single purpose: Explain and simplify web content
- Privacy policy URL: `https://your-domain.com/privacy.html`
- Data usage: User data used for authentication and personalization only

### Permission Justifications

Provide these when Chrome asks:

| Permission | Justification |
|-----------|---------------|
| activeTab | Read user-selected text on the current tab to generate explanations |
| storage | Store user settings, cached explanations, and preferences locally |
| scripting | Inject the explanation UI (floating button and popup) into web pages |
| contextMenus | Add "Explain Like WhatsApp" to right-click context menu |
| notifications | Send daily learning report and subscription renewal reminders |
| alarms | Schedule cache cleanup and renewal reminder notifications |
| host_permissions | Access Claude API for AI explanations; Firebase for auth; Razorpay for payments |

## Review Process

- Typical review: 1-3 business days
- Common rejection reasons:
  - Vague permission justifications → be specific
  - Missing privacy policy → host privacy.html
  - Misleading screenshots → show actual extension UI
  - Remote code execution → all code is bundled at build time ✓

## Post-Launch

1. Monitor reviews and respond promptly
2. Push updates via same dashboard (auto-updates for users)
3. Track install/uninstall in Chrome Web Store analytics
4. A/B test store listing images for conversion

## Version Updates

1. Bump version in `manifest.json`
2. `npm run build`
3. Zip `dist/` folder
4. Upload new package in developer dashboard
5. Add "What's new" changelog
