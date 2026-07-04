import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getStripe, PLANS, isStripeConfigured, type PlanKey } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { plan = "monthly" } = (await req.json().catch(() => ({}))) as { plan?: PlanKey };
  const selectedPlan = PLANS[plan] ?? PLANS.monthly;

  if (!selectedPlan.priceId) {
    return NextResponse.json({ error: `Price ID not configured for plan: ${plan}` }, { status: 503 });
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email ?? undefined,
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: user.id, clerkId, plan },
    },
    success_url: `${baseUrl}/billing?subscription=success`,
    cancel_url: `${baseUrl}/billing?subscription=cancelled`,
    metadata: { userId: user.id, clerkId, plan },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
