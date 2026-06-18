# Production Checklist — HireMate AI

## Code Quality

- [x] TypeScript strict mode enabled
- [x] Clean Architecture layer separation enforced
- [x] Zod validation on all external inputs
- [x] No `eval()`, no inline scripts, no remote code loading (MV3 CSP)
- [x] Named exports throughout (no default exports in domain/application)
- [x] Production build passes (`npm run build`)

## Security

- [ ] Replace demo `LocalAuthService` with production auth backend (Firebase/Supabase/Custom JWT)
- [ ] Move OpenAI API calls to server-side proxy (don't expose keys in extension)
- [ ] Implement proper password hashing (current demo stores plaintext in btoa)
- [ ] Add rate limiting on backend API endpoints
- [ ] Audit content script DOM selectors for XSS vectors
- [x] API keys stored in chrome.storage.local (not hardcoded)
- [x] No session cookies or auth tokens from third-party sites collected
- [ ] Enable CORS restrictions on backend API
- [ ] Review host_permissions — remove unused domains

## UI/UX

- [x] Dark-first premium design system (TailwindCSS)
- [x] Glassmorphism cards and smooth animations (Framer Motion)
- [x] Loading sequence animation for resume analysis
- [x] Success animation ("Ready to get hired.")
- [x] Onboarding flow for first-time users
- [x] Landing page with feature highlights
- [x] Responsive dashboard layout
- [x] Popup UI for quick access
- [ ] Replace placeholder icons with branded assets
- [ ] Add empty states for all pages
- [ ] Add error boundaries in React

## Features

- [x] AI Resume Analyzer (ATS score, grade, recommendations)
- [x] AI Job Matcher (match %, missing skills, interview chance)
- [x] Resume Optimizer (section rewriting)
- [x] Cover Letter Generator (5 styles)
- [x] Application Assistant (auto-fill answers)
- [x] Interview Prep AI (3 difficulty levels)
- [x] LinkedIn Profile Auditor
- [x] Job Tracker (Kanban board)
- [x] Salary Insights (INR estimates)
- [x] Career Roadmap (30/90/180 day plans)
- [x] Free tier usage limits (3 scans, 3 letters)
- [x] Premium gating on pro features

## Payments

- [x] Stripe checkout integration (stub with backend URL)
- [x] Razorpay checkout integration (stub with backend URL)
- [x] License key verification
- [ ] Deploy payment backend with webhook handlers
- [ ] Test Stripe test-mode checkout end-to-end
- [ ] Test Razorpay test-mode checkout end-to-end
- [ ] Implement subscription expiry for Starter monthly plan
- [ ] Add receipt/invoice generation

## Job Board Integration

- [x] LinkedIn job page adapter
- [x] Indeed job page adapter
- [x] Naukri job page adapter
- [x] Glassdoor job page adapter
- [x] Floating analyze panel on job pages
- [ ] Test adapters against live job pages (DOM changes frequently)
- [ ] Add fallback selectors for DOM changes
- [ ] Handle SPA navigation (MutationObserver for URL changes)

## AI/LLM

- [x] Mock LLM provider for demo/testing
- [x] OpenAI provider with JSON response parsing
- [x] Fallback to mock on API failure
- [ ] Add response schema validation (Zod) on all LLM outputs
- [ ] Implement prompt injection defense
- [ ] Add confidence scores to AI decisions
- [ ] Log AI decisions to audit trail

## Storage & Data

- [x] chrome.storage.local for all persistence
- [x] Repository pattern for all data access
- [ ] Add data export (GDPR compliance)
- [ ] Add data deletion / account wipe
- [ ] Implement storage quota monitoring
- [ ] Add migration strategy for schema changes

## Testing

- [ ] Unit tests for domain value objects (scoreToGrade, extractKeywords)
- [ ] Unit tests for use cases with mocked repositories
- [ ] Integration tests for message bus
- [ ] E2E test for resume upload → analysis flow
- [ ] Test free tier limit enforcement
- [ ] Test premium feature gating

## DevOps

- [x] WXT build pipeline
- [x] GitHub Actions CI build workflow
- [ ] Automated zip artifact upload on release
- [ ] Semantic versioning (semver)
- [ ] Changelog maintenance
- [ ] Staging environment for beta testing

## Legal & Compliance

- [ ] Privacy policy hosted at public URL
- [ ] Terms of service
- [ ] GDPR data processing documentation
- [ ] Cookie/tracking disclosure (if analytics added)
- [ ] OpenAI usage policy compliance
- [ ] Job board ToS compliance review (scraping limitations)

## Chrome Web Store

- [ ] Branded icons (16, 48, 128)
- [ ] 5+ screenshots (1280×800)
- [ ] Store listing copy finalized
- [ ] Privacy policy URL set
- [ ] Permission justifications written
- [ ] Beta test with unlisted publish
- [ ] Public launch

## Performance

- [x] Code splitting via WXT entrypoints
- [x] Total bundle < 1 MB (current: ~666 KB)
- [ ] Lazy-load dashboard pages with React.lazy()
- [ ] Debounce job board content script extraction
- [ ] Cache LLM responses for identical inputs

## Monitoring (Post-Launch)

- [ ] Error tracking (Sentry)
- [ ] Usage analytics (privacy-respecting)
- [ ] Payment webhook monitoring
- [ ] Chrome Web Store review monitoring
- [ ] User feedback channel (email/support)

---

**Status**: Core extension is feature-complete and buildable. Items marked [ ] are required before public Chrome Web Store launch.
