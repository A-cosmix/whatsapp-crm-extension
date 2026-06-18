import { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '@/types';
import { FREE_TRIAL_DAYS, PAID_PLAN_PRICE_INR } from '@/types';
import { markPendingPayment, waitForPaymentActivation } from '@/services/payments/payment-polling';

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

const DEFAULT_PAYMENT_LINK = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK || '';

type PaymentState = 'idle' | 'waiting' | 'success' | 'timeout';

export function SubscriptionPage({ user, onBack, onSuccess }: SubscriptionPageProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [attempt, setAttempt] = useState(0);
  const pollingRef = useRef(false);

  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  const startPaymentPolling = async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    setPaymentState('waiting');
    setAttempt(0);

    const activated = await waitForPaymentActivation(user.uid, {
      maxAttempts: 100,
      intervalMs: 3000,
      onAttempt: (n) => setAttempt(n),
    });

    pollingRef.current = false;

    if (activated) {
      setPaymentState('success');
      setTimeout(() => onSuccess(), 1500);
    } else {
      setPaymentState('timeout');
    }
  };

  const handlePayment = async () => {
    const stored = await chrome.storage.local.get('razorpayPaymentLink');
    const link = (stored.razorpayPaymentLink as string) || DEFAULT_PAYMENT_LINK;

    if (!link || link.includes('your-payment-link')) {
      alert('Payment link configure nahi hai. Settings mein Razorpay Payment Link add karo.');
      return;
    }

    await markPendingPayment(user.uid, user.email);

    const paymentUrl = `${link}${link.includes('?') ? '&' : '?'}email=${encodeURIComponent(user.email)}&prefill[email]=${encodeURIComponent(user.email)}`;
    chrome.tabs.create({ url: paymentUrl });

    await startPaymentPolling();
  };

  const trialDaysLeft = Math.max(
    0,
    Math.ceil((user.trialEndDate - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Upgrade to Pro</h2>
      </div>

      {user.subscriptionStatus === 'trial' && trialDaysLeft > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
          🎁 {trialDaysLeft} din ka free trial baaki hai — kabhi bhi upgrade kar sakte ho!
        </div>
      )}

      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="text-4xl mb-2">⭐</div>
        <div className="text-3xl font-bold">₹{PAID_PLAN_PRICE_INR}</div>
        <div className="text-sm opacity-90">per year • sirf ₹13/month</div>
      </div>

      <div className="space-y-2">
        {FEATURES.map((f) => (
          <div key={f} className="text-sm text-gray-700 py-1">{f}</div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
        💳 UPI, Debit Card, Credit Card se pay karo — payment ke baad Pro automatically activate ho jayega
      </div>

      {paymentState === 'idle' && (
        <button onClick={handlePayment} className="btn-primary">
          Pay ₹{PAID_PLAN_PRICE_INR}/year — Razorpay Kholo
        </button>
      )}

      {paymentState === 'waiting' && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100 space-y-3 text-center">
          <div className="text-2xl animate-pulse">⏳</div>
          <p className="text-sm font-medium text-yellow-900">Payment verify ho rahi hai...</p>
          <p className="text-xs text-yellow-700">
            Razorpay tab mein payment complete karo. Pro auto-activate hoga.
          </p>
          <p className="text-[10px] text-gray-500">Checking... ({attempt}/100)</p>
        </div>
      )}

      {paymentState === 'success' && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="text-sm font-bold text-green-800">Pro Activated!</p>
          <p className="text-xs text-green-700">Ab unlimited explanations enjoy karo</p>
        </div>
      )}

      {paymentState === 'timeout' && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-3">
          <p className="text-xs text-orange-800">
            Payment abhi tak detect nahi hui. Agar pay kar chuke ho, thodi der baad dubara try karo ya dashboard refresh karo.
          </p>
          <button onClick={startPaymentPolling} className="btn-secondary text-sm py-2 w-full">
            🔄 Payment Check Karo
          </button>
          <button onClick={handlePayment} className="text-xs text-brand-600 hover:underline w-full">
            Payment dubara kholo
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        {FREE_TRIAL_DAYS}-day trial • Powered by Razorpay • Made with 💚 in India
      </p>
    </div>
  );
}
