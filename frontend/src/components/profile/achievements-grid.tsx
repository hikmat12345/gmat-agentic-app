"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

type AchievementItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
};

type Props = {
  className?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  streak: "Streaks",
  quest: "Quests",
  score: "Score Milestones",
  mastery: "Mastery",
  social: "Social",
};

export function AchievementsGrid({ className }: Props) {
  const { data, isLoading, isError } = useQuery<{ achievements: AchievementItem[] }>({
    queryKey: ["achievements"],
    queryFn: () => fetch("/api/achievements").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    staleTime: 5 * 60_000,
  });

  useEffect(() => { if (isError) toast.error("Failed to load achievements"); }, [isError]);

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const achievements = data?.achievements ?? [];
  const grouped = Object.entries(CATEGORY_LABELS).map(([cat, label]) => ({
    label,
    items: achievements.filter((a) => a.category === cat),
  }));

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Achievements</h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      {grouped.map(({ label, items }) => (
        <div key={label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {items.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                  a.unlocked
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/50 bg-muted/30 opacity-50 grayscale"
                )}
              >
                <span className="text-2xl" role="img" aria-label={a.name}>{a.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold leading-tight">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{a.description}</p>
                </div>
                {a.unlocked && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
