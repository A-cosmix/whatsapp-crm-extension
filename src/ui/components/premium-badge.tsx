import { Crown } from 'lucide-react';
import type { SubscriptionPlan } from '@domain/entities';

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  career_boost: 'Career Boost',
};

const planGradients: Record<SubscriptionPlan, string> = {
  free: '',
  starter: 'from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30',
  pro: 'from-violet-500/20 to-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  career_boost: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
};

export function PremiumBadge({ plan }: { plan: SubscriptionPlan }) {
  if (plan === 'free') return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border bg-gradient-to-r ${planGradients[plan]}`}>
      <Crown className="w-3 h-3" />
      {planLabels[plan]}
    </span>
  );
}
