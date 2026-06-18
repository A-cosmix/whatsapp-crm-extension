const crypto = require('crypto');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// Public (non-secret) config
const RAZORPAY_KEY_ID = defineString('RAZORPAY_KEY_ID');
const RAZORPAY_PLAN_ID = defineString('RAZORPAY_PLAN_ID');

// Secrets — set with `firebase functions:secrets:set <NAME>`
const RAZORPAY_KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
const RAZORPAY_WEBHOOK_SECRET = defineSecret('RAZORPAY_WEBHOOK_SECRET');

const MONTH_MS = 31 * 24 * 60 * 60 * 1000;

function razorpayClient() {
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID.value(),
    key_secret: RAZORPAY_KEY_SECRET.value(),
  });
}

/**
 * Callable: creates a monthly Razorpay subscription for the signed-in user and
 * returns the hosted authorization page (`short_url`). The key secret never
 * leaves the server. The subscription is tied to the Firebase uid via `notes`,
 * so the webhook can map a charge back to the right user.
 */
exports.createSubscription = onCall(
  { secrets: [RAZORPAY_KEY_SECRET] },
  async (request) => {
    const uid = request.auth && request.auth.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in required to subscribe.');

    const planId = RAZORPAY_PLAN_ID.value();
    if (!planId) throw new HttpsError('failed-precondition', 'RAZORPAY_PLAN_ID is not configured.');

    const email = (request.auth.token && request.auth.token.email) || '';
    const userRef = db.collection('users').doc(uid);

    // Reuse an existing subscription that is still awaiting authorization/payment.
    const snap = await userRef.get();
    const existing = snap.exists ? snap.data() : null;
    if (existing && existing.razorpaySubscriptionId) {
      try {
        const current = await razorpayClient().subscriptions.fetch(existing.razorpaySubscriptionId);
        if (['created', 'authenticated', 'pending'].includes(current.status) && current.short_url) {
          return { subscriptionId: current.id, shortUrl: current.short_url };
        }
      } catch {
        // Stale id — fall through and create a fresh subscription.
      }
    }

    const subscription = await razorpayClient().subscriptions.create({
      plan_id: planId,
      total_count: 120, // up to 10 years of monthly cycles
      customer_notify: 1,
      notes: { uid, email },
    });

    await userRef.set({ razorpaySubscriptionId: subscription.id }, { merge: true });
    return { subscriptionId: subscription.id, shortUrl: subscription.short_url };
  },
);

/**
 * Webhook: the only place a user is granted Pro. Verifies Razorpay's HMAC
 * signature against the raw body, then flips the mapped user's subscription
 * status in Firestore. Configure at Razorpay Dashboard → Webhooks with events
 * subscription.activated / charged / halted / cancelled / completed / paused.
 */
exports.razorpayWebhook = onRequest(
  { secrets: [RAZORPAY_WEBHOOK_SECRET] },
  async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET.value())
      .update(req.rawBody)
      .digest('hex');

    if (!signature || signature !== expected) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body && req.body.event;
    const sub = req.body && req.body.payload && req.body.payload.subscription && req.body.payload.subscription.entity;
    const uid = sub && sub.notes && sub.notes.uid;

    if (!uid) {
      res.status(200).send('ignored: no uid');
      return;
    }

    const userRef = db.collection('users').doc(uid);
    const activeEvents = ['subscription.activated', 'subscription.charged', 'subscription.resumed'];
    const inactiveEvents = [
      'subscription.halted',
      'subscription.cancelled',
      'subscription.completed',
      'subscription.expired',
      'subscription.paused',
    ];

    if (activeEvents.includes(event)) {
      const expirySec = sub.current_end || sub.charge_at || 0;
      await userRef.set(
        {
          subscriptionStatus: 'active',
          subscriptionExpiry: expirySec ? expirySec * 1000 : Date.now() + MONTH_MS,
          razorpaySubscriptionId: sub.id,
        },
        { merge: true },
      );
    } else if (inactiveEvents.includes(event)) {
      await userRef.set({ subscriptionStatus: 'expired' }, { merge: true });
    }

    res.status(200).send('ok');
  },
);
