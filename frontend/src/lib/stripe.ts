import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? "",
    name: "Monthly",
    amount: 2900,
    interval: "month" as const,
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID ?? "",
    name: "Annual",
    amount: 19900,
    interval: "year" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
