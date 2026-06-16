# Razorpay Payment Setup Guide

## Step 1: Create Razorpay Account

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification for live payments
3. Use Test Mode for development

## Step 2: Get API Keys

1. Dashboard → Settings → API Keys
2. Generate Key Pair
3. Copy **Key ID** to `.env`:

```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

4. Keep **Key Secret** on your backend only (never in extension code)

## Step 3: Backend for Payment Verification

The extension needs a backend to securely verify payments. Deploy this as a Cloud Function or Express server:

```javascript
// server.js
const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
app.post('/api/payments/create-order', async (req, res) => {
  const { amount, currency, userId } = req.body;
  const order = await razorpay.orders.create({
    amount,
    currency: currency || 'INR',
    receipt: `elw_${userId}_${Date.now()}`,
    notes: { userId },
  });
  res.json({ orderId: order.id, amount: order.amount });
});

// Verify payment
app.post('/api/payments/verify', (req, res) => {
  const { orderId, paymentId, signature, userId } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSignature === signature) {
    // Activate subscription in Firebase
    res.json({ success: true, orderId, paymentId });
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
});

app.listen(3000);
```

## Step 4: Configure Extension

```
VITE_BACKEND_URL=https://your-api.example.com
```

## Step 5: Test Payments

Use Razorpay test cards:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- UPI: `success@razorpay`

## Step 6: Webhooks (Production)

1. Dashboard → Webhooks → Add URL: `https://your-api.example.com/webhooks/razorpay`
2. Events: `payment.captured`, `subscription.charged`, `payment.failed`
3. Handle failed payments and send renewal reminders

## Pricing

- Plan: ₹150/year (15000 paise)
- Currency: INR
- Payment methods: UPI, Cards, Net Banking, Wallets

## Subscription Lifecycle

1. User clicks "Pay ₹150/year"
2. Extension creates order via backend
3. Razorpay checkout opens
4. User pays via UPI/Card
5. Backend verifies signature
6. Firebase user profile updated: `subscriptionStatus: 'active'`
7. Renewal reminder 7 days before expiry
