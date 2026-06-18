import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebase, getUserProfile, getSubscriptionStatus } from '@/services/auth/firebase-auth';

const FUNCTIONS_REGION = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';

export interface CreateSubscriptionResult {
  subscriptionId: string;
  shortUrl: string;
}

/**
 * Ask the backend to create a Razorpay subscription for the signed-in user.
 * The backend uses the Razorpay secret key (never shipped in the extension) and
 * returns a hosted authorization page (`short_url`) the user opens to pay.
 */
export async function createSubscription(): Promise<CreateSubscriptionResult> {
  const { app } = getFirebase();
  const functions = getFunctions(app, FUNCTIONS_REGION);
  const callable = httpsCallable<unknown, CreateSubscriptionResult>(functions, 'createSubscription');
  const { data } = await callable({});
  if (!data?.shortUrl) throw new Error('Backend did not return a payment link');
  return data;
}

/** Open the Razorpay hosted subscription page in a new tab (MV3 popups can't run remote checkout.js). */
export async function openSubscriptionCheckout(shortUrl: string): Promise<void> {
  await chrome.tabs.create({ url: shortUrl });
}

/**
 * Poll Firestore until the webhook marks the subscription active. Pro is never
 * granted client-side — this only reflects the server-verified status.
 */
export async function waitForActiveSubscription(
  uid: string,
  { attempts = 20, intervalMs = 3000 }: { attempts?: number; intervalMs?: number } = {},
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const profile = await getUserProfile(uid);
    if (profile && getSubscriptionStatus(profile) === 'active') return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

export function formatPrice(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toFixed(0)}`;
}
