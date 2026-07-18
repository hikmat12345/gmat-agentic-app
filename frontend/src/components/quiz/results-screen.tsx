"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReviewItem } from "./review-item";
import type { Problem } from "./types";
import { AlertTriangle, BookOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react";

type ResultsScreenProps = {
  problems: Problem[];
  answers: Map<string, number>;
  score: number;
  elapsed: number;
  onRetry: () => void;
  onClose?: () => void;
  onPractice?: () => void;
  aiSummary?: { greeting: string; summary: string; encouragement: string };
  // Routing context for smart next-step CTAs
  topicSlug?: string;
  subtopicSlug?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Per-question avg time vs recommendation
function buildTimeInsight(problems: Problem[], elapsed: number): { avgSec: number; target: number; pct: number } | null {
  if (!elapsed || !problems.length) return null;
  const avgSec = Math.round(elapsed / problems.length);
  const target = Math.round(
    problems.reduce((s, p) => s + (p.timeRecommendationSeconds ?? 120), 0) / problems.length
  );
  if (!target) return null;
  return { avgSec, target, pct: Math.round((avgSec / target) * 100) };
}

export function ResultsScreen({
  problems,
  answers,
  score,
  elapsed,
  onRetry,
  onClose,
  onPractice,
  aiSummary,
  topicSlug,
  subtopicSlug,
}: ResultsScreenProps) {
  const total = problems.length;
  const pct = Math.round((score / total) * 100);

  // ── Item 7: Time insight ─────────────────────────────────────────────
  const timeInsight = buildTimeInsight(problems, elapsed);

  // ── Item 6: Coaching feedback ────────────────────────────────────────
  const coaching =
    pct >= 80
      ? { color: "emerald", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, title: "Excellent! You've mastered this subtopic.", body: "You're ready to move on. Try the next subtopic or challenge yourself with a harder practice set." }
      : pct >= 60
      ? { color: "blue",    icon: <BookOpen className="h-4 w-4 text-blue-500" />,       title: "Good progress — a bit more practice needed.", body: "Review the questions you missed and identify the pattern. Practice 2–3 more problems on those question types." }
      : { color: "amber",   icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, title: "This subtopic needs more work.", body: "A micro-lesson will help you build the concept before drilling more questions. Understanding the 'why' will unlock consistent accuracy." };

  return (
    <div className="flex h-full flex-col">

      {/* ── Score header ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 border-b py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={cn(
            "text-6xl font-bold",
            pct >= 80 ? "text-athena-success" : pct >= 50 ? "text-athena-amber" : "text-destructive"
          )}
        >
          {score}/{total}
        </motion.div>
        <p className="text-lg text-muted-foreground">{pct}% correct</p>
        <p className="text-sm text-muted-foreground">Time: {formatTime(elapsed)}</p>

        {/* ── Item 6: Coaching card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "mx-auto max-w-sm w-full rounded-xl border px-4 py-3.5 text-left mt-2",
            coaching.color === "emerald" ? "border-emerald-500/30 bg-emerald-500/5" :
            coaching.color === "blue"    ? "border-blue-500/30 bg-blue-500/5" :
                                           "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">{coaching.icon}</span>
            <div>
              <p className="text-sm font-semibold">{coaching.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{coaching.body}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Item 7: Time insight ───────────────────────────────────── */}
        {timeInsight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto max-w-sm w-full flex items-center gap-2 rounded-xl border px-4 py-2.5"
          >
            <Clock className={cn("h-4 w-4 shrink-0", timeInsight.pct > 130 ? "text-amber-500" : "text-muted-foreground")} />
            <p className="text-xs text-muted-foreground">
              Avg {timeInsight.avgSec}s/question vs {timeInsight.target}s recommended
              {timeInsight.pct > 130 && " — try not to spend too long on any single question"}
              {timeInsight.pct < 70 && " — you were fast; double-check you read each question fully"}
            </p>
          </motion.div>
        )}

        {/* ── Item 8: Smart action buttons ──────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button variant="outline" onClick={onRetry}>Retry Quiz</Button>

          {/* Micro-lesson CTA when struggling */}
          {pct < 60 && topicSlug && subtopicSlug && (
            <Button asChild>
              <a href={`/learning/${topicSlug}/${subtopicSlug}/micro-lesson`}>
                Watch Micro-Lesson
              </a>
            </Button>
          )}

          {/* Practice more when mid-range */}
          {onPractice && (
            <Button onClick={onPractice}>
              {pct >= 80 ? "Practice Harder Problems" : "Practice 2 More Problems"}
            </Button>
          )}

          {onClose && !onPractice && (
            <Button onClick={onClose}>
              {pct >= 80 ? "Next Subtopic" : "Close"}
            </Button>
          )}
        </div>
      </div>

      {/* ── AI tutor summary ─────────────────────────────────────────── */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto max-w-lg px-6 py-4 text-center"
        >
          <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
          <p className="mt-2 text-xs font-medium text-athena-amber">{aiSummary.encouragement}</p>
        </motion.div>
      )}

      {/* ── Question review ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Question Review</h3>
          {pct >= 80 && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Strong performance
            </span>
          )}
        </div>
        <div className="space-y-4">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ReviewItem
                problem={problem}
                index={i}
                selectedOption={answers.get(problem.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
