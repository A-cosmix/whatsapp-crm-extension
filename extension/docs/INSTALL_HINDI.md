# Explain Like WhatsApp — Step by Step Guide (Hindi)

> Puri extension setup, use aur publish karne ka complete guide

---

## PART 1: GitHub Se Code Download Karna

### Option A — Alag Repo (Recommended)
```
https://github.com/A-cosmix/explain-like-whatsapp
```

### Option B — WhatsApp CRM Repo ke andar
```
https://github.com/A-cosmix/whatsapp-crm-extension
```
Is repo mein `extension/` folder ke andar pura project hai.

### Download karne ke steps:
1. GitHub link kholo
2. Green **Code** button dabao
3. **Download ZIP** select karo
4. ZIP extract karo apne computer par

---

## PART 2: Computer Par Setup Karna

### Step 1: Node.js Install Karo
- Website kholo: https://nodejs.org
- **LTS version** download karo (18 ya 20)
- Install karo, terminal/cmd kholo
- Check karo:
```bash
node --version
npm --version
```

### Step 2: Project Folder Mein Jao
```bash
cd extension
```
(Agar ZIP se download kiya hai to `extension` folder ke andar jao)

### Step 3: Dependencies Install Karo
```bash
npm install
```
⏳ 1-2 minute lagenge. Wait karo.

### Step 4: Environment File Banao
```bash
cp .env.example .env
```
Windows par:
```cmd
copy .env.example .env
```

---

## PART 3: Firebase Setup (Login ke liye)

### Step 1: Firebase Account
1. https://console.firebase.google.com kholo
2. Google account se login karo
3. **Add project** dabao
4. Project name: `explain-like-whatsapp`
5. Create karo

### Step 2: Authentication Enable Karo
1. Left menu → **Build** → **Authentication**
2. **Get started** dabao
3. **Email/Password** enable karo
4. Save karo

### Step 3: Firestore Database Banao
1. Left menu → **Firestore Database**
2. **Create database** dabao
3. **Production mode** select karo
4. Location: `asia-south1` (Mumbai — India ke liye best)
5. Enable karo

### Step 4: Web App Config Copy Karo
1. Project Settings (gear icon) → **General**
2. **Your apps** → Web icon `</>` dabao
3. App nickname: `elw-extension`
4. Config copy karo aur `.env` file mein paste karo:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=explain-like-whatsapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=explain-like-whatsapp
VITE_FIREBASE_STORAGE_BUCKET=explain-like-whatsapp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## PART 4: Claude API Key (AI ke liye)

### Step 1: Anthropic Account
1. https://console.anthropic.com kholo
2. Account banao
3. **API Keys** section mein jao
4. **Create Key** dabao
5. Key copy karo (sirf ek baar dikhegi!)

### Step 2: Extension Mein Add Karo
- Extension install hone ke baad
- Extension icon dabao → **Settings** → **Claude API Key**
- Key paste karo → Save

---

## PART 5: Extension Build Karna

```bash
npm run build
```

✅ Success hone par `dist/` folder banega — yahi Chrome mein load karna hai.

---

## PART 6: Chrome Mein Extension Load Karna

1. Chrome kholo
2. Address bar mein likho: `chrome://extensions`
3. Top-right **Developer mode** ON karo
4. **Load unpacked** dabao
5. `extension/dist` folder select karo
6. ✅ Extension install ho gaya!

---

## PART 7: Extension Use Karna

### Pehli Baar Setup
1. Extension icon (toolbar mein) dabao
2. **Get Started Free** dabao
3. Account banao (email + password)
4. Onboarding screens dekho (5 steps)
5. Settings mein Claude API key add karo

### Text Explain Karna
1. Koi bhi website kholo (article, blog, docs)
2. Difficult text **select/highlight** karo
3. Floating **💬 Explain** button dikhega
4. Button dabao → AI explanation aayega!

### Keyboard Shortcut
- Text select karo
- **Alt + E** dabao
- Explanation popup khulega

### Explanation Modes
| Mode | Kya karta hai |
|------|--------------|
| 💬 WhatsApp | Casual Hinglish style |
| 🇮🇳 Hindi | Simple Hindi mein |
| 🔥 GenZ | GenZ slang style |
| 📝 Exam Notes | Exam ke liye notes |
| 👶 Child | 5 saal ke bacche ko samjhane jaisa |
| 🎮 Gamer | Gaming analogies |

### YouTube Video Simplify
1. YouTube video kholo
2. Neeche right mein **📺 Simplify Video** button dikhega
3. Dabao → summary + study notes milega

### PDF Simplify
1. Browser mein PDF kholo
2. Top-right mein buttons dikhenge:
   - Summarize PDF
   - Study Notes
   - Explain PDF

---

## PART 8: Razorpay Setup (Payment — ₹150/year)

> Sirf tab karo jab real users se payment lena ho

1. https://razorpay.com par account banao
2. KYC complete karo
3. Dashboard → Settings → API Keys
4. Key ID copy karo → `.env` mein:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```
5. Backend deploy karo payment verification ke liye
   - Poori guide: `docs/RAZORPAY_SETUP.md`

---

## PART 9: Chrome Web Store Par Publish Karna

### Step 1: Build + ZIP
```bash
npm run build
cd dist
zip -r ../explain-like-whatsapp.zip .
```

### Step 2: Developer Account
1. https://chrome.google.com/webstore/devconsole
2. $5 one-time fee pay karo
3. Developer account activate hoga

### Step 3: Upload
1. **New Item** dabao
2. ZIP file upload karo
3. Screenshots add karo (1280x800)
4. Description likho (README se copy karo)
5. Privacy policy URL add karo
6. Submit for review

⏳ Review: 1-3 din lagte hain

---

## Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| Explain button nahi dikh raha | Page refresh karo, text select karo |
| "API key not configured" | Settings mein Claude key add karo |
| Login nahi ho raha | Firebase `.env` check karo |
| Build fail ho raha | `npm install` phir se chalao |
| Extension load nahi ho raha | `dist/` folder select karo, `extension/` nahi |

---

## GitHub Links (A-cosmix Account)

| Kya | Link |
|-----|------|
| Main Repo | https://github.com/A-cosmix/explain-like-whatsapp |
| CRM Repo (extension folder) | https://github.com/A-cosmix/whatsapp-crm-extension |
| Merged PR | https://github.com/A-cosmix/whatsapp-crm-extension/pull/7 |

---

## Quick Commands Cheat Sheet

```bash
# Setup
cd extension
npm install
cp .env.example .env

# Development (live reload)
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

---

**Made with 💚 in India — Explain Like WhatsApp v1.0.0**
