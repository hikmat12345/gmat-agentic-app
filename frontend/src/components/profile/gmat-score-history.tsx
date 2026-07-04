"use client";

import Link from "next/link";

type GmatAttempt = {
  id: string;
  totalScore: number | null;
  verbalScaledScore: number | null;
  quantitativeScaledScore: number | null;
  dataInsightsScaledScore: number | null;
  completedAt: string | null;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 700) return "text-green-500";
  if (score >= 565) return "text-amber-500";
  return "text-red-500";
}

export function GmatScoreHistory({
  latestAttempt,
}: {
  latestAttempt: GmatAttempt | null;
}) {
  if (!latestAttempt) {
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          GMAT Score
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          No test scores yet.{" "}
          <Link href="/full-gmat" className="underline hover:text-foreground">
            Take a practice test
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        GMAT Score
      </h3>
      <div className="mt-4">
        <span className={`text-3xl font-bold ${scoreColor(latestAttempt.totalScore)}`}>
          {latestAttempt.totalScore ?? "—"}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">/ 805</span>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          <span>V: {latestAttempt.verbalScaledScore ?? "—"}</span>
          <span>Q: {latestAttempt.quantitativeScaledScore ?? "—"}</span>
          <span>DI: {latestAttempt.dataInsightsScaledScore ?? "—"}</span>
        </div>
        {latestAttempt.completedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(latestAttempt.completedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
