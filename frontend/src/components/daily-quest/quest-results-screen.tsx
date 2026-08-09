"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Target, ArrowRight, CheckCircle2, Zap, Timer } from "lucide-react";
import { useQuestContext } from "./quest-context";
import { cn } from "@/lib/utils";

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

function avgTimeSec(problems: { responseTimeMs: number | null }[]): number | null {
  const answered = problems.filter((p) => p.responseTimeMs != null);
  if (!answered.length) return null;
  return Math.round(
    answered.reduce((s, p) => s + (p.responseTimeMs ?? 0), 0) / answered.length / 1000
  );
}

type SubtopicStat = { name: string; slug: string; topicSlug: string; wrong: number; total: number };

function findWeakestSubtopics(
  problems: { subtopicId: string; subtopicName: string; topicName: string; isCorrect: boolean | null }[]
): SubtopicStat[] {
  const map = new Map<string, SubtopicStat>();
  for (const p of problems) {
    const slug = p.subtopicName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const topicSlug = p.topicName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const prev = map.get(p.subtopicId) ?? { name: p.subtopicName, slug, topicSlug, wrong: 0, total: 0 };
    prev.total++;
    if (!p.isCorrect) prev.wrong++;
    map.set(p.subtopicId, prev);
  }
  return [...map.values()].filter((s) => s.wrong > 0).sort((a, b) => b.wrong / b.total - a.wrong / a.total);
}

// ── Component ─────────────────────────────────────────────────────────────

