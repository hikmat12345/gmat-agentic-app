"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy, BookOpen, ArrowRight,
  MessageSquare, Calculator, BarChart3,
  AlertTriangle,
} from "lucide-react";
import { getGmatPercentile } from "@/lib/full-gmat/scoring";
import { cn } from "@/lib/utils";
import type { GmatSubmitResponse } from "@/types/full-gmat";

// ── Count-up hook ─────────────────────────────────────────────────────────

function useCountUp(target: number, delay = 0, duration = 1000): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const timeout = setTimeout(() => {
      const start = Date.now();
      const frame = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay, duration]);
  return val;
}

// ── Types ─────────────────────────────────────────────────────────────────

type AttemptResult = GmatSubmitResponse & {
  totalTimeSeconds?: number;
  verbalTimeSeconds?: number;
  quantitativeTimeSeconds?: number;
  dataInsightsTimeSeconds?: number;
};

// ── Section config ────────────────────────────────────────────────────────

const SECTION_BUDGET_SEC = 2700; // 45 min

type SectionInfo = {
  key: "verbal" | "quantitative" | "dataInsights";
  label: string;
  shortLabel: string;
  emoji: string;
  icon: typeof MessageSquare;
  accent: string;
  from: string;
  barColor: string;
  total: number;
  timeKey: "verbalTimeSeconds" | "quantitativeTimeSeconds" | "dataInsightsTimeSeconds";
  scaledKey: keyof GmatSubmitResponse;
  rawKey: keyof GmatSubmitResponse;
  studyPath: string;
  topicSuggestion: string;
};

const SECTIONS: SectionInfo[] = [
  {
    key: "verbal",
    label: "Verbal Reasoning",
    shortLabel: "Verbal",
    emoji: "💬",
    icon: MessageSquare,
    accent: "#2dd4bf",
    from: "#0d9488",
    barColor: "bg-teal-500",
    total: 23,
    timeKey: "verbalTimeSeconds",
    scaledKey: "verbalScaledScore",
    rawKey: "verbalRawScore",
    studyPath: "/learning/critical-reasoning",
    topicSuggestion: "Critical Reasoning",
  },
  {
    key: "quantitative",
    label: "Quantitative Reasoning",
    shortLabel: "Quant",
    emoji: "🔢",
    icon: Calculator,
    accent: "#60a5fa",
    from: "#2563eb",
    barColor: "bg-blue-500",
    total: 21,
    timeKey: "quantitativeTimeSeconds",
    scaledKey: "quantitativeScaledScore",
    rawKey: "quantitativeRawScore",
    studyPath: "/learning/problem-solving",
    topicSuggestion: "Problem Solving",
  },
  {
    key: "dataInsights",
    label: "Data Insights",
    shortLabel: "Data Insights",
    emoji: "📊",
    icon: BarChart3,
    accent: "#a78bfa",
    from: "#7c3aed",
    barColor: "bg-violet-500",
    total: 20,
    timeKey: "dataInsightsTimeSeconds",
    scaledKey: "dataInsightsScaledScore",
    rawKey: "dataInsightsRawScore",
    studyPath: "/learning/data-sufficiency",
    topicSuggestion: "Data Sufficiency",
  },
];

// ── Coaching config ───────────────────────────────────────────────────────

type CoachingLevel = "strong" | "above-avg" | "needs-work" | "priority";

function sectionCoachingLevel(scaled: number): CoachingLevel {
  if (scaled >= 78) return "strong";
  if (scaled >= 70) return "above-avg";
  if (scaled >= 65) return "needs-work";
  return "priority";
}

const COACHING_CONFIG: Record<
  CoachingLevel,
  { emoji: string; badge: string; badgeClass: string; border: string; bg: string; headline: (l: string) => string; advice: string }
