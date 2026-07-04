"use client";

import { motion } from "framer-motion";

const BANDS = [
  { label: "sub-505", max: 504,  color: "oklch(0.65 0.05 260)" },
  { label: "505–555", max: 554,  color: "oklch(0.60 0.12 240)" },
  { label: "555–605", max: 604,  color: "oklch(0.65 0.14 175)" },
  { label: "605–655", max: 654,  color: "oklch(0.68 0.16 130)" },
  { label: "655–705", max: 704,  color: "oklch(0.72 0.17 80)"  },
  { label: "705–805", max: 805,  color: "oklch(0.75 0.16 60)"  },
];

const GMAT_MIN = 205;
const GMAT_MAX = 805;
const RANGE = GMAT_MAX - GMAT_MIN;

function scorePct(s: number) {
  return Math.min(Math.max(((s - GMAT_MIN) / RANGE) * 100, 0), 100);
}

export function CompositeScore({
  score,
  targetScore,
}: {
  score: number;
  targetScore: number;
}) {
  const pointsToTarget = Math.max(targetScore - score, 0);
  const pointsToPerfect = Math.max(GMAT_MAX - score, 0);
  const currentBand = BANDS.find((b) => score <= b.max) ?? BANDS[BANDS.length - 1];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Composite Score</p>
          <span className="text-5xl font-bold tabular-nums tracking-tight">{score}</span>
          <span
            className="ml-2 rounded px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: `${currentBand.color}22`,
              color: currentBand.color,
            }}
          >
            {currentBand.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground">Target</p>
          <span className="text-3xl font-bold tabular-nums tracking-tight">{targetScore}</span>
        </div>
      </div>

      {/* Gradient score band bar */}
      <div className="mt-5 space-y-1.5">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          {/* Gradient segments */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${BANDS.map((b) => b.color).join(", ")})`,
            }}
          />
          {/* Dim portion above current score */}
          <div
            className="absolute inset-y-0 right-0 bg-background/70"
            style={{ left: `${scorePct(score)}%` }}
          />
        </div>

        {/* Pins */}
        <div className="relative h-4 w-full">
          {/* Current score pin */}
          <motion.div
            className="absolute -translate-x-1/2"
            style={{ left: `${scorePct(score)}%` }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex flex-col items-center">
              <div className="h-2 w-0.5 bg-foreground" />
              <span className="text-[10px] font-bold tabular-nums">{score}</span>
            </div>
          </motion.div>

          {/* Target pin */}
          <div
            className="absolute -translate-x-1/2 opacity-50"
            style={{ left: `${scorePct(targetScore)}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-2 w-0.5 bg-foreground" />
              <span className="text-[10px] tabular-nums">{targetScore}</span>
            </div>
          </div>
        </div>

        {/* Band labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>205</span>
          <span>505</span>
          <span>605</span>
          <span>705</span>
          <span>805</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {pointsToTarget > 0
          ? `${pointsToTarget} points to target`
          : "Target reached!"}{" "}
        · {pointsToPerfect} to perfect
      </p>
    </div>
  );
}
