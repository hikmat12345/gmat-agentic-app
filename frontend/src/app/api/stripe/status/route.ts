import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { isStripeConfigured } from "@/lib/stripe";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  const isConfigured = isStripeConfigured();

  if (!isConfigured) {
    return NextResponse.json({ active: false, status: null, plan: null, trialEndsAt: null, currentPeriodEnd: null, isConfigured: false });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ active: false, status: null, plan: null, trialEndsAt: null, currentPeriodEnd: null, isConfigured });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ active: false, status: null, plan: null, trialEndsAt: null, currentPeriodEnd: null, isConfigured });

  const db = supabase as any;
  const { data: sub } = await db
    .from("subscriptions")
    .select("status, plan, trial_ends_at, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const activeStatuses = ["active", "trialing"];
  const active = activeStatuses.includes(sub?.status ?? "");

  return NextResponse.json({
    active,
    status: sub?.status ?? null,
    plan: sub?.plan ?? null,
    trialEndsAt: sub?.trial_ends_at ?? null,
    currentPeriodEnd: sub?.current_period_end ?? null,
    isConfigured,
  });
}
