# Extension Fix — v1.0.2 (Firebase Error Fix)

## Error jo tumhe dikha:
```
No document to update: .../users/xxxxx
```

**Matlab:** Login ho gaya lekin Firestore mein user profile document nahi bana. Ab code automatically bana dega.

---

## EXACT Steps (ek ek karke):

### STEP 1 — Terminal kholo, yeh paste karo:
```bash
cd ~/whatsapp-crm-extension
git pull origin main
cd extension
npm run build
```

Wait karo jab tak `✓ built` na dikhe.

### STEP 2 — Chrome update
Top-right **"Relaunch to update"** dabao (agar dikhe).

### STEP 3 — Extension reload
1. Address bar: `chrome://extensions`
2. **Explain Like WhatsApp** dhundo
3. **Reload** (🔄) button dabao
4. **Version 1.0.2** check karo (pehle 1.0.0 tha)

### STEP 4 — Errors clear karo
1. Extension card par **Errors** (red) dabao
2. **Clear all** dabao

### STEP 5 — Extension logout/login
1. Extension icon dabao
2. Settings ⚙️ → **Logout**
3. Phir se **Login** karo (same email/password)

### STEP 6 — Website par test
1. BBC ya koi article kholo
2. **F5** dabao (page refresh)
3. Paragraph select karo
4. **💬 Explain** dabao
5. 30-60 second wait karo

---

## Version check (important!)

| Version | Status |
|---------|--------|
| 1.0.0 | ❌ Purana — kaam nahi karega |
| 1.0.1 | ⚠️ Partial fix |
| 1.0.2 | ✅ Latest — Firebase error fix |

`chrome://extensions` par **1.0.2** dikhe tab sahi hai.
