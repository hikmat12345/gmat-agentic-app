"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  CreditCard,
  Calendar,
  Zap,
  Star,
  AlertCircle,
  Lock,
  Unlock,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  BarChart2,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

const PREMIUM_FEATURES = [
  { icon: Zap,             label: "Unlimited daily quests",                    desc: "20 personalized GMAT questions per day" },
  { icon: MessageSquare,   label: "AI Mentor",                                  desc: "Personal coach that analyses your progress" },
  { icon: ClipboardCheck,  label: "Full GMAT practice tests",                   desc: "64-question timed test with real 205–805 scoring" },
  { icon: BookOpen,        label: "AI whiteboard micro-lessons",                 desc: "Interactive visual lessons for every concept" },
  { icon: BarChart2,       label: "Detailed analytics",                          desc: "Score projection, weakness heatmap, activity calendar" },
  { icon: Trophy,          label: "My Learning",                                 desc: "AI-generated lessons for any GMAT topic" },
];

function BillingContent() {
  const searchParams = useSearchParams();
  const { subscription, isLoading, isPremium, checkout, checkingOut, openPortal, openingPortal, syncSubscription, isSyncing } = useSubscription();
  const [pendingPlan, setPendingPlan] = useState<"monthly" | "annual" | null>(null);

  useEffect(() => {
    if (!checkingOut) setPendingPlan(null);
  }, [checkingOut]);

  useEffect(() => {
    if (searchParams.get("subscription") === "success") {
      // Sync from Stripe directly in case webhook hasn't fired yet
      syncSubscription(undefined, {
        onSuccess: () => toast.success("Subscription activated! Welcome to Athena Premium."),
        onError: () => toast.success("Subscription activated! Welcome to Athena Premium."),
      });
    } else if (searchParams.get("subscription") === "cancelled") {
      toast("Checkout cancelled", { description: "You can subscribe anytime from this page." });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isInTrial =
    subscription?.trialEndsAt != null &&
    new Date(subscription.trialEndsAt) > new Date();

  if (isLoading || isSyncing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!subscription?.isConfigured) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Billing not configured</h2>
        <p className="text-muted-foreground text-sm">
          Add your Stripe keys to{" "}
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</code> to
          enable subscriptions.
        </p>
        <div className="text-left rounded-lg border bg-muted/30 p-4 text-xs font-mono space-y-1">
          <p>STRIPE_SECRET_KEY=sk_test_...</p>
          <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</p>
          <p>STRIPE_WEBHOOK_SECRET=whsec_...</p>
          <p>STRIPE_MONTHLY_PRICE_ID=price_...</p>
          <p>STRIPE_ANNUAL_PRICE_ID=price_...</p>
        </div>
      </div>
    );
  }

  /* ── SUBSCRIBED VIEW ─────────────────────────────────────────────────── */
  if (isPremium && subscription) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage your Athena subscription</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All premium features are active on your account.
          </p>
        </div>

        {/* Plan card */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">
                  Athena {subscription.plan === "annual" ? "Annual" : "Monthly"}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {isInTrial ? "Free trial active" : subscription.status}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4 text-sm">
            {isInTrial && (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Trial ends</p>
                <p className="font-semibold">{formatDate(subscription.trialEndsAt)}</p>
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">
                {isInTrial ? "First charge date" : "Next billing date"}
              </p>
              <p className="font-semibold">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-semibold">
                {subscription.plan === "annual" ? "$199 / year" : "$29 / month"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => openPortal()} disabled={openingPortal} className="gap-2">
              <CreditCard className="h-4 w-4" />
              {openingPortal ? "Opening..." : "Manage billing"}
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              Update payment method, download invoices, or cancel your plan.
            </p>
          </div>
        </div>

        {/* Unlocked features */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-emerald-500" />
            <p className="font-semibold text-sm">Everything unlocked</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {PREMIUM_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-500 self-center" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── FREE / NOT SUBSCRIBED VIEW ─────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upgrade to Athena Premium</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Unlock AI-powered GMAT coaching, daily quests, and full practice tests.
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {["Unlimited daily quests", "AI tutor (all 8 question types)", "Full practice tests", "Real-time score tracking"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                )
              )}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setPendingPlan("monthly"); checkout("monthly"); }}
              disabled={checkingOut}
            >
              {pendingPlan === "monthly" && checkingOut ? "Loading..." : "Start 7-day free trial"}
            </Button>
          </div>

          {/* Annual */}
          <div className="rounded-xl border-2 border-primary bg-card p-5 space-y-4 relative">
            <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              BEST VALUE
            </span>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Annual</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold">$17</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">$199/year — save $149</p>
            </div>
            <ul className="space-y-2 text-sm">
              {["Everything in Monthly", "Priority AI response time", "Early feature access", "Score improvement guarantee"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                )
              )}
            </ul>
            <Button
              className="w-full"
              onClick={() => { setPendingPlan("annual"); checkout("annual"); }}
              disabled={checkingOut}
            >
              {pendingPlan === "annual" && checkingOut ? "Loading..." : "Start 7-day free trial"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>7-day free trial included. Cancel anytime before the trial ends — no charge.</span>
        </div>
      </div>

      {/* Already subscribed but not showing? */}
      {subscription?.isConfigured && (
        <div className="rounded-xl border border-dashed bg-muted/10 p-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Already subscribed? If your payment isn&apos;t reflected here, click to sync.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() =>
              syncSubscription(undefined, {
                onSuccess: (d: { synced?: boolean; reason?: string } | undefined) => {
                  if (d?.synced) toast.success("Subscription synced!");
                  else toast("No active subscription found", { description: d?.reason ?? "" });
                },
              })
            }
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing..." : "Sync subscription"}
          </Button>
        </div>
      )}

      {/* Locked features preview */}
      <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
        <p className="font-semibold text-sm flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Features unlocked with Premium
        </p>
        <div className="grid grid-cols-1 gap-3">
          {PREMIUM_FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
