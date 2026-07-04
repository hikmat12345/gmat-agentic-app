"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SubscriptionStatus = {
  active: boolean;
  status: string | null;
  plan: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  isConfigured: boolean;
};

export function useSubscription() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["subscription"],
    queryFn: () => fetch("/api/stripe/status").then((r) => r.json()),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const checkout = useMutation({
    mutationFn: (plan: "monthly" | "annual") =>
      fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      }).then((r) => r.json()),
    onSuccess: (data: { url?: string }) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portal = useMutation({
    mutationFn: () =>
      fetch("/api/stripe/portal", { method: "POST" }).then((r) => r.json()),
    onSuccess: (data: { url?: string }) => {
      if (data.url) window.location.href = data.url;
    },
  });

  // Syncs subscription state from Stripe directly (bypasses webhook delay)
  const sync = useMutation<{ synced: boolean; reason?: string; status?: string; plan?: string }>({
    mutationFn: () =>
      fetch("/api/stripe/sync", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return {
    subscription: data,
    isLoading,
    isPremium: data?.active ?? false,
    checkout: checkout.mutate,
    checkingOut: checkout.isPending,
    openPortal: portal.mutate,
    openingPortal: portal.isPending,
    syncSubscription: sync.mutate,
    isSyncing: sync.isPending,
  };
}
