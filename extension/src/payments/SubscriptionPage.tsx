import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/types';
import { PAID_PLAN_PRICE_INR } from '@/types';
import { activateSubscription, getSubscriptionStatus } from '@/services/auth/firebase-auth';
import { scheduleRenewalReminder } from '@/services/payments/razorpay';
import { isBackendConfigured } from '@/services/backend/subscription-backend';
import { saveLocalProfile } from '@/services/storage/indexed-db';

type SyncResponse = { pro?: boolean; subscriptionStatus?: string } | undefined;

interface SubscriptionPageProps {
  user: UserProfile;
  onBack: () => void;
  /** Reconciles subscription with the backend and returns the result. */
  onSuccess: () => Promise<SyncResponse> | void;
}

const FEATURES = [
  '✅ Unlimited explanations',
  '✅ All 12 explanation modes',
  '✅ PDF simplifier & Markdown export',
  '✅ YouTube video summarizer',
  '✅ Study notes generator',
  '✅ Focus reading mode',
  '✅ No watermarks',
  '✅ CosmiQ AI powered explanations',
];

const DEFAULT_PAYMENT_LINK = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK || '';

const VERIFY_POLL_INTERVAL_MS = 5000;
const VERIFY_POLL_MAX_TRIES = 24; // ~2 minutes

export function SubscriptionPage({ user, onBack, onSuccess }: SubscriptionPageProps) {
  const [paid, setPaid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [backendOn, setBackendOn] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triesRef = useRef(0);
  const mountedRef = useRef(true);

  const isPro = getSubscriptionStatus(user) === 'active';

  useEffect(() => {
    isBackendConfigured().then(setBackendOn);
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const runSync = async (): Promise<boolean> => {
    const res = await onSuccess();
    return !!(res && res.pro);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollRef.current || !backendOn) return;
    triesRef.current = 0;
    setVerifying(true);
    pollRef.current = setInterval(async () => {
      triesRef.current += 1;
      const pro = await runSync().catch(() => false);
      if (!mountedRef.current) return;
      if (pro) {
        stopPolling();
        setVerifying(false);
        setVerifyMsg('🎉 Payment verified — Pro unlocked!');
      } else if (triesRef.current >= VERIFY_POLL_MAX_TRIES) {
        stopPolling();
        setVerifying(false);
        setVerifyMsg('Payment abhi verify nahi hui. "Verify Payment" dabao ya thodi der baad Profile se check karo.');
      }
    }, VERIFY_POLL_INTERVAL_MS);
  };

  const handlePayment = async () => {
    const stored = await chrome.storage.local.get('razorpayPaymentLink');
    const link = (stored.razorpayPaymentLink as string) || DEFAULT_PAYMENT_LINK;

    if (!link || link.includes('your-payment-link')) {
      alert('Payment link not configured yet. Ask admin to add Razorpay Payment Link in Settings.');
      return;
    }

    // Open Razorpay Payment Link — UPI, Card, Net Banking
    const paymentUrl = `${link}${link.includes('?') ? '&' : '?'}email=${encodeURIComponent(user.email)}&prefill[email]=${encodeURIComponent(user.email)}`;
    chrome.tabs.create({ url: paymentUrl });
    setPaid(true);
    setVerifyMsg(null);
    // Auto-detect the webhook-confirmed payment in the background.
    startPolling();
  };

  // Manual verification: ask the backend right now whether payment landed.
  const handleVerifyPayment = async () => {
    setVerifying(true);
    setVerifyMsg(null);
    try {
      const pro = await runSync();
      if (pro) {
        stopPolling();
        setVerifyMsg('🎉 Payment verified — Pro unlocked!');
      } else if (backendOn) {
        setVerifyMsg('Payment abhi tak nahi mili. Razorpay webhook ko 1-2 min lagte hain — thodi der baad dobara try karo.');
      } else {
        // No backend configured (dev/demo) — fall back to local activation.
        await activateProLocally();
      }
    } catch {
      setVerifyMsg('Verify nahi ho paya. Internet check karke dobara try karo.');
    } finally {
      if (mountedRef.current) setVerifying(false);
    }
  };

  // No-backend fallback so dev/demo builds can still unlock Pro manually.
  const activateProLocally = async () => {
    const expiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const razorpaySubscriptionId = `manual_${Date.now()}`;
    const activeProfile: UserProfile = {
      ...user,
      subscriptionStatus: 'active',
      subscriptionExpiry: expiry,
      razorpaySubscriptionId,
    };
    await saveLocalProfile(activeProfile as unknown as Record<string, unknown>);
    await chrome.storage.local.set({
      subscription: { status: 'active', expiryDate: expiry, activatedAt: Date.now() },
    });
    await scheduleRenewalReminder();
    void activateSubscription(user.uid, razorpaySubscriptionId, expiry).catch(() => {});
    onSuccess();
  };

  if (isPro) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-lg">←</button>
          <h2 className="text-lg font-bold">Pro Membership</h2>
        </div>
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-xl font-bold">You're a Pro Member!</div>
          <div className="text-sm opacity-90 mt-1">
            {user.subscriptionExpiry
              ? `Valid till ${new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Unlimited access unlocked'}
          </div>
        </div>
        <div className="space-y-2">
          {FEATURES.map((f) => (
            <div key={f} className="text-sm text-gray-700 py-1">{f}</div>
          ))}
        </div>
        <button onClick={onBack} className="btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Upgrade to Pro</h2>
      </div>

      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="text-4xl mb-2">⭐</div>
        <div className="text-3xl font-bold">₹{PAID_PLAN_PRICE_INR}</div>
        <div className="text-sm opacity-90">per year • less than ₹13/month</div>
      </div>

      <div className="space-y-2">
        {FEATURES.map((f) => (
          <div key={f} className="text-sm text-gray-700 py-1">{f}</div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        💳 Pay via UPI, Debit Card, Credit Card through Razorpay Payment Link
      </div>

      <button onClick={handlePayment} className="btn-primary">
        Pay ₹{PAID_PLAN_PRICE_INR}/year — Open Razorpay
      </button>

      {paid && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 space-y-2">
          <p className="text-xs text-green-800">
            ✅ Payment page khul gaya! UPI/Card se pay karo.{' '}
            {backendOn
              ? 'Payment ke baad hum automatically verify kar lenge.'
              : 'Payment ke baad neeche button dabao.'}
          </p>
          {verifying && (
            <p className="text-xs text-green-700">⏳ Payment verify ho rahi hai…</p>
          )}
          <button
            onClick={handleVerifyPayment}
            className="btn-secondary text-sm py-2"
            disabled={verifying}
          >
            {verifying ? 'Verifying…' : '✅ Maine Payment Kar Diya — Verify Payment'}
          </button>
          <p className="text-[10px] text-gray-500">
            {backendOn
              ? 'Razorpay webhook se verify hone mein 1-2 min lag sakte hain.'
              : 'Backend URL set nahi hai — Settings mein add karo for auto-verification.'}
          </p>
        </div>
      )}

      {verifyMsg && (
        <p className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-2">
          {verifyMsg}
        </p>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Powered by Razorpay • Made with 💚 in India
      </p>
    </div>
  );
}
