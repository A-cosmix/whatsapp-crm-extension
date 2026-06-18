import { useState } from 'react';
import type { UserProfile } from '@/types';
import { PAID_PLAN_PRICE_INR, PAID_PLAN_PERIOD } from '@/types';
import { createSubscription, openSubscriptionCheckout, waitForActiveSubscription } from '@/services/payments/razorpay';

interface SubscriptionPageProps {
  user: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
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

export function SubscriptionPage({ user, onBack, onSuccess }: SubscriptionPageProps) {
  const [awaiting, setAwaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pollUntilActive = async () => {
    const active = await waitForActiveSubscription(user.uid);
    if (active) onSuccess();
  };

  const handleSubscribe = async () => {
    setError('');
    setBusy(true);
    try {
      const { shortUrl } = await createSubscription();
      await openSubscriptionCheckout(shortUrl);
      setAwaiting(true);
      void pollUntilActive();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start payment';
      setError(`Payment setup failed: ${message}. Make sure the backend is deployed and configured.`);
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setError('');
    setBusy(true);
    const active = await waitForActiveSubscription(user.uid, { attempts: 1, intervalMs: 0 });
    setBusy(false);
    if (active) {
      onSuccess();
    } else {
      setError('Payment not confirmed yet. It can take a few seconds after you pay — try again.');
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Upgrade to Pro</h2>
      </div>

      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="text-4xl mb-2">⭐</div>
        <div className="text-3xl font-bold">₹{PAID_PLAN_PRICE_INR}</div>
        <div className="text-sm opacity-90">per {PAID_PLAN_PERIOD} • cancel anytime</div>
      </div>

      <div className="space-y-2">
        {FEATURES.map((f) => (
          <div key={f} className="text-sm text-gray-700 py-1">{f}</div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        💳 Auto-renews monthly via Razorpay — pay with UPI, Debit Card, Credit Card or Net Banking. Cancel anytime.
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">{error}</div>
      )}

      {!awaiting ? (
        <button onClick={handleSubscribe} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Opening Razorpay…' : `Subscribe ₹${PAID_PLAN_PRICE_INR}/${PAID_PLAN_PERIOD}`}
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 space-y-2">
          <p className="text-xs text-green-800">
            ✅ Payment page khul gaya! UPI/Card se subscribe karo. Pro apne aap unlock ho jaayega payment confirm hote hi.
          </p>
          <button onClick={handleRefresh} disabled={busy} className="btn-secondary text-sm py-2 disabled:opacity-60">
            {busy ? 'Checking…' : "I've paid — Check status"}
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Powered by Razorpay • Made with 💚 in India
      </p>
    </div>
  );
}
