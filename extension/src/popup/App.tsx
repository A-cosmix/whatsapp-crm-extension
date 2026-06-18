import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LoginPage } from '@/auth/LoginPage';
import { SignupPage } from '@/auth/SignupPage';
import { ForgotPasswordPage } from '@/auth/ForgotPasswordPage';
import { Onboarding } from '@/auth/Onboarding';
import { Dashboard } from '@/dashboard/Dashboard';
import { SettingsPage } from '@/options/SettingsPage';
import { SubscriptionPage } from '@/payments/SubscriptionPage';
import { TrialExpired } from '@/payments/TrialExpired';
import { DailyReport } from '@/dashboard/DailyReport';
import { NotesPage } from '@/dashboard/NotesPage';
import { getSubscriptionStatus, updateUserProfile } from '@/services/auth/firebase-auth';
import { saveLocalProfile } from '@/services/storage/indexed-db';

type Page = 'landing' | 'login' | 'signup' | 'forgot' | 'onboarding' | 'dashboard' | 'settings' | 'subscription' | 'report' | 'notes';

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-green-50" />
        <div className="relative z-10 space-y-4">
          <div className="text-6xl animate-float">💬</div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
            Explain Like WhatsApp
          </h1>
          <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
            Highlight any difficult text. Get instant explanations in simple, fun, human language.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['💬 WhatsApp', '🇮🇳 Hindi', '🔥 GenZ', '📝 Exam'].map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-full bg-white/80 text-xs font-medium text-gray-600 border border-gray-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-3 relative z-10">
        <button onClick={onGetStarted} className="btn-primary text-base">
          Get Started Free 🚀
        </button>
        <p className="text-center text-[10px] text-gray-400">5-day free trial • 30 explanations/day • No credit card</p>
      </div>
    </div>
  );
}

export function App() {
  const { user, loading, refresh, setUser } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    if (!loading && user && page !== 'dashboard' && page !== 'settings' && page !== 'subscription' && page !== 'report' && page !== 'notes') {
      if (!user.onboardingComplete) {
        setPage('onboarding');
      } else {
        const status = getSubscriptionStatus(user);
        setPage(status === 'expired' ? 'subscription' : 'dashboard');
      }
    }
  }, [user, loading]);

  const handleOnboardingComplete = async () => {
    // Go to dashboard immediately — don't wait for Firestore
    setPage('dashboard');

    if (user) {
      const updated = { ...user, onboardingComplete: true };
      await saveLocalProfile(updated as unknown as Record<string, unknown>);

      try {
        await updateUserProfile(user.uid, { onboardingComplete: true });
        await refresh();
      } catch {
        // Firestore may be slow — local state already updated
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  if (!user) {
    switch (page) {
      case 'login': return <LoginPage onLogin={refresh} onSwitchToSignup={() => setPage('signup')} onSwitchToForgot={() => setPage('forgot')} />;
      case 'signup': return <SignupPage onSignup={refresh} onSwitchToLogin={() => setPage('login')} />;
      case 'forgot': return <ForgotPasswordPage onBack={() => setPage('login')} />;
      default: return <LandingPage onGetStarted={() => setPage('signup')} />;
    }
  }

  if (page === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  if (getSubscriptionStatus(user) === 'expired' && page !== 'subscription') {
    return <TrialExpired onUpgrade={() => setPage('subscription')} onLogout={() => { setPage('landing'); }} />;
  }

  switch (page) {
    case 'settings': return <SettingsPage user={user} onBack={() => setPage('dashboard')} onLogout={() => setPage('landing')} />;
    case 'subscription': return <SubscriptionPage user={user} onBack={() => setPage('dashboard')} onSuccess={refresh} />;
    case 'report': return <DailyReport onBack={() => setPage('dashboard')} />;
    case 'notes': return <NotesPage onBack={() => setPage('dashboard')} />;
    default: return <Dashboard user={user} onNavigate={(p) => setPage(p as Page)} />;
  }
}
