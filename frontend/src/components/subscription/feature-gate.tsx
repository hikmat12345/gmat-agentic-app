"use client";

import { Lock, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  /** When true, skip the gate entirely and render children as-is */
  bypass?: boolean;
}

export function FeatureGate({ children, feature, description, bypass }: FeatureGateProps) {
  const { isPremium, isLoading } = useSubscription();
  const router = useRouter();

  // Caller has already decided no gate is needed (e.g. free topic)
  if (bypass) return <>{children}</>;

  // While loading, render children to avoid flash of lock screen
  if (isLoading) return <>{children}</>;

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative min-h-[60vh] flex flex-col">
      {/* Blurred preview of content underneath */}
      <div className="pointer-events-none select-none overflow-hidden opacity-30 blur-sm">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">{feature}</h2>
            <p className="text-sm text-muted-foreground">
              {description ?? "This feature is available on Athena Premium."}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={() => router.push("/billing")}
            >
              <Zap className="h-4 w-4" />
              Upgrade to Premium
            </Button>
            <p className="text-xs text-muted-foreground">
              7-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
