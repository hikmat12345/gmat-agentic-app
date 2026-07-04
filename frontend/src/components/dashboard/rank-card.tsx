"use client";

import { motion } from "framer-motion";
import { ArrowRight, Diamond } from "lucide-react";
import Link from "next/link";
import { getRankProgress, RANKS } from "@/lib/ranks";
import { cn } from "@/lib/utils";

export function RankCard({
  totalScore,
  weeklyDelta,
}: {
  totalScore: number;
  weeklyDelta: number;
}) {
  const { current, next, pct, pointsToNext } = getRankProgress(totalScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-card p-6"
    >
      {/* Top row: rank info + VIEW STORY */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            {current.emoji}
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-primary">
              {current.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              GMAT Score Band
            </p>
          </div>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View Profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Score + weekly delta */}
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-5xl font-bold tracking-tight tabular-nums">
          {totalScore}
        </span>
        {weeklyDelta > 0 && (
          <span className="text-sm font-medium text-muted-foreground">
            <Diamond className="mr-0.5 inline h-4 w-4" />
            +{weeklyDelta} this week
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span className="text-foreground">
            {current.emoji} {current.name}
          </span>
          {next && (
            <>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {next.name} {next.emoji}
              </span>
            </>
          )}
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
        </div>
        {next ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {pointsToNext} points to unlock {next.emoji} {next.name}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            {current.emoji} Maximum rank achieved
          </p>
        )}
      </div>

      {/* Score band progress indicators */}
      <div className="mt-5 flex items-center gap-2 border-t pt-4">
        {RANKS.map((rank) => {
          const unlocked = totalScore >= rank.threshold;
          return (
            <div
              key={rank.name}
              className={cn(
                "flex-1 flex flex-col items-center gap-1",
              )}
              title={`${rank.name} — ${rank.range ?? rank.threshold}${unlocked ? " (Reached)" : ""}`}
            >
              <div className={cn(
                "h-1.5 w-full rounded-full",
                unlocked ? "bg-primary" : "bg-muted"
              )} />
              <span className={cn(
                "text-[9px] font-medium hidden sm:block",
                unlocked ? "text-primary" : "text-muted-foreground/40"
              )}>
                {rank.name.slice(0, 3).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
