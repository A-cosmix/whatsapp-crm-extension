# CosmiQ AI + Razorpay — Poora Setup Guide (Hindi)

## Tumhara FREE Stack

| Service | Kya | Cost |
|---------|-----|------|
| CosmiQ AI (Hugging Face) | Text explain | **FREE** |
| Firebase | Login + Database | **FREE** |
| Razorpay Subscriptions | ₹150/month recurring | **~2% per charge** |
| Chrome Dev Account | Publish | Already hai ✅ |

---

## PART 1 — Extension Update (Terminal)

```bash
cd ~/whatsapp-crm-extension
git pull origin main
cd extension
npm install
npm run build
```

Chrome → `chrome://extensions` → **Reload** 🔄

**Ab Claude API key ki zaroorat NAHI** — CosmiQ AI default hai!

---

## PART 2 — Explain Test (FREE)

1. https://en.wikipedia.org kholo
2. Text select karo
3. **💬 Explain** dabao
4. Pehli baar 30-60 sec lag sakta hai (HF Space wake up)
5. Explanation aayega ✅

---

## PART 3 — Razorpay Subscription Setup (₹150/month)

Ab honor-system payment link nahi hai. Ab **Razorpay Subscriptions + backend**
hai jo payment verify karke hi Pro deta hai. Poori steps:
[docs/RAZORPAY_SETUP.md](RAZORPAY_SETUP.md)

### Short version
1. Razorpay Dashboard → **Subscriptions** enable karo, API keys lo.
2. Monthly ₹150 plan banao: `cd extension/functions && npm run create-plan`.
3. Params (`RAZORPAY_KEY_ID`, `RAZORPAY_PLAN_ID`) + secrets
   (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) set karke
   `firebase deploy --only functions`.
4. Deployed `razorpayWebhook` URL ko Razorpay → Webhooks mein add karo.

### Test Payment
1. Extension → **Upgrade ₹150/mo** → **Subscribe**
2. Razorpay hosted page khulega → test UPI `success@razorpay` se pay karo
3. Webhook fire hote hi Pro **apne aap** activate (popup dubara kholo)

---

## PART 4 — Chrome Web Store Publish

1. Build: `npm run build`
2. Zip: `cd dist && zip -r ../elw.zip .`
3. https://chrome.google.com/webstore/devconsole
4. Upload zip
5. Screenshots + description add karo
6. Submit for review

---

## Settings Mein AI Engine

| Option | Kab use karein |
|--------|----------------|
| **🚀 CosmiQ (Free)** | Default — tumhara HF model |
| **🤖 Claude (Paid)** | Premium quality, API key chahiye |

---

## CosmiQ Space Info

- **Space:** https://huggingface.co/spaces/JNX25/cosmiq-ai-assistant
- **API:** `/chat_with_cosmiq`
- **Free tier:** Hugging Face CPU
- **Note:** Space 15 min idle ke baad sleep — pehli request slow

---

## Agar Explain slow ho

- 30-60 second wait karo (space waking up)
- Phir dubara try karo
- HF Space ko "Running" rakho (periodic ping)

---

## Payment Flow

```
User → Upgrade ₹150/month → Subscribe
    ↓
Backend (Cloud Function) Razorpay subscription banata hai
    ↓
Razorpay hosted page (UPI/Card) → user pay karta hai
    ↓
Razorpay webhook (signed) → Cloud Function verify karta hai
    ↓
Firestore users/{uid}.subscriptionStatus = active
    ↓
Pro activated ✅ (har month auto-charge)
```
