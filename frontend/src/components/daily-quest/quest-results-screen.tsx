"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Zap, Clock, Target, ArrowRight, TrendingUp, BookOpen, AlertTriangle } from "lucide-react";
import { useQuestContext } from "./quest-context";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────

function avgTimeSec(problems: { responseTimeMs: number | null }[]): number | null {
  const answered = problems.filter((p) => p.responseTimeMs != null);
  if (!answered.length) return null;
  return Math.round(answered.reduce((s, p) => s + (p.responseTimeMs ?? 0), 0) / answered.length / 1000);
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

  // ── Item 7: Time management ──────────────────────────────────────────
  const avg = avgTimeSec(ctx.problems);
  const GMAT_TARGET = 120; // 2 min per question
  const timePace = avg == null ? null : avg > GMAT_TARGET * 1.25 ? "slow" : avg < GMAT_TARGET * 0.75 ? "fast" : "good";

  // ── Item 6: Coaching feedback ────────────────────────────────────────
  const weakSubtopics = findWeakestSubtopics(ctx.problems);
  const topWeak = weakSubtopics[0];

  const weakBucketProblems = ctx.problems.filter((p) => p.bucket === "weak");
  const weakBucketAcc = weakBucketProblems.length > 0
    ? Math.round((weakBucketProblems.filter((p) => p.isCorrect).length / weakBucketProblems.length) * 100)
    : 100;

  const coachingMsg =
    accuracy >= 85
      ? { title: "Excellent performance!", body: "You're in strong shape. Push into harder questions to build a scoring edge.", color: "emerald" }
      : accuracy >= 65
      ? { title: "Solid effort — keep building.", body: topWeak ? `Focus on ${topWeak.name} where you missed ${topWeak.wrong}/${topWeak.total} questions.` : "Review the questions you missed and try a micro-lesson on that concept.", color: "blue" }
      : { title: "Targeted practice will move your score.", body: topWeak ? `${topWeak.name} needs the most work — ${topWeak.wrong}/${topWeak.total} wrong. A 10-min micro-lesson can unlock this.` : "Work through each wrong answer carefully. Understanding why builds lasting accuracy.", color: "amber" };

  const coachingColors: Record<string, { border: string; bg: string; title: string; icon: string }> = {
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", title: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-600 dark:text-emerald-400" },
    blue:    { border: "border-blue-500/30",    bg: "bg-blue-500/5",    title: "text-blue-700 dark:text-blue-300",    icon: "text-blue-600 dark:text-blue-400" },
    amber:   { border: "border-amber-500/30",   bg: "bg-amber-500/5",   title: "text-amber-700 dark:text-amber-300",  icon: "text-amber-600 dark:text-amber-400" },
  };
  const cc = coachingColors[coachingMsg.color];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Quest Complete!</h1>
          <p className="mt-1 text-muted-foreground">
            {accuracy >= 80
              ? "Outstanding performance!"
              : accuracy >= 60
                ? "Good effort, keep pushing!"
                : "Every quest makes you stronger."}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center">
            <Target className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{ctx.score}/{ctx.problems.length}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className={cn("mx-auto mb-2 text-lg font-bold", accuracy >= 70 ? "text-emerald-500" : accuracy >= 50 ? "text-amber-500" : "text-red-500")}>
              {accuracy}%
            </p>
            <p className="text-2xl font-bold">&nbsp;</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <Zap className="mx-auto mb-2 h-5 w-5 text-athena-amber" />
            <p className="text-2xl font-bold text-athena-amber">+{ctx.xpEarned}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </div>

        {/* Item 7: Time management insight */}
        {avg != null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3",
              timePace === "slow"
                ? "border-amber-500/30 bg-amber-500/5"
                : timePace === "fast"
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            )}
          >
            <Clock className={cn("h-4 w-4 shrink-0", timePace === "slow" ? "text-amber-500" : timePace === "fast" ? "text-blue-500" : "text-emerald-500")} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Avg {avg}s per question
                {timePace === "slow" && " — above GMAT pace"}
                {timePace === "fast" && " — faster than GMAT pace"}
                {timePace === "good" && " — on GMAT pace"}
              </p>
              <p className="text-xs text-muted-foreground">
                {timePace === "slow"
                  ? `GMAT target is ~${GMAT_TARGET}s/question. Practice skipping and returning to slow questions.`
                  : timePace === "fast"
                  ? "Speed is good — make sure you're reading carefully before selecting."
                  : `Ideal pace. GMAT target is ~${GMAT_TARGET}s per question.`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Bucket breakdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Performance by Focus Area</h3>
          {(["weak", "mid", "stretch"] as const).map((bucket) => {
            const bucketProblems = ctx.problems.filter((p) => p.bucket === bucket);
            if (bucketProblems.length === 0) return null;
            const correct = bucketProblems.filter((p) => p.isCorrect).length;
            const bAcc = Math.round((correct / bucketProblems.length) * 100);
            const label = bucket === "weak" ? "Weak Areas" : bucket === "mid" ? "Mid Level" : "Stretch";
            return (
              <div key={bucket} className="flex items-center gap-3 rounded-xl border px-4 py-2.5">
                <span className="flex-1 text-sm">{label}</span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", bAcc >= 70 ? "bg-emerald-500" : bAcc >= 50 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${bAcc}%` }}
                  />
                </div>
                <span className="w-14 text-right text-sm font-medium tabular-nums">{correct}/{bucketProblems.length}</span>
              </div>
            );
          })}
        </div>

        {/* Item 6: Coaching feedback */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn("rounded-xl border px-4 py-3.5", cc.border, cc.bg)}
        >
          <div className="flex items-start gap-3">
            {accuracy >= 85
              ? <TrendingUp className={cn("h-4 w-4 shrink-0 mt-0.5", cc.icon)} />
              : accuracy >= 65
              ? <BookOpen className={cn("h-4 w-4 shrink-0 mt-0.5", cc.icon)} />
              : <AlertTriangle className={cn("h-4 w-4 shrink-0 mt-0.5", cc.icon)} />
            }
            <div>
              <p className={cn("text-sm font-semibold", cc.title)}>{coachingMsg.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{coachingMsg.body}</p>
            </div>
          </div>
        </motion.div>

        {/* Item 8: Next step CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2.5"
        >
          <p className="text-sm font-medium text-muted-foreground">What to do next</p>

          {weakBucketAcc < 60 && topWeak && (
            <Link
              href={`/learning/${topWeak.topicSlug}/${topWeak.slug}/micro-lesson`}
              className="flex w-full items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm font-semibold transition-colors hover:bg-amber-500/10"
            >
              <span>Watch micro-lesson: {topWeak.name}</span>
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </Link>
          )}

          {accuracy >= 80 && (
            <Link
              href="/full-gmat"
              className="flex w-full items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm font-semibold transition-colors hover:bg-blue-500/10"
            >
              <span>Take a full GMAT practice test</span>
              <ArrowRight className="h-4 w-4 text-blue-500" />
            </Link>
          )}

          {accuracy >= 65 && accuracy < 80 && topWeak && (
            <Link
              href={`/learning/${topWeak.topicSlug}/${topWeak.slug}/quiz`}
              className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold transition-colors hover:bg-primary/10"
            >
              <span>Practice: {topWeak.name}</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
