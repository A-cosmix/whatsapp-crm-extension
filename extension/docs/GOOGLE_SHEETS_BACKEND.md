# Google Sheets + Apps Script Subscription Backend

This backend gives the extension an authoritative source of truth for:

1. **Paid Pro access** — the Razorpay webhook records every successful payment in a
   Google Sheet, and the extension reads it to unlock Pro **instantly** (no manual
   "I paid" button needed).
2. **One free trial per device** — each device's fingerprint is recorded the first
   time it syncs, so the trial can't be reused by making a new account.

The extension talks to a single Apps Script **Web App URL** that you paste into
**Settings → Subscription Backend URL** (or set `VITE_BACKEND_URL` at build time).

---

## 1. Create the Google Sheet

Create a spreadsheet with two tabs (exact names):

- **`Payments`** with header row: `email | paymentId | amount | status | createdAt | expiry`
- **`Trials`** with header row: `deviceId | fingerprint | email | start | end`

## 2. Add the Apps Script

In the sheet: **Extensions → Apps Script**, replace `Code.gs` with the script
below. Set `RAZORPAY_WEBHOOK_SECRET` if you configured a webhook secret in Razorpay.

```javascript
const TRIAL_DAYS = 5;
const PLAN_DAYS = 365;
const RAZORPAY_WEBHOOK_SECRET = ''; // optional: paste your Razorpay webhook secret

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

// ---- GET: ping + sync (called by the extension) ----
function doGet(e) {
  const action = (e.parameter.action || '').toLowerCase();
  if (action === 'ping') return jsonOut({ ok: true });
  if (action === 'sync') return jsonOut(handleSync(e.parameter));
  return jsonOut({ ok: false, error: 'unknown action' });
}

function handleSync(p) {
  const email = (p.email || '').trim().toLowerCase();
  const deviceId = (p.deviceId || '').trim();
  const fingerprint = (p.fingerprint || '').trim();
  const now = Date.now();

  // --- Subscription (Payments sheet) ---
  let pro = false, expiry = null, paymentId = '';
  const pay = sheet('Payments').getDataRange().getValues();
  for (let i = 1; i < pay.length; i++) {
    const row = pay[i];
    if (String(row[0]).trim().toLowerCase() !== email) continue;
    const status = String(row[3]).trim().toLowerCase();
    const exp = Number(row[5]);
    if ((status === 'paid' || status === 'active' || status === 'captured') && exp > now) {
      pro = true;
      expiry = exp;
      paymentId = String(row[1]);
    }
  }

  // --- Trial (Trials sheet) ---
  const trials = sheet('Trials');
  const tv = trials.getDataRange().getValues();
  let used = false, start = null, end = null, ownerEmail = '';
  for (let i = 1; i < tv.length; i++) {
    const row = tv[i];
    const rDevice = String(row[0]).trim();
    const rFp = String(row[1]).trim();
    if ((deviceId && rDevice === deviceId) || (fingerprint && rFp === fingerprint)) {
      used = true;
      ownerEmail = String(row[2]).trim().toLowerCase();
      start = Number(row[3]) || null;
      end = Number(row[4]) || null;
      break;
    }
  }
  // Register this device's trial the first time we see it.
  if (!used && (deviceId || fingerprint)) {
    start = now;
    end = now + TRIAL_DAYS * 86400000;
    ownerEmail = email;
    trials.appendRow([deviceId, fingerprint, email, start, end]);
    used = true;
  }

  const plan = pro ? 'pro' : (end && end > now ? 'trial' : 'expired');
  return {
    ok: true,
    email: email,
    pro: pro,
    plan: plan,
    expiry: expiry,
    paymentId: paymentId,
    trial: { used: used, start: start, end: end, ownerEmail: ownerEmail }
  };
}

// ---- POST: Razorpay webhook ----
function doPost(e) {
  try {
    if (RAZORPAY_WEBHOOK_SECRET) {
      const sig = e.parameter['x-razorpay-signature'] ||
        (e.headers && (e.headers['X-Razorpay-Signature'] || e.headers['x-razorpay-signature']));
      const expected = Utilities.base64Encode(
        Utilities.computeHmacSha256Signature(e.postData.contents, RAZORPAY_WEBHOOK_SECRET)
      );
      // Razorpay sends hex; compute hex too for comparison.
      const hex = Utilities.computeHmacSha256Signature(e.postData.contents, RAZORPAY_WEBHOOK_SECRET)
        .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
      if (sig && sig !== hex && sig !== expected) {
        return jsonOut({ ok: false, error: 'bad signature' });
      }
    }

    const body = JSON.parse(e.postData.contents);
    const entity =
      (body.payload && body.payload.payment && body.payload.payment.entity) ||
      (body.payload && body.payload.payment_link && body.payload.payment_link.entity) || {};
    const email = (entity.email ||
      (entity.notes && (entity.notes.email || entity.notes.Email)) || '').trim().toLowerCase();
    const paymentId = entity.id || ('pay_' + Date.now());
    const amount = entity.amount || 0;
    const now = Date.now();

    if (email) {
      sheet('Payments').appendRow([
        email, paymentId, amount, 'paid', now, now + PLAN_DAYS * 86400000
      ]);
    }
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}
```

## 3. Deploy as a Web App

- **Deploy → New deployment → Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Copy the `/exec` URL.

## 4. Wire it up

- Paste the `/exec` URL into the extension **Settings → Subscription Backend URL**.
- In **Razorpay Dashboard → Settings → Webhooks**, add the same `/exec` URL and
  enable `payment.captured` and `payment_link.paid` events (and set the secret if
  you filled `RAZORPAY_WEBHOOK_SECRET`).
- Make sure the Razorpay Payment Link forwards the buyer email (the extension
  already appends `email`/`prefill[email]` to the link).

## Contract summary (what the extension expects)

`GET {WEB_APP_URL}?action=sync&email=&deviceId=&fingerprint=` returns:

```json
{
  "ok": true,
  "pro": true,
  "plan": "pro",
  "expiry": 1750000000000,
  "paymentId": "pay_xxx",
  "trial": { "used": true, "start": 1740000000000, "end": 1740400000000, "ownerEmail": "a@b.com" }
}
```

The client (`src/services/backend/subscription-backend.ts`) is tolerant of common
field-name variants (`isPro`/`active`, `subscriptionExpiry`/`validTill`, epoch
seconds or ms, ISO strings), so minor differences in your script still work.
