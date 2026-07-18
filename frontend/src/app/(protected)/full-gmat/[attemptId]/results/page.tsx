"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy, BookOpen, Calculator, Database, ArrowRight, MessageSquare, BarChart3,
  Clock, AlertTriangle, TrendingUp, ChevronRight,
} from "lucide-react";
import { getGmatPercentile } from "@/lib/full-gmat/scoring";
import { cn } from "@/lib/utils";
import type { GmatSubmitResponse } from "@/types/full-gmat";

type AttemptResult = GmatSubmitResponse & {
  totalTimeSeconds?: number;
  verbalTimeSeconds?: number;
  quantitativeTimeSeconds?: number;
  dataInsightsTimeSeconds?: number;
};

// ── Coaching config ───────────────────────────────────────────────────────

const SECTION_BUDGET_SEC = 2700; // 45 min per section

type SectionInfo = {
  key: "verbal" | "quantitative" | "dataInsights";
  label: string;
  shortLabel: string;
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
    shortLabel: "DI",
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

function sectionCoaching(scaled: number, label: string): { title: string; body: string } {
  if (scaled >= 78) return {
    title: `${label}: Strong performance`,
    body: "You're in the top tier for this section. Focus on maintaining consistency and reviewing any questions you're unsure about.",
  };
  if (scaled >= 70) return {
    title: `${label}: Above average — push further`,
    body: "A few more correct answers could move your score significantly. Drill medium-difficulty problems to solidify this section.",
  };
  if (scaled >= 65) return {
    title: `${label}: Needs targeted practice`,
    body: "You're close to an above-average score. Identify the specific question types you missed and practice those systematically.",
  };
  return {
    title: `${label}: Priority focus area`,
    body: "This section has the most room for improvement. Start with a micro-lesson on the core concepts, then build with targeted practice questions.",
  };
}

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
            verbalRawScore: attempt.verbalRawScore ?? 0,
            verbalScaledScore: attempt.verbalScaledScore ?? 0,
            quantitativeRawScore: attempt.quantitativeRawScore ?? 0,
            quantitativeScaledScore: attempt.quantitativeScaledScore ?? 0,
            dataInsightsRawScore: attempt.dataInsightsRawScore ?? 0,
            dataInsightsScaledScore: attempt.dataInsightsScaledScore ?? 0,
            totalScore: attempt.totalScore ?? 0,
            totalTimeSeconds: attempt.totalTimeSeconds ?? 0,
            verbalTimeSeconds: attempt.verbalTimeSeconds ?? 0,
            quantitativeTimeSeconds: attempt.quantitativeTimeSeconds ?? 0,
            dataInsightsTimeSeconds: attempt.dataInsightsTimeSeconds ?? 0,
          });
        }
      } catch {
        // pass
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [params.attemptId]);

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
        <button onClick={() => router.push("/full-gmat")} className="text-sm font-medium text-primary hover:underline">
          Back to GMAT Tests
        </button>
      </div>
    );
  }

  const scoreColor = results.totalScore >= 700 ? "text-green-500" : results.totalScore >= 565 ? "text-amber-500" : "text-red-500";
  const percentile = getGmatPercentile(results.totalScore);

  // Compute section data with time info
  const sectionData = SECTIONS.map((s) => ({
    ...s,
    scaled: (results[s.scaledKey] as number) ?? 0,
    raw: (results[s.rawKey] as number) ?? 0,
    timeSeconds: (results[s.timeKey] as number) ?? 0,
  }));

  // Weakest section (lowest scaled score)
  const weakest = [...sectionData].sort((a, b) => a.scaled - b.scaled)[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 space-y-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-2xl bg-amber-500/10 p-4">
              <Trophy className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GMAT Practice Test Complete</h1>
        </motion.div>

        {/* ── Total score ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Total Score</p>
          <p className={`mt-2 text-6xl font-bold tabular-nums ${scoreColor}`}>{results.totalScore}</p>
          <p className="mt-1 text-sm text-muted-foreground">out of 805 · ~{percentile}th percentile</p>
        </motion.div>

        {/* ── Section breakdown cards ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sectionData.map(({ label, icon: Icon, accent, from, barColor, scaled, raw, total }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl border border-border/60 bg-card overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${from}10, transparent 60%)` }}
            >
              <div className="w-full px-4 pt-4 pb-2 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${from}22` }}>
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: accent }}>{label}</p>
              </div>
              <p className="text-4xl font-bold tabular-nums">{scaled}</p>
              <p className="mt-1 text-xs text-muted-foreground">{raw}/{total} correct</p>
              <div className="mt-3 w-full px-4 pb-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${((scaled - 60) / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Item 7: Time management per section ─────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Time Management</p>
            <span className="ml-auto text-xs text-muted-foreground">45 min budget per section</span>
          </div>
          <div className="divide-y divide-border/40">
            {sectionData.map(({ shortLabel, accent, from, timeSeconds }) => {
              const pct = Math.min((timeSeconds / SECTION_BUDGET_SEC) * 100, 100);
              const overBudget = timeSeconds > SECTION_BUDGET_SEC;
              const formatted = formatMin(timeSeconds);
              return (
                <div key={shortLabel} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-16 shrink-0 text-sm font-medium">{shortLabel}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: overBudget ? "#ef4444" : `linear-gradient(90deg, ${from}, ${accent})`,
                      }}
                    />
                  </div>
                  <span className={cn("w-16 shrink-0 text-right text-xs tabular-nums font-medium", overBudget ? "text-red-500" : "text-muted-foreground")}>
                    {formatted}
                  </span>
                  {overBudget && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              {sectionData.some(s => s.timeSeconds > SECTION_BUDGET_SEC)
                ? "You exceeded the time budget on one or more sections. Practice skipping hard questions and returning to them."
                : "Good pacing — you stayed within the 45-minute budget per section."}
            </p>
          </div>
        </motion.div>

        {/* ── Item 6: Per-section coaching feedback ───────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance Coaching</h3>
          {sectionData.map(({ label, accent, from, scaled }) => {
            const coaching = sectionCoaching(scaled, label);
            const isWeak = scaled < 68;
            return (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl border border-border/60 p-4"
                style={{ background: `linear-gradient(135deg, ${from}08, transparent 70%)` }}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${from}22` }}>
                  {isWeak
                    ? <AlertTriangle className="h-3.5 w-3.5" style={{ color: accent }} />
                    : <TrendingUp className="h-3.5 w-3.5" style={{ color: accent }} />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold">{coaching.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{coaching.body}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Item 8: Personalized next steps ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="border-b border-border/60 px-5 py-3.5">
            <p className="text-sm font-semibold">Your Personalized Next Steps</p>
            <p className="text-xs text-muted-foreground mt-0.5">Based on your performance, Athena recommends:</p>
          </div>
          <div className="divide-y divide-border/40">
            {/* Primary: focus on weakest section */}
            <Link
              href={weakest.studyPath}
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40 group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${weakest.from}22` }}>
                <AlertTriangle className="h-4 w-4" style={{ color: weakest.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Focus on {weakest.label}</p>
                <p className="text-xs text-muted-foreground">Start with {weakest.topicSuggestion} — your lowest-scoring section</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </Link>

            {/* Secondary: study plan for specific topic */}
            <Link
              href="/learning"
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40 group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Follow your Study Plan</p>
                <p className="text-xs text-muted-foreground">Foundation → Practice → Mastery roadmap</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </Link>

            {/* Tertiary: take another test */}
            <Link
              href="/full-gmat"
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40 group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Take another practice test</p>
                <p className="text-xs text-muted-foreground">Track your score trend over multiple attempts</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* ── Score details table ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold">Score Details</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {sectionData.map(({ label, scaled, raw, total }) => (
              <div key={label} className="flex justify-between border-t pt-2 first:border-0 first:pt-0">
                <span>{label}</span>
                <span className="font-medium text-foreground">{scaled}/90 · {raw}/{total} correct</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold text-foreground">
              <span>Total</span>
              <span>{results.totalScore} / 805</span>
            </div>
            {(results.totalTimeSeconds ?? 0) > 0 && (
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Total Time</span>
                <span>{formatMin(results.totalTimeSeconds ?? 0)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Primary actions ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push("/full-gmat")}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Back to GMAT Tests
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
