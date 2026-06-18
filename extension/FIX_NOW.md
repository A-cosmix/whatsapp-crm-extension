# Extension Kaam Nahi Kar Raha? — 2 Minute Fix

## Error: "Extension context invalidated"

Yeh tab hota hai jab extension reload hui lekin webpage purani hai.

### EXACT steps (copy-paste):

```bash
cd ~/whatsapp-crm-extension
git pull origin main
cd extension
npm run build
```

### Chrome mein:

1. Address bar: `chrome://extensions`
2. **Explain Like WhatsApp** → **Reload** button dabao
3. Version check: **1.0.1** dikhna chahiye
4. BBC/Wikipedia tab par jao → **F5** dabao
5. Text select karo → **Explain** dabao

### Agar "Relaunch to update" dikhe (Chrome top-right):

Pehle woh dabao, phir upar ke steps karo.

### v1.0.1 mein kya naya hai:

- Extension reload hone par tabs **auto-refresh**
- Context dead ho to page **khud reload** (ek baar)
- GenZ/saare modes trial mein free
