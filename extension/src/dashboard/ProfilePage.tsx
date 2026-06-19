import { useEffect, useState } from 'react';
import type { UserProfile } from '@/types';
import { FREE_DAILY_LIMIT } from '@/types';
import { getSubscriptionStatus } from '@/services/auth/firebase-auth';
import { getDeviceId } from '@/services/device/fingerprint';
import { formatDate, getDaysRemaining } from '@/utils/helpers';

interface ProfilePageProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onUpgrade: () => void;
  onRefresh: () => Promise<{ pro?: boolean; subscriptionStatus?: string } | undefined>;
}

export function ProfilePage({ user, onBack, onLogout, onUpgrade, onRefresh }: ProfilePageProps) {
  const status = getSubscriptionStatus(user);
  const isPro = status === 'active';
  const [deviceId, setDeviceId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const dailyUsed = user.lastExplanationDate === today ? user.dailyExplanationCount : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await onRefresh();
      if (res?.pro) {
        setRefreshMsg('🎉 Pro access active hai!');
      } else {
        setRefreshMsg('Abhi tak Pro detect nahi hua. Payment ke baad 1-2 min lagte hain.');
      }
    } catch {
      setRefreshMsg('Status check nahi ho paya. Internet check karke try karo.');
    } finally {
      setRefreshing(false);
    }
  };

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">My Profile</h2>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white text-xl font-bold">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{user.displayName || 'User'}</div>
          <div className="text-xs text-gray-500 truncate">{user.email}</div>
        </div>
      </div>

      {/* Plan status */}
      <div
        className={`p-4 rounded-2xl text-white ${
          isPro
            ? 'bg-gradient-to-r from-brand-500 to-brand-600'
            : status === 'trial'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
        }`}
      >
        <div className="text-sm font-semibold">
          {isPro ? '⭐ Pro Member' : status === 'trial' ? '🎁 Free Trial' : '⏰ Trial Expired'}
        </div>
        <div className="text-xs opacity-90 mt-1">
          {isPro
            ? user.subscriptionExpiry
              ? `Valid till ${formatDate(user.subscriptionExpiry)} • ${getDaysRemaining(user.subscriptionExpiry)} days left`
              : 'Unlimited access unlocked'
            : status === 'trial'
              ? `${getDaysRemaining(user.trialEndDate)} days left • ${dailyUsed}/${FREE_DAILY_LIMIT} explanations today`
              : 'Upgrade to Pro for unlimited access'}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={handleRefresh} className="btn-secondary text-sm py-2" disabled={refreshing}>
          {refreshing ? 'Checking…' : '🔄 Refresh / Restore Purchase'}
        </button>
        {refreshMsg && (
          <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-2">
            {refreshMsg}
          </p>
        )}

        {!isPro && (
          <button onClick={onUpgrade} className="btn-primary text-sm py-2">
            ⭐ Upgrade to Pro — ₹150/year
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-lg font-bold text-brand-600">{user.totalExplanations}</div>
          <div className="text-[10px] text-gray-500">Explained</div>
        </div>
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-lg font-bold text-orange-500">{user.streak}</div>
          <div className="text-[10px] text-gray-500">Streak</div>
        </div>
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-lg font-bold text-purple-500">{user.achievements.length}</div>
          <div className="text-[10px] text-gray-500">Badges</div>
        </div>
      </div>

      {/* Account */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <button onClick={onLogout} className="btn-secondary text-sm py-2">Logout</button>
        {deviceId && (
          <p className="text-[10px] text-gray-400 text-center">Device ID: {deviceId.slice(0, 8)}…</p>
        )}
      </div>
    </div>
  );
}
