import { PAID_PLAN_PRICE_INR, FREE_TRIAL_DAYS } from '@/types';

interface TrialExpiredProps {
  onUpgrade: () => void;
  onLogout: () => void;
}

export function TrialExpired({ onUpgrade, onLogout }: TrialExpiredProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-[500px] text-center space-y-6">
      <div className="text-6xl">⏰</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Trial Khatam Ho Gaya</h2>
        <p className="text-sm text-gray-500 max-w-[280px]">
          Aapka {FREE_TRIAL_DAYS}-din ka free trial khatam ho gaya. Pro upgrade karo aur unlimited explanations enjoy karo!
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 w-full">
        <div className="text-2xl font-bold text-brand-600">₹{PAID_PLAN_PRICE_INR}/year</div>
        <div className="text-xs text-brand-500">Unlimited explanations + saare features</div>
      </div>

      <button onClick={onUpgrade} className="btn-primary">Abhi Upgrade Karo ⭐</button>
      <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
    </div>
  );
}
