"use client";

import { cn } from "@/lib/utils";

type StreakDay = {
  day: string;
  completed: boolean;
  isPast: boolean;
};

export function QuestStreak({
  streak,
  days,
}: {
  streak: number;
  days: StreakDay[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Study Streak
        </h3>
        <span className="text-sm text-muted-foreground">&middot;</span>
        <span className="text-sm font-bold text-athena-amber">
          Day {streak}
        </span>
        <span className="text-base">🔥</span>
      </div>
      <div className="flex items-center gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn(
                "h-3 w-full rounded-full",
                d.completed
                  ? "bg-athena-amber"
                  : d.isPast
                    ? "bg-muted-foreground/20"
                    : "border border-dashed border-muted-foreground/30 bg-transparent"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                d.completed ? "text-athena-amber" : "text-muted-foreground/60"
              )}
            >
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
