import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Header, GlassCard, Button, Input } from '../components';
import { sendMessage } from '../lib/utils';
import { PLAN_DETAILS } from '@infrastructure/payments/payment-service';
import { useSubscriptionStore } from '../stores';

export function PricingPage() {
  const { subscription, load } = useSubscriptionStore();
  const [licenseKey, setLicenseKey] = useState('');
  const [verifying, setVerifying] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: ({ plan, provider }: { plan: string; provider: 'stripe' | 'razorpay' }) =>
      sendMessage<{ checkoutUrl: string }>('CREATE_CHECKOUT', { plan, provider }),
    onSuccess: (data) => {
      chrome.tabs.create({ url: data.checkoutUrl });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => sendMessage('VERIFY_LICENSE', { licenseKey }),
    onSuccess: () => {
      load();
      setLicenseKey('');
    },
  });

  return (
    <div>
      <Header title="Upgrade" subtitle="Unlock your full career potential" />

      <div className="p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <Crown className="w-12 h-12 text-hiremate-secondary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Choose Your <span className="gradient-text">Career Plan</span></h2>
          <p className="text-hiremate-muted">Invest in your future. One-time payment, lifetime access.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLAN_DETAILS.map((plan) => (
            <GlassCard
              key={plan.id}
              className={`relative ${plan.popular ? 'border-hiremate-primary/50 shadow-glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-primary px-4 py-1">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold gradient-text">₹{plan.price}</span>
                <span className="text-sm text-hiremate-muted">/{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-hiremate-muted">
                    <Check className="w-4 h-4 text-hiremate-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => checkoutMutation.mutate({ plan: plan.id, provider: 'razorpay' })}
                  loading={checkoutMutation.isPending}
                  disabled={subscription?.plan === plan.id}
                >
                  Pay with Razorpay
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => checkoutMutation.mutate({ plan: plan.id, provider: 'stripe' })}
                  disabled={subscription?.plan === plan.id}
                >
                  Pay with Stripe
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="max-w-md mx-auto space-y-4">
          <h3 className="font-semibold text-center">Have a License Key?</h3>
          <Input
            placeholder="HM-PRO-XXXX-XXXX"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
          />
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => verifyMutation.mutate()}
            loading={verifyMutation.isPending}
            disabled={!licenseKey}
          >
            Activate License
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
