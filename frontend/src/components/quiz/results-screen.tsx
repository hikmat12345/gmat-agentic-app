"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReviewItem } from "./review-item";
import type { Problem } from "./types";
import { Timer, TrendingUp } from "lucide-react";

// ── Count-up hook ─────────────────────────────────────────────────────────

function useCountUp(target: number, delay = 0, duration = 900): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
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

// ── Helpers ───────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function buildTimeInsight(
  problems: Problem[],
  elapsed: number
): { avgSec: number; target: number; pct: number } | null {
  if (!elapsed || !problems.length) return null;
  const avgSec = Math.round(elapsed / problems.length);
  const target = Math.round(
    problems.reduce((s, p) => s + (p.timeRecommendationSeconds ?? 120), 0) / problems.length
  );
  if (!target) return null;
  return { avgSec, target, pct: Math.round((avgSec / target) * 100) };
}

// ── Props ─────────────────────────────────────────────────────────────────

type ResultsScreenProps = {
  problems: Problem[];
  answers: Map<string, number>;
  score: number;
  elapsed: number;
  onRetry: () => void;
  onClose?: () => void;
  onPractice?: () => void;
  aiSummary?: { greeting: string; summary: string; encouragement: string };
  topicSlug?: string;
  subtopicSlug?: string;
};

