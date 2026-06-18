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
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] relative"
      style={{ background: 'rgba(8,8,12,0.6)', backdropFilter: 'blur(12px)' }}
    >
      <div>
        <h1 className="text-2xl font-display font-bold display-font text-hiremate-text">{title}</h1>
        {subtitle && <p className="text-sm text-hiremate-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {subscription?.plan === 'free' && usage && (
          <div className="hidden md:flex items-center gap-2">
            <span className="badge-cyan text-[10px]">Scans {usage.resumeScansUsed}/{usage.resumeScans}</span>
            <span className="badge-accent text-[10px]">Letters {usage.coverLettersUsed}/{usage.coverLetters}</span>
          </div>
        )}

        {subscription && subscription.plan !== 'free' && <PremiumBadge plan={subscription.plan} />}

        <button className="btn-ghost p-2.5 rounded-xl relative border border-white/[0.06]">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-hiremate-accent animate-pulse" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-hiremate-primary via-hiremate-secondary to-hiremate-accent flex items-center justify-center shadow-glow">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{user?.name ?? 'Guest'}</p>
            <p className="text-[10px] text-hiremate-muted">{user?.email ?? 'Sign in to sync'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
