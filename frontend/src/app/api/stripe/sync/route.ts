import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const stripe = getStripe();
    const db = supabase as any;

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 5 });
    console.log(`[stripe/sync] customers found for ${user.email}: ${customers.data.length}`);

    if (!customers.data.length) {
      return NextResponse.json({ synced: false, reason: "No Stripe customer found for this email" });
    }

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      });

      console.log(`[stripe/sync] subscriptions for customer ${customer.id}: ${subs.data.length}`);
      for (const sub of subs.data) {
        console.log(`[stripe/sync] sub ${sub.id} status=${sub.status}`);
      }

      for (const sub of subs.data) {
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;

        const item = sub.items?.data?.[0];
        const plan = (sub.metadata?.plan as string) ?? "monthly";
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

        // current_period_end lives on the subscription in all Stripe API versions
        const rawPeriodEnd = (sub as unknown as Record<string, unknown>).current_period_end;
        const periodEnd = typeof rawPeriodEnd === "number"
          ? new Date(rawPeriodEnd * 1000).toISOString()
          : null;

        console.log(`[stripe/sync] upserting: user_id=${user.id}, sub_id=${sub.id}, status=${sub.status}, plan=${plan}`);

        const { error: upsertError } = await db.from("subscriptions").upsert(
          {
            user_id: user.id,
            stripe_customer_id: customer.id,
            stripe_subscription_id: sub.id,
            stripe_price_id: item?.price?.id ?? null,
            plan,
            status: sub.status,
            trial_ends_at: trialEnd,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (upsertError) {
          console.error("[stripe/sync] DB upsert failed:", JSON.stringify(upsertError));
          return NextResponse.json(
            { error: "Database write failed", detail: upsertError.message ?? JSON.stringify(upsertError) },
            { status: 500 }
          );
        }

        const { error: userError } = await db
          .from("users")
          .update({ subscription_status: sub.status })
          .eq("id", user.id);

        if (userError) {
          console.error("[stripe/sync] user update error:", JSON.stringify(userError));
          // non-fatal — continue
        }

        console.log(`[stripe/sync] success: user ${user.email} → ${sub.status}`);
        return NextResponse.json({
          synced: true,
          status: sub.status,
          plan,
          trialEndsAt: trialEnd,
          currentPeriodEnd: periodEnd,
        });
      }
    }

    return NextResponse.json({ synced: false, reason: "No active subscription found in Stripe" });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/sync] unhandled error:", message);
    return NextResponse.json({ error: "Sync failed", detail: message }, { status: 500 });
  }
}
