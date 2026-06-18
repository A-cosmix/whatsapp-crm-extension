# Chrome Web Store Publishing Guide — HireMate AI

## Before You Submit

Complete every item in [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) first.

## Developer Account Setup

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer registration fee
3. Verify your identity if prompted

## Prepare Store Assets

### Required Icons (already in `public/icon/`)

| Size | File | Usage |
|------|------|-------|
| 16×16 | `icon/16.png` | Toolbar |
| 48×48 | `icon/48.png` | Extensions page |
| 128×128 | `icon/128.png` | Store listing |

> Replace placeholder icons with branded HireMate AI icons before publishing.

### Screenshots (1280×800 or 640×400)

Capture these screens from the dashboard:
1. Dashboard overview with quick actions
2. Resume Analyzer with ATS score results
3. Job Matcher with match percentage
4. Cover Letter generator output
5. Job Tracker Kanban board
6. Pricing/Upgrade page

### Promotional Images

- **Small promo tile**: 440×280 px
- **Marquee promo tile**: 1400×560 px (optional, featured placement)

## Store Listing Content

### Extension Name
```
HireMate AI — Resume & Job Matcher
```

### Short Description (132 chars max)
```
AI career copilot: ATS resume analyzer, job matcher, cover letters, interview prep & job tracker. Land jobs faster.
```

### Detailed Description

```
HireMate AI is your premium AI-powered career copilot built for job seekers who want to land their dream role faster.

🎯 RESUME ANALYZER
Upload your resume and get an instant ATS compatibility score (0-100), letter grade, missing keywords, and actionable improvement suggestions.

🎯 JOB MATCHER
Paste any job description or browse LinkedIn, Indeed, Naukri, and Glassdoor — HireMate auto-detects jobs and scores your fit (0-100%), missing skills, and estimated interview chances.

✨ RESUME OPTIMIZER
One-click resume rewriting tailored to any job description. Optimizes summary, skills, experience, and projects for ATS systems.

📝 COVER LETTER GENERATOR
Generate personalized cover letters in 5 styles: Professional, Startup, Corporate, Creative, and Tech Industry. One-click copy.

💼 APPLICATION ASSISTANT
Auto-generate answers for "Why should we hire you?", "Tell us about yourself", salary expectations, and more.

🎤 INTERVIEW PREP AI
Practice with AI-generated interview questions (Easy/Medium/Hard) with model answers for technical, HR, and behavioral rounds.

📊 JOB TRACKER
Beautiful Kanban board to track applications: Wishlist → Applied → Interview → Offer → Rejected.

💰 SALARY INSIGHTS
Get market-rate salary estimates based on role, location, experience, and skills.

🗺️ CAREER ROADMAP
AI-generated 30-day, 90-day, and 6-month career plans with skills, courses, and projects.

PRIVACY FIRST
- Your data stays on your device (chrome.storage.local)
- No WhatsApp/social media access
- API keys stored securely, never shared

Free tier includes 3 resume scans and 3 cover letters. Upgrade to Pro for unlimited access.
```

### Category
```
Productivity
```

### Language
```
English
```

## Privacy Policy

Host `public/privacy.html` at a public URL (e.g., `https://hiremate.ai/privacy`).

Required disclosures:
- Data collected: resume text, job descriptions, usage analytics
- Data storage: local device storage (chrome.storage.local)
- Third-party services: OpenAI (if user configures API key), Stripe/Razorpay (payments)
- Data not sold to third parties

## Permissions Justification

| Permission | Justification |
|------------|---------------|
| `storage` | Save resumes, settings, job tracker data locally |
| `alarms` | Daily job search reminder notifications |
| `notifications` | Remind users to follow up on applications |
| `tabs` | Detect job board pages for auto-scanning |
| `activeTab` | Read job description from current tab |
| `scripting` | Inject job detection content script |
| `host_permissions` (job boards) | Extract job descriptions from LinkedIn, Indeed, Naukri, Glassdoor |
| `host_permissions` (APIs) | OpenAI, Stripe, Razorpay for AI and payments |

## Upload Process

1. `npm run build && npm run zip`
2. Developer Dashboard → **New Item**
3. Upload the `.zip` file from `.output/`
4. Fill in store listing details
5. Upload screenshots and icons
6. Set privacy policy URL
7. Select visibility: **Public** or **Unlisted** for beta
8. Click **Submit for Review**

## Review Timeline

- Typically 1-3 business days
- Common rejection reasons:
  - Missing privacy policy
  - Permissions not justified
  - Misleading screenshots
  - Single-purpose policy violation (ensure all features relate to job search)

## Post-Publish

1. Share the store URL: `https://chrome.google.com/webstore/detail/<extension-id>`
2. Monitor reviews and respond promptly
3. Set up auto-update via Chrome Web Store (automatic for published extensions)
4. Track installs in the Developer Dashboard analytics

## Beta Testing

Before public launch:
1. Publish as **Unlisted**
2. Share link with beta testers
3. Collect feedback via in-app settings or email
4. Fix issues, bump version, resubmit
