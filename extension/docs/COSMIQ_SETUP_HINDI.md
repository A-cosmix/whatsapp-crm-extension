# CosmiQ AI + Razorpay — Poora Setup Guide (Hindi)

## Tumhara FREE Stack

| Service | Kya | Cost |
|---------|-----|------|
| CosmiQ AI (Hugging Face) | Text explain | **FREE** |
| Firebase | Login + Database | **FREE** |
| Razorpay Payment Link | ₹150 payment | **2% per sale** |
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

## PART 3 — Razorpay Payment Link Banao

### Step 1: Login
https://dashboard.razorpay.com (papa ka account)

### Step 2: Payment Link
Left menu → **Payment Links** → **+ New Payment Link**

| Field | Value |
|-------|-------|
| Title | Explain Like WhatsApp Pro |
| Amount | ₹150 |
| Description | 1 Year Unlimited Access |

### Step 3: Copy Link
Example: `https://rzp.io/l/abc123xyz`

### Step 4: Extension mein add karo
1. Extension icon → **⚙️ Settings**
2. **Razorpay Payment Link** box mein paste karo
3. **Save Settings**

### Step 5: Test Payment
1. Dashboard → **Upgrade ₹150/yr**
2. Razorpay page khulega
3. Test UPI se pay karo
4. **"Maine Payment Kar Diya"** dabao → Pro activate

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
User → Upgrade ₹150
    ↓
Razorpay Payment Link (UPI/Card)
    ↓
Paisa Razorpay account mein
    ↓
User → "Maine Payment Kar Diya"
    ↓
Pro activated ✅
```

Baad mein automatic webhook add kar sakte ho (Cloudflare Worker — free).
