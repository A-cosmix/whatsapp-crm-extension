import type { IPaymentService, ISubscriptionRepository } from '@domain/repositories/interfaces';
import type { Subscription, SubscriptionPlan } from '@domain/entities';

export class SubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentService: IPaymentService,
  ) {}

  async getSubscription(): Promise<Subscription> {
    return this.subscriptionRepo.get();
  }

  async createCheckout(plan: SubscriptionPlan, provider: 'stripe' | 'razorpay') {
    if (plan === 'free') throw new Error('Cannot checkout free plan');
    return this.paymentService.createCheckout(plan, provider);
  }

  async verifyLicense(licenseKey: string): Promise<Subscription> {
    const subscription = await this.paymentService.verifyLicense(licenseKey);
    await this.subscriptionRepo.save(subscription);
    return subscription;
  }

  async isPremium(): Promise<boolean> {
    const sub = await this.subscriptionRepo.get();
    return sub.isActive && sub.plan !== 'free';
  }
}
