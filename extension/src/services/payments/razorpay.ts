import { PAID_PLAN_PRICE_INR } from '@/types';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

export async function createPaymentOrder(userId: string, email: string): Promise<{ orderId: string; amount: number }> {
  if (BACKEND_URL) {
    const response = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, amount: PAID_PLAN_PRICE_INR * 100, currency: 'INR' }),
    });
    if (!response.ok) throw new Error('Failed to create payment order');
    return response.json();
  }

  // Client-side order for development/demo
  const orderId = `order_${Date.now()}_${userId.slice(0, 8)}`;
  await chrome.storage.local.set({
    pendingOrder: { orderId, amount: PAID_PLAN_PRICE_INR * 100, userId, createdAt: Date.now() },
  });
  return { orderId, amount: PAID_PLAN_PRICE_INR * 100 };
}

export async function openRazorpayCheckout(
  orderId: string,
  amount: number,
  email: string,
  name: string,
  onSuccess: (paymentId: string, signature: string) => void,
  onFailure: (error: string) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const Razorpay = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Explain Like WhatsApp',
        description: 'Annual Subscription - ₹150/year',
        order_id: orderId,
        prefill: { email, name },
        theme: { color: '#25D366' },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          onSuccess(response.razorpay_payment_id, response.razorpay_signature);
          resolve();
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment cancelled');
            resolve();
          },
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      onFailure('Failed to load payment gateway');
      resolve();
    };
    document.head.appendChild(script);
  });
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  userId: string,
): Promise<PaymentResult> {
  if (BACKEND_URL) {
    const response = await fetch(`${BACKEND_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentId, signature, userId }),
    });
    if (!response.ok) return { success: false, error: 'Payment verification failed' };
    return response.json();
  }

  // Development mode: accept payment with basic validation
  if (paymentId && orderId) {
    const expiryDate = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await chrome.storage.local.set({
      subscription: {
        status: 'active',
        paymentId,
        orderId,
        expiryDate,
        activatedAt: Date.now(),
      },
    });
    return { success: true, orderId, paymentId };
  }
  return { success: false, error: 'Invalid payment details' };
}

export async function checkSubscriptionExpiry(): Promise<boolean> {
  const result = await chrome.storage.local.get('subscription');
  const sub = result.subscription as { expiryDate: number; status: string } | undefined;
  if (!sub) return false;
  if (sub.expiryDate < Date.now()) {
    await chrome.storage.local.set({ subscription: { ...sub, status: 'expired' } });
    return false;
  }
  return sub.status === 'active';
}

export async function scheduleRenewalReminder(): Promise<void> {
  const result = await chrome.storage.local.get('subscription');
  const sub = result.subscription as { expiryDate: number } | undefined;
  if (!sub) return;

  const reminderDate = sub.expiryDate - 7 * 24 * 60 * 60 * 1000;
  if (reminderDate > Date.now()) {
    await chrome.alarms.create('renewal-reminder', { when: reminderDate });
  }
}

export function formatPrice(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toFixed(0)}`;
}
