import { doc, setDoc } from 'firebase/firestore';
import { getUserProfile, getSubscriptionStatus, getFirebase } from '@/services/auth/firebase-auth';
import { scheduleRenewalReminder } from '@/services/payments/razorpay';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function markPendingPayment(uid: string, email: string): Promise<void> {
  const { db } = getFirebase();
  await setDoc(
    doc(db, 'pending_payments', uid),
    {
      email: email.toLowerCase().trim(),
      status: 'pending',
      startedAt: Date.now(),
    },
    { merge: true },
  );
}

export async function waitForPaymentActivation(
  uid: string,
  options?: { maxAttempts?: number; intervalMs?: number; onAttempt?: (attempt: number) => void },
): Promise<boolean> {
  const maxAttempts = options?.maxAttempts ?? 100;
  const intervalMs = options?.intervalMs ?? 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    options?.onAttempt?.(attempt);
    const profile = await getUserProfile(uid);
    if (profile && getSubscriptionStatus(profile) === 'active') {
      await chrome.storage.local.set({
        subscription: {
          status: 'active',
          expiryDate: profile.subscriptionExpiry,
          activatedAt: Date.now(),
        },
      });
      await scheduleRenewalReminder();
      return true;
    }
    if (attempt < maxAttempts) {
      await sleep(intervalMs);
    }
  }
  return false;
}
