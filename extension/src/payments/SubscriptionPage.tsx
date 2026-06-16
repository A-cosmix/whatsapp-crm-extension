import { useState } from 'react';
import type { UserProfile } from '@/types';
import { PAID_PLAN_PRICE_INR } from '@/types';
import { createPaymentOrder, openRazorpayCheckout, verifyPayment } from '@/services/payments/razorpay';
import { activateSubscription } from '@/services/auth/firebase-auth';

interface SubscriptionPageProps {
  user: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

const FEATURES = [
  '✅ Unlimited explanations',
  '✅ All 12 explanation modes',
  '✅ PDF simplifier & export',
  '✅ YouTube video summarizer',
  '✅ Study notes generator',
  '✅ Export to PDF & Markdown',
  '✅ No watermarks',
  '✅ Priority AI responses',
];

export function SubscriptionPage({ user, onBack, onSuccess }: SubscriptionPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const { orderId, amount } = await createPaymentOrder(user.uid, user.email);

      await openRazorpayCheckout(
        orderId,
        amount,
        user.email,
        user.displayName,
        async (paymentId, signature) => {
          const result = await verifyPayment(orderId, paymentId, signature, user.uid);
          if (result.success) {
            const expiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
            await activateSubscription(user.uid, paymentId, expiry);
            onSuccess();
          } else {
            setError(result.error || 'Payment failed');
          }
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment error');
      setLoading(false);
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
        <div className="text-sm opacity-90">per year • less than ₹13/month</div>
      </div>

      <div className="space-y-2">
        {FEATURES.map((f) => (
          <div key={f} className="text-sm text-gray-700 py-1">{f}</div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        💳 Pay via UPI, Debit Card, Credit Card, or Net Banking through Razorpay
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}

      <button onClick={handlePayment} className="btn-primary" disabled={loading}>
        {loading ? 'Processing...' : `Pay ₹${PAID_PLAN_PRICE_INR}/year`}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Secure payment by Razorpay. Cancel anytime. No auto-renewal without consent.
      </p>
    </div>
  );
}
