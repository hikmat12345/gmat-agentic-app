"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, BookOpen, Calculator, Database, ArrowRight, MessageSquare, BarChart3 } from "lucide-react";
import { getGmatPercentile } from "@/lib/full-gmat/scoring";
import type { GmatSubmitResponse } from "@/types/full-gmat";

type AttemptResult = GmatSubmitResponse & { totalTimeSeconds?: number };

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
          });
        }
      } catch {
        // Silently fail — results may be passed via context
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
    results.totalScore >= 700
      ? "text-green-500"
      : results.totalScore >= 565
        ? "text-amber-500"
        : "text-red-500";

  const percentile = getGmatPercentile(results.totalScore);

  const sections = [
    {
      label: "Verbal Reasoning",
      icon: MessageSquare,
      accent: "#2dd4bf",
      from: "#0d9488",
      barColor: "bg-teal-500",
      scaled: results.verbalScaledScore,
      raw: results.verbalRawScore,
      total: 23,
    },
    {
      label: "Quantitative Reasoning",
      icon: Calculator,
      accent: "#60a5fa",
      from: "#2563eb",
      barColor: "bg-blue-500",
      scaled: results.quantitativeScaledScore,
      raw: results.quantitativeRawScore,
      total: 21,
    },
    {
      label: "Data Insights",
      icon: BarChart3,
      accent: "#a78bfa",
      from: "#7c3aed",
      barColor: "bg-violet-500",
      scaled: results.dataInsightsScaledScore,
      raw: results.dataInsightsRawScore,
      total: 20,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-2xl bg-amber-500/10 p-4">
              <Trophy className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GMAT Practice Test Complete</h1>
        </motion.div>

        {/* Total score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Total Score
          </p>
          <p className={`mt-2 text-6xl font-bold tabular-nums ${scoreColor}`}>
            {results.totalScore}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">out of 805 &middot; ~{percentile}th percentile</p>
        </motion.div>

        {/* Section breakdown — 3 cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {sections.map(({ label, icon: Icon, accent, from, barColor, scaled, raw, total }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl border border-border/60 bg-card overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${from}10, transparent 60%)` }}
            >
              <div className="w-full px-4 pt-4 pb-2 text-center">
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${from}22` }}
                >
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: accent }}>{label}</p>
              </div>
              <p className="text-4xl font-bold tabular-nums">{scaled}</p>
              <p className="mt-1 text-xs text-muted-foreground">{raw}/{total} correct</p>
              <div className="mt-3 w-full px-4 pb-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${((scaled - 60) / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Score breakdown table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl border bg-card p-5"
        >
          <h3 className="mb-3 text-sm font-semibold">Score Details</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {sections.map(({ label, scaled, raw, total }) => (
              <div key={label} className="flex justify-between border-t pt-2 first:border-0 first:pt-0">
                <span>{label}</span>
                <span className="font-medium text-foreground">
                  {scaled}/90 &middot; {raw}/{total} correct
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold text-foreground">
              <span>Total</span>
              <span>{results.totalScore} / 805</span>
            </div>
            {results.totalTimeSeconds && results.totalTimeSeconds > 0 && (
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Total Time</span>
                <span>{Math.round(results.totalTimeSeconds / 60)} min</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
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
