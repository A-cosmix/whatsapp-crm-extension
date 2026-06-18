import { Bell, User } from 'lucide-react';
import { useAuthStore, useSubscriptionStore } from '../stores';
import { useEffect } from 'react';
import { PremiumBadge } from './premium-badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, loadUser } = useAuthStore();
  const { subscription, usage, load } = useSubscriptionStore();

  useEffect(() => {
    loadUser();
    load();
  }, [loadUser, load]);

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
      <div>
        <h1 className="text-2xl font-bold text-hiremate-text">{title}</h1>
        {subtitle && <p className="text-sm text-hiremate-muted mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {subscription && subscription.plan === 'free' && usage && (
          <div className="hidden md:flex items-center gap-3 text-xs text-hiremate-muted">
            <span>Scans: {usage.resumeScansUsed}/{usage.resumeScans}</span>
            <span>Letters: {usage.coverLettersUsed}/{usage.coverLetters}</span>
          </div>
        )}

        {subscription && subscription.plan !== 'free' && <PremiumBadge plan={subscription.plan} />}

        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-hiremate-primary rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-hiremate-primary to-hiremate-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-hiremate-muted">{user?.email ?? 'Sign in to sync'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