export function QuestResultsScreen() {
  const router = useRouter();
  const ctx = useQuestContext();

  const accuracy = ctx.problems.length > 0
    ? Math.round((ctx.score / ctx.problems.length) * 100)
    : 0;

  const minutes = Math.floor(ctx.elapsed / 60);
  const seconds = ctx.elapsed % 60;

  // Count-up animations
  const displayAccuracy = useCountUp(accuracy, 120);
  const displayXP       = useCountUp(ctx.xpEarned, 180);

  // ── #7 Time management ─────────────────────────────────────────────────
  const avg = avgTimeSec(ctx.problems);
  const GMAT_TARGET = 120;
  const timePace =
    avg == null ? null
    : avg > GMAT_TARGET * 1.25 ? "slow"
    : avg < GMAT_TARGET * 0.75 ? "fast"
    : "good";
  // Bar fills to position relative to target: target = 66.6% of bar width
  const timeBarPct = avg == null ? 0 : Math.min((avg / (GMAT_TARGET * 1.5)) * 100, 100);

  // ── #6 Coaching feedback ───────────────────────────────────────────────
  const weakSubtopics = findWeakestSubtopics(ctx.problems);
  const topWeak = weakSubtopics[0];

  const weakBucketProblems = ctx.problems.filter((p) => p.bucket === "weak");
  const weakBucketAcc = weakBucketProblems.length > 0
    ? Math.round((weakBucketProblems.filter((p) => p.isCorrect).length / weakBucketProblems.length) * 100)
    : 100;

  type Coaching = {
    emoji: string; badge: string; headline: string; detail: string;
    color: "green" | "blue" | "amber";
  };
  const coaching: Coaching =
    accuracy >= 85
      ? {
          emoji: "🏆", badge: "Excellent",
          headline: "Outstanding — you're in great shape!",
          detail: "You crushed this quest. Keep pushing into harder material to build your scoring edge.",
          color: "green",
        }
      : accuracy >= 65
      ? {
          emoji: "📚", badge: "Keep Building",
          headline: topWeak
            ? `Focus on ${topWeak.name} — you missed ${topWeak.wrong}/${topWeak.total}`
            : "Keep building — focus on your weak areas",
          detail: topWeak
            ? `A short review on ${topWeak.name} will move your score. The pattern shows where you need the most work.`
            : "Review the questions you missed and identify the pattern.",
          color: "blue",
        }
      : {
          emoji: "🎯", badge: "Needs Work",
          headline: topWeak
            ? `${topWeak.name} needs urgent attention — ${topWeak.wrong}/${topWeak.total} wrong`
            : "This needs more work — study before the next attempt",
          detail: topWeak
            ? `A 10-minute micro-lesson on ${topWeak.name} will explain the concept clearly before you drill more questions.`
            : "Work through each wrong answer carefully to understand why.",
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

  // Difficulty buckets
  const BUCKETS = [
    { key: "weak" as const,    label: "Your Weak Areas",   emoji: "🔴" },
    { key: "mid" as const,     label: "Medium Level",      emoji: "🟡" },
    { key: "stretch" as const, label: "Stretch (Hardest)", emoji: "🟢" },
  ];
  const bucketData = BUCKETS.map((b) => {
    const probs = ctx.problems.filter((p) => p.bucket === b.key);
    const correct = probs.filter((p) => p.isCorrect).length;
    const bAcc = probs.length > 0 ? Math.round((correct / probs.length) * 100) : 0;
    return { ...b, probs, correct, bAcc };
  }).filter((b) => b.probs.length > 0);

  // Next-step cards (built as array for stagger)
  type NextCard = { key: string; href?: string; onClick?: () => void; icon: string; label: string; sub: string; style: string };
  const nextCards: NextCard[] = [];

  if (weakBucketAcc < 60 && topWeak) {
    nextCards.push({
      key: "lesson",
      href: `/learning/${topWeak.topicSlug}/${topWeak.slug}/micro-lesson`,
      icon: "🎓",
      label: `Watch a lesson on ${topWeak.name}`,
      sub: "Build your understanding before drilling more questions",
      style: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300",
    });
  }
  if (accuracy >= 80) {
    nextCards.push({
      key: "gmat",
      href: "/full-gmat",
      icon: "📋",
      label: "Take a full GMAT practice test",
      sub: "You're ready — see your real GMAT score estimate",
      style: "border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-800 dark:text-blue-300",
    });
  } else if (accuracy >= 65 && topWeak) {
    nextCards.push({
      key: "quiz",
      href: `/learning/${topWeak.topicSlug}/${topWeak.slug}/quiz`,
      icon: "✏️",
      label: `Practice more on ${topWeak.name}`,
      sub: "Drill the area where you struggled most",
      style: "border-primary/30 bg-primary/8 hover:bg-primary/15",
    });
  }
  nextCards.push({
    key: "dashboard",
    onClick: () => router.push("/dashboard"),
    icon: "🏠",
    label: "Back to Dashboard",
    sub: "Check your streak and upcoming sessions",
    style: "border-border bg-card hover:bg-muted/40",
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-start overflow-auto px-4 py-8">
      <div className="w-full max-w-lg space-y-5">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold">Quest Complete!</h1>
          <p className="mt-1 text-base text-muted-foreground">
            {accuracy >= 80
              ? "Outstanding performance!"
              : accuracy >= 60
              ? "Good effort — keep pushing!"
              : "Every quest makes you stronger."}
          </p>
        </motion.div>

        {/* ── Stat chips ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="flex flex-col items-center rounded-2xl border bg-card p-4 gap-1">
            <Target className="h-5 w-5 text-muted-foreground mb-1" />
            <p className={cn(
              "text-3xl font-bold tabular-nums",
              accuracy >= 70 ? "text-emerald-500" : accuracy >= 50 ? "text-amber-500" : "text-red-500"
            )}>
              {displayAccuracy}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border bg-card p-4 gap-1">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-3xl font-bold tabular-nums">{ctx.score}/{ctx.problems.length}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border bg-card p-4 gap-1">
            <Zap className="h-5 w-5 text-amber-500 mb-1" />
            <p className="text-3xl font-bold tabular-nums text-amber-500">+{displayXP}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </motion.div>

        {/* ── #6 Coaching card ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className={cn("rounded-2xl border-2 p-5", cs.border, cs.bg)}
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

        {/* ── #7 Time card ────────────────────────────────────────── */}
        {avg != null && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
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
                  {avg}s
                </p>
                <p className="text-sm text-muted-foreground mt-1">your average per question</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-muted-foreground">120s</p>
                <p className="text-sm text-muted-foreground">GMAT target</p>
              </div>
            </div>

            {/* Animated fill bar — target marker sits at 66.6% of bar width */}
            <div className="relative h-4 overflow-hidden rounded-full bg-muted mb-3">
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
                transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mb-3">
              <span>0s</span>
              <span>120s target ↑</span>
              <span>180s</span>
            </div>

            <div className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium",
              timePace === "slow"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : timePace === "fast"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            )}>
              {timePace === "slow" && "⚠️ You're spending too long per question. On the real GMAT, practice skipping tough questions and coming back to them."}
              {timePace === "fast" && "⚡ You're moving fast — make sure you're reading each question fully before selecting an answer."}
              {timePace === "good" && "✅ Perfect pace! You're right on the GMAT target of 2 minutes per question."}
            </div>
          </motion.div>
        )}

        {/* ── Difficulty breakdown ─────────────────────────────────── */}
        {bucketData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="rounded-2xl border bg-card p-5"
          >
            <p className="font-semibold text-base mb-4">How You Did By Difficulty</p>
            <div className="space-y-4">
              {bucketData.map((b, i) => (
                <div key={b.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{b.emoji} {b.label}</span>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      b.bAcc >= 70 ? "text-emerald-500" : b.bAcc >= 50 ? "text-amber-500" : "text-red-500"
                    )}>
                      {b.correct}/{b.probs.length} correct
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        b.bAcc >= 70 ? "bg-emerald-500" : b.bAcc >= 50 ? "bg-amber-500" : "bg-red-500"
                      )}
                      initial={{ width: "0%" }}
                      animate={{ width: `${b.bAcc}%` }}
                      transition={{
                        duration: 0.7,
                        delay: 0.52 + i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── #8 Next step cards — individually staggered ──────────── */}
        <div className="space-y-3">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base font-bold"
          >
            What should you do next?
          </motion.p>

          {nextCards.map((card, i) => {
            const inner = (
              <>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-3xl">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">{card.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{card.sub}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 opacity-60" />
              </>
            );

            const sharedClass = cn(
              "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
              card.style
            );

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 + i * 0.08 }}
                whileHover={{ y: -2 }}
              >
                {card.href ? (
                  <Link href={card.href} className={sharedClass}>{inner}</Link>
                ) : (
                  <button onClick={card.onClick} className={sharedClass}>{inner}</button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer time ──────────────────────────────────────────── */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Total time: {minutes}m {seconds.toString().padStart(2, "0")}s
        </p>
      </div>
    </div>
  );
}
