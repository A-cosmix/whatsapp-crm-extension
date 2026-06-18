import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Reveal } from './effects/Reveal';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: typeof Zap;
  popular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI productivity.',
    features: [
      '5 AI summaries per day',
      'Basic focus timer',
      '3 dashboard widgets',
      'Smart notes',
      'Community support',
    ],
    icon: Zap,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For power users who demand the best.',
    features: [
      'Unlimited AI summaries',
      'Smart focus mode',
      'All 10+ widgets',
      'Cross-device sync',
      'Productivity analytics',
      'Priority support',
      'Custom themes',
    ],
    icon: Sparkles,
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Ultra AI',
    price: '$29',
    period: '/month',
    description: 'Maximum intelligence. Zero limits.',
    features: [
      'Everything in Pro',
      'GPT-5 powered AI',
      'Voice AI assistant',
      'Smart automation workflows',
      'AI-generated notes',
      'Team collaboration',
      'API access',
      'Dedicated support',
    ],
    icon: Crown,
    cta: 'Go Ultra',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon/[0.02] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-label mb-6">
              <Sparkles size={14} />
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="text-white">Simple.</span>{' '}
              <span className="gradient-text">Transparent.</span>{' '}
              <span className="text-white">Powerful.</span>
            </h2>
            <p className="text-frost/50 max-w-xl mx-auto">
              Start free. Upgrade when you&apos;re ready. No hidden fees, cancel anytime.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <Reveal key={plan.name} delay={i * 0.1}>
                <motion.div
                  className={`relative rounded-2xl p-8 h-full flex flex-col ${
                    plan.popular
                      ? 'gradient-border shadow-glow-lg'
                      : 'glass card-hover'
                  }`}
                  whileHover={{ y: -4 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-electric to-neon text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.popular ? 'bg-electric/20' : 'glass'
                    }`}>
                      <Icon size={18} className="text-electric-bright" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-frost/30 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-frost/40 mb-8">{plan.description}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-frost/60">
                        <Check size={14} className="text-electric-bright shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
