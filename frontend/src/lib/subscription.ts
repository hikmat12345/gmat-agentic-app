/**
 * Server-side subscription check.
 * Import this in API routes to enforce premium access.
 */
import { supabase } from "@/lib/supabase/client";

const db = supabase as any;

export type SubscriptionTier = "free" | "premium";

export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  // Check user's subscription_status column first (fast)
  const { data: user } = await db
    .from("users")
    .select("subscription_status")
    .eq("id", userId)
    .maybeSingle();

  const activeStatuses = ["active", "trialing"];
  if (activeStatuses.includes(user?.subscription_status ?? "")) {
    return "premium";
  }

  // Double-check subscriptions table
  const { data: sub } = await db
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  return activeStatuses.includes(sub?.status ?? "") ? "premium" : "free";
}

export async function requirePremium(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const tier = await getUserSubscriptionTier(userId);
  if (tier === "premium") return { ok: true };
  return { ok: false, error: "Premium subscription required" };
}
