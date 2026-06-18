// One-time helper: creates the monthly ₹150 Razorpay plan and prints its id.
// Usage:
//   RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=yyy node scripts/create-plan.mjs
// Then set the printed id as the RAZORPAY_PLAN_ID functions param.
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars first.');
  process.exit(1);
}

const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

const plan = await rzp.plans.create({
  period: 'monthly',
  interval: 1,
  item: {
    name: 'Explain Like WhatsApp Pro',
    amount: 150 * 100, // ₹150 in paise
    currency: 'INR',
    description: 'Unlimited explanations + all premium modes',
  },
});

console.log('Created plan. Set this as RAZORPAY_PLAN_ID:');
console.log(plan.id);
