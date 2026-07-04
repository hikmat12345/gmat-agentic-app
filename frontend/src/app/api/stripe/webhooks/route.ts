import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function upsertSubscription(
  userId: string,
  sub: Stripe.Subscription,
  customerId: string
) {
  const db = supabase as any;
  const item = sub.items.data[0];
  const plan = (sub.metadata?.plan as string) ?? "monthly";
  const status = sub.status;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const periodEnd = new Date((sub as any).current_period_end * 1000).toISOString();

  const { error: upsertError } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      stripe_price_id: item?.price?.id ?? null,
      plan,
      status,
      trial_ends_at: trialEnd,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (upsertError) {
    console.error("[webhook] Failed to upsert subscription:", upsertError);
    throw upsertError;
  }

  // Update user's subscription_status fast-path column
  const { error: userUpdateError } = await db
    .from("users")
    .update({ subscription_status: status })
    .eq("id", userId);
  if (userUpdateError) {
    console.error("[webhook] Failed to update user subscription_status:", userUpdateError);
    // non-fatal — requirePremium falls back to subscriptions table
  }
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = supabase as any;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        if (!userId || !customerId) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(userId, sub, customerId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: existing } = await db
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (existing?.user_id) {
          await upsertSubscription(existing.user_id, sub, customerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await db
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
