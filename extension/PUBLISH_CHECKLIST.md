# 🚀 Explain Like WhatsApp — Publish Checklist (Hindi)

Extension **~95% code-complete** hai. Chrome Web Store par publish karne ke liye neeche steps follow karo.

---

## ✅ Code Mein Jo Complete Hai (v1.0.5)

| Feature | Status |
|---------|--------|
| Highlight → Explain (12 modes) | ✅ |
| CosmiQ AI (free) + Claude (optional) | ✅ |
| Firebase login/signup | ✅ |
| 5-day trial + Pro upgrade | ✅ |
| PDF simplifier | ✅ |
| YouTube summarizer | ✅ |
| Word explainer | ✅ |
| Focus mode | ✅ |
| Study notes generator | ✅ |
| Achievements & streaks | ✅ |
| Daily report | ✅ |
| Extension icons (16/48/128) | ✅ |
| Privacy policy content | ✅ |
| ZIP build script | ✅ |

---

## 📋 TUMHE Kya Karna Hai (Publish ke liye)

### STEP 1 — Latest code install karo
```bash
cd ~/whatsapp-crm-extension
git pull origin main
cd extension
npm install
npm run build
```

`chrome://extensions` → Reload → Version **1.0.5** check karo

---

### STEP 2 — Firebase (already done ✅)
Tumhara Firebase already setup hai. Verify karo:
- Authentication → Email/Password ON
- Firestore rules → `extension/firestore.rules` wale rules publish karo

---

### STEP 3 — Razorpay Subscription + Backend (₹150/month)
1. https://dashboard.razorpay.com login → **Subscriptions** enable, API keys lo
2. Monthly ₹150 plan banao: `cd extension/functions && npm run create-plan`
3. Params + secrets set karke `firebase deploy --only functions`
4. Deployed `razorpayWebhook` URL → Razorpay → Webhooks mein add karo

> Poori step-by-step guide: `extension/docs/RAZORPAY_SETUP.md`. Pro ab sirf
> signature-verified webhook se activate hota hai — koi manual "Maine pay kiya" button nahi.

---

### STEP 4 — Privacy Policy host karo (ZAROORI)

Chrome Web Store ko **public URL** chahiye.

**Option A — GitHub Pages (free):**
1. GitHub repo mein `extension/public/privacy.html` ko host karo
2. URL milega: `https://a-cosmix.github.io/whatsapp-crm-extension/extension/public/privacy.html`
   (ya apna domain)

**Option B — Firebase Hosting:**
```bash
firebase init hosting
# public folder: extension/public
firebase deploy
```

Store listing mein yeh URL paste karo.

---

### STEP 5 — Screenshots banao (ZAROORI)

Chrome Web Store ko **kam se kam 1 screenshot** chahiye (1280×800 ya 640×400).

**Kya screenshot lo:**
1. BBC/Wikipedia par text select + Explain popup
2. Hindi/GenZ mode explanation
3. Dashboard with stats
4. PDF/YouTube feature

**Kaise:**
- Windows: `Win + Shift + S`
- Mac: `Cmd + Shift + 4`
- Save as PNG

---

### STEP 6 — Extension ZIP banao
```bash
cd ~/whatsapp-crm-extension/extension
npm run package
```

Yeh banayega: `extension/explain-like-whatsapp.zip`

---

### STEP 7 — Chrome Web Store Submit

1. https://chrome.google.com/webstore/devconsole
2. **$5 one-time fee** pay karo (pehli baar)
3. **New Item** → Upload `explain-like-whatsapp.zip`
4. Fill karo:

| Field | Value |
|-------|-------|
| Name | Explain Like WhatsApp |
| Category | Productivity |
| Description | Highlight any difficult text on any website and get instant AI explanations in simple WhatsApp-style language. 12 modes: Hindi, GenZ, Exam Notes & more! |
| Privacy policy URL | (Step 4 ka URL) |
| Screenshots | (Step 5 ki images) |

5. **Submit for review** → 1-3 din mein approve

---

## ⚠️ Jo Abhi Manual Hai (v1.0 ke liye OK)

| Item | Status | Future |
|------|--------|--------|
| Payment auto-verify | Manual button | Razorpay webhook + backend |
| Claude API | User adds own key | Optional |
| PDF export | Markdown only | Can add later |
| Landing page | explainlikewhatsapp.com | Optional marketing site |

---

## 🎯 Quick Publish Timeline

```
Day 1: git pull + build + Razorpay link + privacy host
Day 2: Screenshots + ZIP + Store listing submit
Day 3-5: Google review wait
Day 5+: LIVE on Chrome Web Store! 🎉
```

---

## Support Email Setup (recommended)

Store listing ke liye contact email chahiye:
- `privacy@explainlikewhatsapp.com` ya apna Gmail
- Google account email bhi chalega

---

**Made with 💚 in India — Explain Like WhatsApp v1.0.5**