> = {
  "strong": {
    emoji: "🏆",
    badge: "Strong",
    badgeClass: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    border: "#10b981",
    bg: "bg-emerald-500/8",
    headline: (l) => `${l}: Strong performance`,
    advice: "You're in the top tier here. Focus on maintaining consistency and review any questions you were unsure about.",
  },
  "above-avg": {
    emoji: "📈",
    badge: "Above Average",
    badgeClass: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    border: "#3b82f6",
    bg: "bg-blue-500/8",
    headline: (l) => `${l}: Above average — push further`,
    advice: "A few more correct answers could significantly move your score. Drill medium-difficulty problems to lock in this section.",
  },
  "needs-work": {
    emoji: "📚",
    badge: "Needs Work",
    badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    border: "#f59e0b",
    bg: "bg-amber-500/8",
    headline: (l) => `${l}: Close — targeted practice will push you over`,
    advice: "Identify the specific question types you missed and practice those systematically. You're close to above-average.",
  },
  "priority": {
    emoji: "🎯",
    badge: "Priority Focus",
    badgeClass: "bg-red-500/20 text-red-600 dark:text-red-400",
    border: "#ef4444",
    bg: "bg-red-500/8",
    headline: (l) => `${l}: Needs the most attention`,
    advice: "Start with a micro-lesson on the core concepts, then build with targeted practice. This section has the most room to improve your total score.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function formatMin(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function FullGmatResultsPage() {
  const router = useRouter();
  const params = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch("/api/full-gmat/history");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const attempt = data.attempts?.find((a: any) => a.id === params.attemptId);
        if (attempt && attempt.status === "completed") {
          setResults({
            verbalRawScore:            attempt.verbalRawScore ?? 0,
            verbalScaledScore:         attempt.verbalScaledScore ?? 0,
            quantitativeRawScore:      attempt.quantitativeRawScore ?? 0,
            quantitativeScaledScore:   attempt.quantitativeScaledScore ?? 0,
            dataInsightsRawScore:      attempt.dataInsightsRawScore ?? 0,
            dataInsightsScaledScore:   attempt.dataInsightsScaledScore ?? 0,
            totalScore:                attempt.totalScore ?? 0,
            totalTimeSeconds:          attempt.totalTimeSeconds ?? 0,
            verbalTimeSeconds:         attempt.verbalTimeSeconds ?? 0,
            quantitativeTimeSeconds:   attempt.quantitativeTimeSeconds ?? 0,
            dataInsightsTimeSeconds:   attempt.dataInsightsTimeSeconds ?? 0,
          });
        }
      } catch { /* pass */ }
      finally { setLoading(false); }
    }
    fetchResults();
  }, [params.attemptId]);

  const displayScore = useCountUp(results?.totalScore ?? 0, 200, 1100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Results not available yet.</p>
        <button
          onClick={() => router.push("/full-gmat")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to GMAT Tests
        </button>
      </div>
    );
  }

  const scoreColor =
    results.totalScore >= 700 ? "text-emerald-500"
    : results.totalScore >= 565 ? "text-amber-500"
    : "text-red-500";

  const percentile = getGmatPercentile(results.totalScore);

  const sectionData = SECTIONS.map((s) => ({
    ...s,
    scaled:      (results[s.scaledKey] as number) ?? 0,
    raw:         (results[s.rawKey] as number) ?? 0,
    timeSeconds: (results[s.timeKey] as number) ?? 0,
  }));

  const weakest = [...sectionData].sort((a, b) => a.scaled - b.scaled)[0];
  const anyOverBudget = sectionData.some((s) => s.timeSeconds > SECTION_BUDGET_SEC);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 space-y-8">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold">GMAT Practice Test Complete</h1>
          <p className={cn("mt-4 text-7xl font-bold tabular-nums leading-none", scoreColor)}>
            {displayScore}
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            out of 805 · ~{percentile}th percentile
          </p>
          <div className={cn(
            "mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold",
            results.totalScore >= 700
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : results.totalScore >= 600
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}>
            {results.totalScore >= 700
              ? "🏆 Excellent — top 13% globally"
              : results.totalScore >= 600
              ? "📈 Above average — keep going"
              : "📚 Room to grow — focus on weak sections"}
          </div>
        </motion.div>

        {/* ── Section score cards ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {sectionData.map(({ label, emoji, accent, from, scaled, raw, total }, i) => {
            const barWidth = Math.max(0, Math.min(((scaled - 60) / 30) * 100, 100));
            return (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border bg-card overflow-hidden p-4"
                style={{ background: `linear-gradient(160deg, ${from}12, transparent 60%)` }}
              >
                <span className="text-3xl mb-2">{emoji}</span>
                <p className="text-3xl font-bold tabular-nums">{scaled}</p>
                <p className="text-xs text-muted-foreground mt-0.5 text-center leading-tight">{label}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: accent }}>{raw}/{total} correct</p>
                <div className="mt-3 w-full h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${from}, ${accent})` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── #7 Time Management — animated bars ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className={cn(
            "rounded-2xl border-2 overflow-hidden",
            anyOverBudget ? "border-amber-500/40" : "border-emerald-500/30"
          )}
        >
          {/* Panel header */}
          <div className={cn(
            "flex items-center gap-3 px-5 py-4 border-b",
            anyOverBudget
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-emerald-500/8 border-emerald-500/20"
          )}>
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
              anyOverBudget ? "bg-amber-500/20" : "bg-emerald-500/15"
            )}>
              ⏱️
            </div>
            <div>
              <p className="font-bold text-base">Time Management</p>
              <p className="text-sm text-muted-foreground">
                How long you spent on each section — budget is 45 min per section
              </p>
            </div>
          </div>

          {/* Section rows */}
          <div className="divide-y divide-border/40 bg-card">
            {sectionData.map(({ shortLabel, emoji, accent, from, timeSeconds }, i) => {
              const pct = Math.min((timeSeconds / SECTION_BUDGET_SEC) * 100, 100);
              const overBudget = timeSeconds > SECTION_BUDGET_SEC;
              return (
                <div key={shortLabel} className="px-5 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{emoji}</span>
                      <span className="font-semibold">{shortLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-base font-bold tabular-nums",
                        overBudget ? "text-amber-500" : "text-foreground"
                      )}>
                        {formatMin(timeSeconds)}
                      </span>
                      {overBudget && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" /> Over budget
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Animated bar */}
                  <div className="relative h-5 overflow-hidden rounded-full bg-muted">
                    <div className="absolute top-0 bottom-0 right-0 z-10 w-px bg-foreground/20" />
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: overBudget
                          ? "#f59e0b"
                          : `linear-gradient(90deg, ${from}, ${accent})`,
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1.0,
                        delay: 0.5 + i * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">0</span>
                    <span className="text-xs text-muted-foreground">45 min limit ↑</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer verdict */}
          <div className={cn(
            "px-5 py-4 border-t text-sm font-medium",
            anyOverBudget
              ? "bg-amber-500/8 border-amber-500/20 text-amber-700 dark:text-amber-300"
              : "bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
          )}>
            {anyOverBudget
              ? "⚠️ You went over the time limit on one or more sections. On the real GMAT, practice skipping hard questions and returning to them — don't get stuck."
              : "✅ Great pacing — you stayed within the 45-minute budget for every section."}
          </div>
        </motion.div>

        {/* ── #6 Per-section coaching cards ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
        >
          <p className="text-lg font-bold mb-4">How did you do? (Section by Section)</p>
          <div className="space-y-3">
            {sectionData.map(({ label, emoji, accent, from, scaled }, i) => {
              const level = sectionCoachingLevel(scaled);
              const cfg = COACHING_CONFIG[level];
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="rounded-2xl border-2 p-5"
                  style={{
                    borderColor: `${cfg.border}55`,
                    background: `linear-gradient(135deg, ${from}08, transparent 70%)`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl leading-none shrink-0 mt-0.5">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-bold text-base">{cfg.headline(label)}</p>
                        <span className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
                          cfg.badgeClass
                        )}>
                          {cfg.badge}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{cfg.advice}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{emoji} Score: {scaled}/90</span>
                        {/* Mini bar */}
                        <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted max-w-[120px]">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${from}, ${accent})` }}
                            initial={{ width: "0%" }}
                            animate={{ width: `${Math.max(0, Math.min(((scaled - 60) / 30) * 100, 100))}%` }}
                            transition={{ duration: 0.7, delay: 0.6 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── #8 Personalized Next Steps — 3 staggered cards ────── */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72 }}
            className="text-lg font-bold mb-4"
          >
            What should you do next?
          </motion.p>

          <div className="space-y-3">
            {[
              {
                href: weakest.studyPath,
                icon: "🎯",
                label: `Focus on ${weakest.label} — your weakest section`,
                sub: `Study ${weakest.topicSuggestion} and build this section up first`,
                cls: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300",
                arrowCls: "text-amber-500",
              },
              {
                href: "/learning",
                icon: "📚",
                label: "Follow your Study Plan",
                sub: "Work through Foundation → Practice → Mastery in order",
                cls: "border-primary/30 bg-primary/8 hover:bg-primary/15",
                arrowCls: "text-primary",
              },
              {
                href: "/full-gmat",
                icon: "📋",
                label: "Take another practice test",
                sub: "Track how your score improves over time",
                cls: "border-border hover:bg-muted/40",
                arrowCls: "text-muted-foreground",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.09 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={card.href}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-colors",
                    card.cls
                  )}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-3xl">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{card.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{card.sub}</p>
                  </div>
                  <ArrowRight className={cn("h-5 w-5 shrink-0", card.arrowCls)} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Full score breakdown ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl border bg-card p-5"
        >
          <h3 className="mb-3 font-semibold text-base">Full Score Breakdown</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {sectionData.map(({ label, scaled, raw, total }) => (
              <div key={label} className="flex justify-between border-t pt-2 first:border-0 first:pt-0">
                <span>{label}</span>
                <span className="font-medium text-foreground tabular-nums">
                  {scaled}/90 · {raw}/{total} correct
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-bold text-foreground">
              <span>Total Score</span>
              <span className="tabular-nums">{results.totalScore} / 805</span>
            </div>
            {(results.totalTimeSeconds ?? 0) > 0 && (
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Total Time</span>
                <span>{formatMin(results.totalTimeSeconds ?? 0)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Bottom nav ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          className="flex flex-col gap-3 sm:flex-row pb-8"
        >
          <button
            onClick={() => router.push("/full-gmat")}
            className="flex-1 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Back to GMAT Tests
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <BookOpen className="h-4 w-4" />
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