// ── Component ─────────────────────────────────────────────────────────────

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

  const displayPct = useCountUp(pct, 80);

  // ── #7 Time insight ──────────────────────────────────────────────────
  const timeInsight = buildTimeInsight(problems, elapsed);
  const timePace =
    timeInsight == null ? null
    : timeInsight.pct > 130 ? "slow"
    : timeInsight.pct < 70  ? "fast"
    : "good";
  // Bar: target sits at 66.6% of bar; clamp to 100%
  const timeBarPct = timeInsight
    ? Math.min((timeInsight.avgSec / (timeInsight.target * 1.5)) * 100, 100)
    : 0;

  // ── #6 Coaching ──────────────────────────────────────────────────────
  type Coaching = {
    emoji: string; badge: string; headline: string; detail: string;
    color: "green" | "blue" | "amber";
  };
  const coaching: Coaching =
    pct >= 80
      ? {
          emoji: "🏆", badge: "Mastered",
          headline: "You've mastered this subtopic!",
          detail: "You're ready to move on. Try a harder practice set to keep the momentum going.",
          color: "green",
        }
      : pct >= 60
      ? {
          emoji: "📚", badge: "Keep Practicing",
          headline: "Good progress — a bit more practice needed",
          detail: "Look at the questions you got wrong below. Spotting the pattern is the fastest way to improve your accuracy.",
          color: "blue",
        }
      : {
          emoji: "🎯", badge: "Watch Lesson First",
          headline: "This topic needs more work — watch the lesson first",
          detail: "A micro-lesson will explain the concept clearly. Understanding the 'why' first makes the practice much more effective.",
          color: "amber",
        };

  const coachingStyles = {
    green: {
      border: "border-emerald-500/40", bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    },
    blue: {
      border: "border-blue-500/40", bg: "bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
    },
    amber: {
      border: "border-amber-500/40", bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    },
  };
  const cs = coachingStyles[coaching.color];

  // ── #8 Next step cards ───────────────────────────────────────────────
  type Card = { key: string; href?: string; onClick?: () => void; icon: string; label: string; sub: string; cls: string };
  const cards: Card[] = [];

  if (pct < 60 && topicSlug && subtopicSlug) {
    cards.push({
      key: "lesson",
      href: `/learning/${topicSlug}/${subtopicSlug}/micro-lesson`,
      icon: "🎓",
      label: "Watch the Micro-Lesson",
      sub: "Learn the concept clearly, then come back to practice",
      cls: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300",
    });
  }

  if (onPractice) {
    cards.push({
      key: "practice",
      onClick: onPractice,
      icon: "✏️",
      label: pct >= 80 ? "Practice Harder Problems" : "Do 2 More Practice Questions",
      sub: pct >= 80 ? "Push to the next difficulty level" : "Reinforce what you just learned",
      cls: "border-primary/30 bg-primary/8 hover:bg-primary/15",
    });
  }

  return (
    <div className="flex h-full flex-col">

      {/* ── Score + insight header ───────────────────────────────── */}
      <div className="border-b py-8 px-6 space-y-4">

        {/* Score hero */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="text-center"
        >
          <p className={cn(
            "text-7xl font-bold tabular-nums leading-none",
            pct >= 80 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500"
          )}>
            {displayPct}%
          </p>
          <p className="text-xl text-muted-foreground mt-2">{score} out of {total} correct</p>
          <p className="text-sm text-muted-foreground mt-0.5">Time: {formatTime(elapsed)}</p>
          {pct >= 80 && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" /> Strong performance
            </div>
          )}
        </motion.div>

        {/* ── #6 Coaching card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn("rounded-2xl border-2 px-5 py-4", cs.border, cs.bg)}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none shrink-0 mt-0.5">{coaching.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <p className={cn("text-lg font-bold leading-snug", cs.text)}>{coaching.headline}</p>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", cs.badge)}>
                  {coaching.badge}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{coaching.detail}</p>
            </div>
          </div>
        </motion.div>

        {/* ── #7 Time card ──────────────────────────────────────── */}
        {timeInsight && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="rounded-2xl border bg-card px-5 py-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <p className="font-semibold text-base">Your Time Per Question</p>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <p className={cn(
                  "text-5xl font-bold tabular-nums leading-none",
                  timePace === "slow" ? "text-amber-500"
                  : timePace === "fast" ? "text-blue-500"
                  : "text-emerald-500"
                )}>
                  {timeInsight.avgSec}s
                </p>
                <p className="text-sm text-muted-foreground mt-1">your average</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-muted-foreground">{timeInsight.target}s</p>
                <p className="text-sm text-muted-foreground">recommended</p>
              </div>
            </div>

            <div className="relative h-4 overflow-hidden rounded-full bg-muted mb-2">
              <div
                className="absolute top-0 bottom-0 z-10 w-px bg-foreground/25"
                style={{ left: "66.6%" }}
              />
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  timePace === "slow" ? "bg-amber-500"
                  : timePace === "fast" ? "bg-blue-500"
                  : "bg-emerald-500"
                )}
                initial={{ width: "0%" }}
                animate={{ width: `${timeBarPct}%` }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mb-3">
              <span>0s</span>
              <span>{timeInsight.target}s target ↑</span>
            </div>

            <p className={cn(
              "text-sm font-medium rounded-xl px-3 py-2.5",
              timePace === "slow"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : timePace === "fast"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            )}>
              {timePace === "slow" && "⚠️ Too slow — on the GMAT, practice skipping hard questions and returning later."}
              {timePace === "fast" && "⚡ Moving fast — double-check you read each question fully before answering."}
              {timePace === "good" && "✅ Great pacing — you're right on the recommended target."}
            </p>
          </motion.div>
        )}

        {/* ── #8 Next step cards ────────────────────────────────── */}
        {cards.length > 0 && (
          <div className="space-y-2.5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
              className="text-base font-bold"
            >
              What should you do next?
            </motion.p>

            {cards.map((card, i) => {
              const inner = (
                <>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-3xl">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{card.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{card.sub}</p>
                  </div>
                  <span className="text-xl shrink-0 opacity-60">→</span>
                </>
              );
              const cls = cn(
                "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                card.cls
              );
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  whileHover={{ y: -2 }}
                >
                  {card.href
                    ? <a href={card.href} className={cls}>{inner}</a>
                    : <button onClick={card.onClick} className={cls}>{inner}</button>
                  }
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Retry / close ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="flex gap-2 pt-1"
        >
          <Button variant="outline" onClick={onRetry} className="flex-1 h-12 text-sm font-semibold rounded-xl">
            Retry Quiz
          </Button>
          {onClose && !onPractice && (
            <Button onClick={onClose} className="flex-1 h-12 text-sm font-semibold rounded-xl">
              {pct >= 80 ? "Next Subtopic →" : "Close"}
            </Button>
          )}
        </motion.div>
      </div>

      {/* ── AI tutor summary ─────────────────────────────────────── */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto max-w-lg px-6 py-4 text-center"
        >
          <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
          <p className="mt-2 text-xs font-medium text-amber-500">{aiSummary.encouragement}</p>
        </motion.div>
      )}

      {/* ── Question review ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-lg font-semibold mb-4">Review Your Answers</h3>
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
