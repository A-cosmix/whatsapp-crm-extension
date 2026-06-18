import * as crypto from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

initializeApp();

const db = getFirestore();
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');

const SUBSCRIPTION_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

function extractPaymentEmail(payload: Record<string, unknown>): string | null {
  const paymentEntity = (payload.payment as { entity?: Record<string, unknown> } | undefined)?.entity;
  const linkEntity = (payload.payment_link as { entity?: Record<string, unknown> } | undefined)?.entity;

  const email =
    (paymentEntity?.email as string | undefined) ||
    (linkEntity?.customer as { email?: string } | undefined)?.email ||
    (linkEntity?.email as string | undefined);

  return email?.toLowerCase().trim() || null;
}

function extractPaymentId(payload: Record<string, unknown>): string {
  const paymentEntity = (payload.payment as { entity?: Record<string, unknown> } | undefined)?.entity;
  return (
    (paymentEntity?.id as string | undefined) ||
    (paymentEntity?.payment_id as string | undefined) ||
    `plink_${Date.now()}`
  );
}

async function activateUserByEmail(email: string, paymentId: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const expiryDate = Date.now() + SUBSCRIPTION_DURATION_MS;

  const usersSnap = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
  if (!usersSnap.empty) {
    const userDoc = usersSnap.docs[0];
    await userDoc.ref.set(
      {
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate,
        razorpaySubscriptionId: paymentId,
        activatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await db.collection('pending_payments').doc(userDoc.id).set(
      {
        email: normalizedEmail,
        status: 'completed',
        paymentId,
        completedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return true;
  }

  const pendingSnap = await db
    .collection('pending_payments')
    .where('email', '==', normalizedEmail)
    .where('status', '==', 'pending')
    .limit(1)
    .get();

  if (!pendingSnap.empty) {
    const pendingDoc = pendingSnap.docs[0];
    const uid = pendingDoc.id;
    await db.collection('users').doc(uid).set(
      {
        subscriptionStatus: 'active',
        subscriptionExpiry: expiryDate,
        razorpaySubscriptionId: paymentId,
        activatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await pendingDoc.ref.set(
      {
        status: 'completed',
        paymentId,
        completedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return true;
  }

  return false;
}

export const razorpayWebhook = onRequest(
  {
    secrets: [razorpayWebhookSecret],
    cors: false,
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : req.rawBody instanceof Buffer
          ? req.rawBody.toString('utf8')
          : JSON.stringify(req.body);

    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const secret = razorpayWebhookSecret.value();

    if (!verifyRazorpaySignature(rawBody, signature, secret)) {
      console.error('Invalid Razorpay webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body?.event as string | undefined;
    const payload = (req.body?.payload as Record<string, unknown>) || {};

    const paidEvents = ['payment_link.paid', 'payment.captured'];
    if (!event || !paidEvents.includes(event)) {
      res.status(200).send('Ignored');
      return;
    }

    const email = extractPaymentEmail(payload);
    if (!email) {
      console.error('No email in payment payload', event);
      res.status(200).send('No email');
      return;
    }

    const paymentId = extractPaymentId(payload);
    const activated = await activateUserByEmail(email, paymentId);

    if (!activated) {
      console.warn(`Payment received but no user found for ${email}`);
    }

    res.status(200).send('OK');
  },
);
