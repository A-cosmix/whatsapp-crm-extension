# Deployment Guide — HireMate AI

## Prerequisites

- Node.js 18+ and npm
- Google Chrome (latest)
- (Optional) OpenAI API key for production AI
- (Optional) Stripe/Razorpay accounts for payments

## Local Development

```bash
git clone <repo-url>
cd hiremate-ai
npm install
npm run dev
```

WXT dev mode watches for changes and auto-reloads the extension.

Load in Chrome:
1. `chrome://extensions` → Developer mode ON
2. Load unpacked → `.output/chrome-mv3`

## Production Build

```bash
npm run build
```

Output: `.output/chrome-mv3/`

Verify the build:
```bash
ls -la .output/chrome-mv3/
# Should contain: manifest.json, background.js, popup.html, options.html, content-scripts/
```

## Package for Distribution

```bash
npm run zip
```

Creates a zip file ready for Chrome Web Store upload or manual distribution.

## Environment Configuration

### OpenAI (Production AI)

Users configure via Settings UI. For a backend proxy approach:

1. Deploy a backend API that holds the OpenAI key
2. Update `OpenAILLMProvider` to call your proxy instead of `api.openai.com`
3. Never expose API keys in the extension bundle

### Stripe Payments

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com)
2. Deploy a checkout backend endpoint
3. Configure in extension:
   ```typescript
   await paymentService.saveConfig({
     stripePublishableKey: 'pk_live_...',
     backendUrl: 'https://api.hiremate.ai',
   });
   ```

### Razorpay Payments

1. Create plans in [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Deploy checkout endpoint
3. Configure:
   ```typescript
   await paymentService.saveConfig({
     razorpayKeyId: 'rzp_live_...',
     backendUrl: 'https://api.hiremate.ai',
   });
   ```

## Backend API (Recommended for Production)

For production payments and auth, deploy a minimal backend:

```
POST /api/checkout/stripe     → Create Stripe session
POST /api/checkout/razorpay   → Create Razorpay order
POST /api/verify-license      → Validate license key
POST /api/auth/signin         → JWT authentication
POST /api/ai/analyze          → Proxy LLM calls (keeps API key server-side)
```

Stack suggestions: Cloudflare Workers, Vercel Edge Functions, or Express on Railway.

## CI/CD

GitHub Actions workflow (`.github/workflows/build-extension.yml`):

```yaml
name: Build Extension
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: hiremate-extension
          path: .output/chrome-mv3/
```

## Hosting the Landing Page

The extension includes a built-in landing page in `options.html`. For a separate marketing site:

1. Deploy `src/ui/pages/landing-page.tsx` as a standalone Next.js/Vite site
2. Link to Chrome Web Store listing
3. Host privacy policy at `/privacy`

## Monitoring

Recommended for production:
- **Sentry** — error tracking in background script
- **PostHog/Mixpanel** — feature usage analytics (respect privacy policy)
- **Stripe/Razorpay webhooks** — payment confirmation → license key generation

## Updating

1. Bump version in `wxt.config.ts` and `package.json`
2. `npm run build && npm run zip`
3. Upload to Chrome Web Store Developer Dashboard
4. Submit for review

## Rollback

Keep previous `.zip` builds tagged by version. Chrome Web Store allows rolling back to a previous published version from the developer dashboard.
