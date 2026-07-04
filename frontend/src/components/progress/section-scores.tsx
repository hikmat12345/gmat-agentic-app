"use client";

import { motion } from "framer-motion";

type SectionData = {
  subject: string;
  total: number;
  correct: number;
  accuracy: number;
  scaledScore: number;
};

export function SectionScores({
  verbal,
  quantitative,
  dataInsights,
}: {
  verbal: SectionData;
  quantitative: SectionData;
  dataInsights: SectionData;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <SectionCard label="Verbal" score={verbal.scaledScore} hasData={verbal.total > 0} />
      <SectionCard label="Quant" score={quantitative.scaledScore} hasData={quantitative.total > 0} />
      <SectionCard label="Data Insights" score={dataInsights.scaledScore} hasData={dataInsights.total > 0} />
    </div>
  );
}

function SectionCard({
  label,
  score,
  hasData,
}: {
  label: string;
  score: number;
  hasData: boolean;
}) {
  const MIN = 60;
  const MAX = 90;
  const pct = hasData ? Math.min(((score - MIN) / (MAX - MIN)) * 100, 100) : 0;

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums">
          {hasData ? score : "—"}
        </span>
        <span className="text-sm text-muted-foreground">/ 90</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {hasData ? "60–90 scale" : "No data yet"}
      </p>
    </div>
  );
}
