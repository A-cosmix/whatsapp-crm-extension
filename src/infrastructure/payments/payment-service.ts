import type { IPaymentService } from '@domain/repositories/interfaces';
import type { Subscription, SubscriptionPlan } from '@domain/entities';
import { PLAN_PRICES } from '@domain/value-objects';
import { getItem, setItem } from '../storage/chrome-storage';

const PAYMENT_CONFIG_KEY = 'payment_config';

interface PaymentConfig {
  stripePublishableKey?: string;
  razorpayKeyId?: string;
  backendUrl?: string;
}

export class PaymentService implements IPaymentService {
  async getConfig(): Promise<PaymentConfig> {
    return (await getItem<PaymentConfig>(PAYMENT_CONFIG_KEY)) ?? {};
  }

  async saveConfig(config: PaymentConfig): Promise<void> {
    await setItem(PAYMENT_CONFIG_KEY, config);
  }

  async createCheckout(plan: SubscriptionPlan, provider: 'stripe' | 'razorpay'): Promise<{ checkoutUrl: string; sessionId: string }> {
    const config = await this.getConfig();
    const price = PLAN_PRICES[plan] ?? 0;
    const sessionId = `hm_${plan}_${Date.now()}`;

    if (provider === 'stripe' && config.stripePublishableKey) {
      const checkoutUrl = config.backendUrl
        ? `${config.backendUrl}/api/checkout/stripe?plan=${plan}&session=${sessionId}`
        : `https://checkout.stripe.com/pay/${sessionId}`;
      return { checkoutUrl, sessionId };
    }

    if (provider === 'razorpay' && config.razorpayKeyId) {
      const checkoutUrl = config.backendUrl
        ? `${config.backendUrl}/api/checkout/razorpay?plan=${plan}&amount=${price}`
        : `https://razorpay.com/payment/${sessionId}`;
      return { checkoutUrl, sessionId };
    }

    return {
      checkoutUrl: `https://hiremate.ai/checkout?plan=${plan}&provider=${provider}&amount=${price}`,
      sessionId,
    };
  }

  async verifyLicense(licenseKey: string): Promise<Subscription> {
    const planMap: Record<string, SubscriptionPlan> = {
      'HM-STARTER': 'starter',
      'HM-PRO': 'pro',
      'HM-CAREER': 'career_boost',
    };

    const prefix = licenseKey.split('-')[0] + '-' + licenseKey.split('-')[1];
    const plan = planMap[prefix] ?? 'pro';

    return {
      plan,
      isActive: true,
      licenseKey,
      purchasedAt: new Date().toISOString(),
    };
  }
}

export const PLAN_DETAILS = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 499,
    period: 'month',
    features: ['10 Resume Scans/month', '10 Cover Letters/month', 'ATS Score', 'Job Tracker'],
    popular: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 1999,
    period: 'lifetime',
    features: ['Unlimited Analysis', 'Unlimited Cover Letters', 'Resume Optimization', 'Job Match Scoring', 'Interview Prep AI'],
    popular: true,
  },
  {
    id: 'career_boost' as const,
    name: 'Career Boost',
    price: 2999,
    period: 'lifetime',
    features: ['Everything in Pro', 'Career Roadmaps', 'LinkedIn Auditor', 'Salary Insights', 'Priority Processing'],
    popular: false,
  },
];
