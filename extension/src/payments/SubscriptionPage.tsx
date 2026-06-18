import { useState } from 'react';
import type { UserProfile } from '@/types';
import { PAID_PLAN_PRICE_INR } from '@/types';
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
  '✅ CosmiQ AI powered explanations',
];

const DEFAULT_PAYMENT_LINK = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK || '';

export function SubscriptionPage({ user, onBack, onSuccess }: SubscriptionPageProps) {
  const [paid, setPaid] = useState(false);

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
  };

  const handleActivatePro = async () => {
    const expiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await activateSubscription(user.uid, `manual_${Date.now()}`, expiry);
    await chrome.storage.local.set({
      subscription: { status: 'active', expiryDate: expiry, activatedAt: Date.now() },
    });
    onSuccess();
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
        💳 Pay via UPI, Debit Card, Credit Card through Razorpay Payment Link
      </div>

      <button onClick={handlePayment} className="btn-primary">
        Pay ₹{PAID_PLAN_PRICE_INR}/year — Open Razorpay
      </button>

      {paid && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 space-y-2">
          <p className="text-xs text-green-800">
            ✅ Payment page khul gaya! UPI/Card se pay karo. Payment ke baad neeche button dabao.
          </p>
          <button onClick={handleActivatePro} className="btn-secondary text-sm py-2">
            ✅ Maine Payment Kar Diya — Activate Pro
          </button>
          <p className="text-[10px] text-gray-500">Payment verify hone tak 24 hours lag sakte hain</p>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Powered by Razorpay • Made with 💚 in India
      </p>
    </div>
  );
}
