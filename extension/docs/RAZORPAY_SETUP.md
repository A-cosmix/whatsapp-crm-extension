# Razorpay Subscription Setup Guide

The extension sells a **₹150/month recurring subscription** using Razorpay
Subscriptions. Pro is granted **only** by the backend webhook after Razorpay
confirms a real payment — never from the extension UI.

```
Popup ──createSubscription()──▶ Cloud Function ──▶ Razorpay (creates subscription)
  │                                                      │
  └──opens short_url in new tab───────────────▶ User pays (UPI/Card/NetBanking)
                                                         │
Razorpay ──webhook (signed)──▶ Cloud Function ──▶ Firestore users/{uid}.subscriptionStatus = active
  │
Popup re-reads Firestore ──▶ Pro unlocked
```

## Step 1: Razorpay Account

1. Sign up at [razorpay.com](https://razorpay.com), finish KYC for live mode.
2. Enable the **Subscriptions** product (Dashboard → Subscriptions).
3. Use Test Mode while developing.

## Step 2: API Keys

Dashboard → Settings → API Keys → Generate. You get:

- **Key ID** (`rzp_test_...` / `rzp_live_...`) — public, goes in the `RAZORPAY_KEY_ID` param.
- **Key Secret** — server-only, stored as a Firebase secret. Never ship it in the extension.

## Step 3: Create the Monthly Plan

From `extension/functions/`:

```bash
RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=yyy npm run create-plan
```

Copy the printed `plan_...` id — it becomes `RAZORPAY_PLAN_ID`.
(You can also create it manually at Dashboard → Subscriptions → Plans: monthly, ₹150.)

## Step 4: Configure & Deploy the Backend

Firebase **Functions require the Blaze (pay-as-you-go) plan** to call Razorpay.

```bash
cd extension
firebase use <your-project-id>

# Non-secret params — put in functions/.env (see functions/.env.example)
#   RAZORPAY_KEY_ID=rzp_test_xxx
#   RAZORPAY_PLAN_ID=plan_xxx

# Secrets
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET   # value chosen in Step 5

firebase deploy --only functions
```

Deploy prints two URLs. Note the `razorpayWebhook` URL.

## Step 5: Webhook

1. Dashboard → Settings → Webhooks → Add New Webhook.
2. URL: the deployed `razorpayWebhook` function URL.
3. Secret: any strong random string — the same value you set for `RAZORPAY_WEBHOOK_SECRET`.
4. Active events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.resumed`
   - `subscription.halted`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.expired`
   - `subscription.paused`

## Step 6: Configure the Extension

The extension calls the callable `createSubscription` via the Firebase SDK, so it
only needs the normal Firebase config in `extension/.env`. If your functions are
not in `us-central1`, also set:

```
VITE_FIREBASE_FUNCTIONS_REGION=<your-region>
```

## Step 7: Test

Razorpay test instruments:

- Card: `4111 1111 1111 1111`, any future expiry, any CVV
- UPI: `success@razorpay`

Flow: Upgrade → Subscribe → authorize on the hosted page → webhook fires →
reopen popup → Pro is active.

## Subscription Lifecycle

1. User taps **Subscribe ₹150/month**.
2. Backend creates a Razorpay subscription tied to the Firebase `uid` (via `notes`).
3. Hosted authorization page opens; user sets up the mandate and pays.
4. Razorpay charges monthly and sends `subscription.charged` each cycle.
5. Webhook verifies the signature and sets `subscriptionStatus: 'active'` with
   `subscriptionExpiry = current_end`.
6. On halt/cancel/expiry the webhook sets `subscriptionStatus: 'expired'`.

## Pricing

- Plan: ₹150/month, recurring
- Currency: INR
- Methods: UPI, Cards, Net Banking, Wallets
