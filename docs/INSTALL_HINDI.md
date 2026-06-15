# Install Guide (Hindi)

> `.output` folder **build ke baad** banta hai — clone karne se automatically nahi aata.

## Tarika 1 — Bina build (ZIP download) ✅ Sabse aasaan

1. GitHub kholo: https://github.com/A-cosmix/whatsapp-crm-extension/actions
2. **Build Extension** workflow par click karo (latest green ✓)
3. Neeche **Artifacts** → `whatsapp-crm-extension` download karo
4. ZIP extract karo — andar `chrome-mv3` folder milega
5. Chrome → `chrome://extensions` → Developer mode ON → **Load unpacked**
6. Extract kiye hue **`chrome-mv3`** folder ko select karo

---

## Tarika 2 — Khud build karo

Terminal mein copy-paste karo:

```bash
cd ~
rm -rf whatsapp-crm-extension
git clone https://github.com/A-cosmix/whatsapp-crm-extension.git
cd whatsapp-crm-extension
ls package.json
```

Agar `package.json` dikhe, aage chalao:

```bash
# Node.js fix (agar pehle error aaya ho)
sudo apt remove -y libnode-dev nodejs npm 2>/dev/null
sudo apt install -y nodejs

node -v
npm -v

npm install
npm run build
ls .output/chrome-mv3
```

Agar last command mein files dikhen → Chrome mein load karo:

```
/home/blocksone/whatsapp-crm-extension/.output/chrome-mv3
```

---

## Extension dekhne ke liye

1. https://web.whatsapp.com kholo
2. Extension icon click → dark side panel

---

## Common errors

| Problem | Fix |
|---------|-----|
| `package.json` nahi hai | Purana clone hai — `rm -rf` karke dubara `git clone` |
| `.output` folder nahi | `npm run build` chalao |
| `npm` command nahi | `sudo apt install -y nodejs` |
| Node install fail | `sudo apt remove -y libnode-dev` phir dubara install |
