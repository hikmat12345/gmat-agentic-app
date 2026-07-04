"use client";

export function StatsCards({
  targetScore,
  sessionsCount,
}: {
  targetScore: number | null;
  sessionsCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border bg-card p-5">
        <p className="text-3xl font-bold tabular-nums">
          {targetScore ?? "\u2014"}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Target Score
        </p>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <p className="text-3xl font-bold tabular-nums">{sessionsCount}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sessions
        </p>
      </div>
    </div>
  );
}
