"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ArrowRight, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type StuckPointsData = {
  stuckPoints: {
    subtopicName: string;
    topicName: string;
    stuckScore: number;
    metrics: { accuracy: number; totalAttempts: number };
  }[];
  summary: {
    stuckCount: number;
    strongCount: number;
    totalSubtopicsAttempted: number;
  };
};

function buildInsightMessage(data: StuckPointsData | undefined): {
  message: string;
  cta: string;
  href: string;
  icon: "warning" | "boost" | "chat";
} {
  if (!data || data.summary.totalSubtopicsAttempted === 0) {
    return {
      message: "Ready to start your GMAT journey? Tell me your target score and I'll build you a plan.",
      cta: "Talk to Athena",
      href: "/mentor",
      icon: "chat",
    };
  }
  const top = data.stuckPoints[0];
  if (data.summary.stuckCount > 0 && top) {
    return {
      message: `${top.subtopicName} is your toughest area right now — ${top.metrics.accuracy}% accuracy. Let's fix that together.`,
      cta: "Get coaching",
      href: "/mentor",
      icon: "warning",
    };
  }
  if (data.summary.strongCount === data.summary.totalSubtopicsAttempted) {
    return {
      message: "You're performing well across all studied topics. Ready to push into harder territory?",
      cta: "Stretch challenge",
      href: "/mentor",
      icon: "boost",
    };
  }
  return {
    message: "Ask me anything — study strategy, score targets, exam nerves. I'm here.",
    cta: "Open mentor",
    href: "/mentor",
    icon: "chat",
  };
}

export function CompanionCard() {
  const { data } = useQuery<StuckPointsData>({
    queryKey: ["analytics", "stuck-points"],
    queryFn: () =>
      fetch("/api/analytics/stuck-points").then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    staleTime: 5 * 60_000,
  });

  const insight = buildInsightMessage(data);

  const iconEl =
    insight.icon === "warning" ? (
      <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    ) : insight.icon === "boost" ? (
      <Zap className="h-5 w-5 text-primary" />
    ) : (
      <MessageCircle className="h-5 w-5 text-primary" />
    );

  const iconBg =
    insight.icon === "warning"
      ? "bg-amber-500/10"
      : "bg-primary/10";

  return (
    <Link href={insight.href}>
      <div className="group cursor-pointer rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-muted/20">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            {iconEl}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Athena Coach
            </p>
            <p className="text-sm leading-snug text-foreground">
              {insight.message}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
              {insight.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
