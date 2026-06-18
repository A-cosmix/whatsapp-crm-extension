import type { UserProfile } from '@/types';
import { EXPLANATION_MODES, FREE_DAILY_LIMIT } from '@/types';
import { StreakBadge } from '@/components/StreakBadge';
import { getDaysRemaining } from '@/utils/helpers';
import { getSubscriptionStatus } from '@/services/auth/firebase-auth';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (page: string) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const status = getSubscriptionStatus(user);
  const trialDaysLeft = getDaysRemaining(user.trialEndDate);
  const today = new Date().toISOString().split('T')[0];
  const dailyUsed = user.lastExplanationDate === today ? user.dailyExplanationCount : 0;

  const handleExplainText = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'SHOW_EXPLAIN_HINT' }).catch(() => {});
    }
    window.close();
  };

  const handleFocusMode = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_FOCUS_MODE' }).catch(() => {});
    }
    window.close();
  };

  const handleGenerateNotes = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'GENERATE_STUDY_NOTES' }).catch(() => {});
    }
    window.close();
  };

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Hey, {user.displayName}! 👋</h2>
          <p className="text-xs text-gray-500">Internet simplified for you</p>
        </div>
        <button onClick={() => onNavigate('settings')} className="p-2 rounded-xl hover:bg-gray-100 text-lg">⚙️</button>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-2xl ${
        status === 'active' ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' :
        status === 'trial' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
        'bg-gradient-to-r from-red-400 to-red-500 text-white'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium opacity-90">
              {status === 'active' ? '⭐ Pro Member' : status === 'trial' ? `🎁 Free Trial — ${trialDaysLeft} days left` : '⏰ Trial Expired'}
            </div>
            {status !== 'active' && (
              <div className="text-xs opacity-80 mt-1">{dailyUsed}/{FREE_DAILY_LIMIT} explanations today</div>
            )}
          </div>
          {status !== 'active' && (
            <button
              onClick={() => onNavigate('subscription')}
              className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30"
            >
              Upgrade ₹150/yr
            </button>
          )}
        </div>
      </div>

      {/* How to use — IMPORTANT */}
      <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
        <p className="text-xs font-semibold text-brand-800 mb-1">📌 Explain kaise karein?</p>
        <p className="text-[11px] text-brand-700 leading-relaxed">
          1. Is popup ko band karo<br />
          2. Koi bhi website par text <b>select</b> karo<br />
          3. <b>💬 Explain</b> button dabao
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-xl font-bold text-brand-600">{user.totalExplanations}</div>
          <div className="text-[10px] text-gray-500">Explained</div>
        </div>
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-xl font-bold text-orange-500">{user.streak}</div>
          <div className="text-[10px] text-gray-500">Streak</div>
        </div>
        <div className="card bg-white border border-gray-100 text-center">
          <div className="text-xl font-bold text-purple-500">{user.achievements.length}</div>
          <div className="text-[10px] text-gray-500">Badges</div>
        </div>
      </div>

      <StreakBadge streak={user.streak} achievements={user.achievements} />

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '✨', label: 'Explain Text', desc: 'Select text on page', action: handleExplainText },
            { icon: '🎯', label: 'Focus Mode', desc: 'Distraction-free read', action: handleFocusMode },
            { icon: '📝', label: 'Make Notes', desc: 'Select text first', action: handleGenerateNotes },
            { icon: '📊', label: 'Daily Report', desc: 'View stats', action: () => onNavigate('report') },
            { icon: '🎭', label: 'Change Mode', desc: user.preferredMode, action: () => onNavigate('settings') },
            { icon: '📚', label: 'Study Notes', desc: 'View saved', action: () => onNavigate('notes') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="card bg-white border border-gray-100 text-left hover:border-brand-200 hover:shadow-sm"
            >
              <div className="text-lg">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-900">{item.label}</div>
              <div className="text-[10px] text-gray-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Modes */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Explanation Modes</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EXPLANATION_MODES.slice(0, 6).map((mode) => (
            <div key={mode.id} className="flex-shrink-0 px-3 py-2 rounded-xl bg-white border border-gray-100 text-center min-w-[80px]">
              <div className="text-lg">{mode.emoji}</div>
              <div className="text-[10px] font-medium text-gray-700">{mode.name.replace(' Mode', '')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
