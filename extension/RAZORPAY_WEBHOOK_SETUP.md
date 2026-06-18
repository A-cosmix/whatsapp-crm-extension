# Razorpay Auto-Payment Setup (Hindi + English)

Extension v1.1.0 mein payment automatic hai — user pay kare, Pro turant activate ho.

## Step 1: Firebase Functions Deploy

```bash
cd extension
npm install --prefix functions
firebase login
firebase use explain-like-whatsapp
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET
# Razorpay Dashboard → Webhooks → Secret copy karke paste karo

firebase deploy --only functions,firestore:rules
```

Deploy ke baad webhook URL milega:
```
https://us-central1-explain-like-whatsapp.cloudfunctions.net/razorpayWebhook
```

## Step 2: Razorpay Webhook Configure

1. [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings** → **Webhooks**
2. **+ Add New Webhook**
3. URL: upar wala Firebase Function URL
4. Events select karo:
   - `payment_link.paid`
   - `payment.captured`
5. Secret generate karo — same secret Firebase mein set karo (`RAZORPAY_WEBHOOK_SECRET`)

## Step 3: Payment Link (Already Done ✅)

Aapka link: `https://rzp.io/rzp/611tweDZ` (₹150/year)

Extension Settings ya `.env` mein:
```
VITE_RAZORPAY_PAYMENT_LINK=https://rzp.io/rzp/611tweDZ
```

## Step 4: Test Payment

1. Extension reload karo (v1.1.0)
2. Login karo
3. Upgrade → Pay button → Razorpay tab khulega
4. Test mode mein test UPI/card use karo
5. Payment ke 5-30 sec baad Pro auto-activate hona chahiye

## Kaise Kaam Karta Hai

```
User clicks Pay
    → pending_payments/{uid} Firestore mein save
    → Razorpay Payment Link khulta hai (email prefilled)
    → User pays
    → Razorpay webhook → Firebase Function
    → Function user dhundhta hai (email se)
    → users/{uid} → subscriptionStatus: active
    → Extension poll karta hai → Pro activated! 🎉
```

## Trial System (3 days)

- Naye user ko 3 din free trial
- Ek email = ek trial (`trial_registry`)
- Ek device = ek trial (`trial_devices`)
- Reinstall + naya email = trial nahi milega agar same device pe pehle use ho chuka

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Payment ho(item) nahi ho rahi | Webhook deploy check karo, Razorpay logs dekho |
| Invalid signature | Webhook secret Firebase aur Razorpay mein same hona chahiye |
| User not found | Payment mein wahi email use karo jo extension login email hai |
| Manual activate button | v1.1.0 mein hata diya — sirf auto |

## Firestore Collections (New)

- `trial_registry/{email}` — trial used per email
- `trial_devices/{deviceId}` — trial used per device  
- `pending_payments/{uid}` — payment in progress

Users **khud** subscriptionStatus change nahi kar sakte — sirf webhook (Admin SDK) kar sakta hai.
