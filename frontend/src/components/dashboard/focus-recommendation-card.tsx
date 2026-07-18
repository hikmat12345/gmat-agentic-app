"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type StuckPoint = {
  subtopicId: string;
  subtopicName: string;
  subtopicSlug: string;
  topicName: string;
  topicSlug: string;
  stuckScore: number;
  metrics: {
    accuracy: number;
    totalAttempts: number;
    microLessonCompleted: boolean;
  };
  recommendation: "micro-lesson" | "practice" | "review-quiz";
};

type StuckPointsData = {
  stuckPoints: StuckPoint[];
  summary: {
    totalSubtopicsAttempted: number;
    stuckCount: number;
    strongCount: number;
    needsAttentionCount: number;
  };
};

function getRecommendationHref(sp: StuckPoint): string {
  const base = `/learning/${sp.topicSlug}/${sp.subtopicSlug}`;
  if (sp.recommendation === "micro-lesson") return `${base}/micro-lesson`;
  return `${base}/quiz`;
}

function getRecommendationLabel(sp: StuckPoint): string {
  if (sp.recommendation === "micro-lesson") return "Watch lesson";
  if (sp.recommendation === "review-quiz") return "Review now";
  return "Practice";
}

function accuracyColor(acc: number): string {
  if (acc >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (acc >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 75 ? "bg-emerald-500" : accuracy >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${accuracy}%` }}
      />
    </div>
  );
}

export function FocusRecommendationCard() {
  const { data, isError } = useQuery<StuckPointsData>({
    queryKey: ["analytics", "stuck-points"],
    queryFn: () =>
      fetch("/api/analytics/stuck-points").then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (isError) toast.error("Could not load focus areas");
  }, [isError]);

  if (!data) return null;

  const { stuckPoints, summary } = data;

  // No activity yet — show an inviting prompt instead
  if (summary.totalSubtopicsAttempted === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Start your first practice session</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Athena will pinpoint your weak areas after a few questions and guide you from there.
            </p>
            <Link
              href="/learning"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse study plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // All strong — positive state
  if (summary.stuckCount === 0 && summary.needsAttentionCount === 0) {
    return (
      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Strong across all practised topics
            </p>
            <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-300/70">
              Try a harder subtopic or run a full GMAT practice test to keep improving.
            </p>
            <Link
              href="/full-gmat"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Take practice test <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show top 2 focus areas
  const focusItems = stuckPoints.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none">Focus This Week</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {summary.stuckCount} area{summary.stuckCount !== 1 ? "s" : ""} need attention
          </p>
        </div>
        <Link
          href="/queue"
          className="shrink-0 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
        </Link>
      </div>

      {/* Focus items */}
      <div className="divide-y divide-border/40">
        {focusItems.map((sp) => (
          <div key={sp.subtopicId} className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium leading-snug">{sp.subtopicName}</p>
              <p className="text-[11px] text-muted-foreground">{sp.topicName}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <AccuracyBar accuracy={sp.metrics.accuracy} />
                <span className={cn("shrink-0 text-[11px] font-semibold tabular-nums", accuracyColor(sp.metrics.accuracy))}>
                  {sp.metrics.accuracy}%
                </span>
              </div>
            </div>
            <Link
              href={getRecommendationHref(sp)}
              className="shrink-0 flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
            >
              {getRecommendationLabel(sp)} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
