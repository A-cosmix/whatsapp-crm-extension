import { PAID_PLAN_PRICE_INR, PAID_PLAN_PERIOD } from '@/types';

interface TrialExpiredProps {
  onUpgrade: () => void;
  onLogout: () => void;
}

export function TrialExpired({ onUpgrade, onLogout }: TrialExpiredProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-[500px] text-center space-y-6">
      <div className="text-6xl">⏰</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Trial Expired</h2>
        <p className="text-sm text-gray-500 max-w-[280px]">
          Your 5-day free trial has ended. Upgrade to continue simplifying the internet!
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 w-full">
        <div className="text-2xl font-bold text-brand-600">₹{PAID_PLAN_PRICE_INR}/{PAID_PLAN_PERIOD}</div>
        <div className="text-xs text-brand-500">Unlimited explanations + all features</div>
      </div>

      <button onClick={onUpgrade} className="btn-primary">Upgrade Now ⭐</button>
      <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
    </div>
  );
}
