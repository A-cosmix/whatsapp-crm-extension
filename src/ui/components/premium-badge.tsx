import { Crown } from 'lucide-react';
import type { SubscriptionPlan } from '@domain/entities';

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  career_boost: 'Career Boost',
};

export function PremiumBadge({ plan }: { plan: SubscriptionPlan }) {
  if (plan === 'free') return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-hiremate-primary/20 to-hiremate-secondary/20 text-hiremate-secondary border border-hiremate-primary/30">
      <Crown className="w-3 h-3" />
      {planLabels[plan]}
    </span>
  );
}
