"use client";

import { cn } from "@/lib/utils";

type QuestionTypePerf = {
  type: string;
  label: string;
  total: number;
  correct: number;
  accuracy: number;
};

type Props = {
  data: QuestionTypePerf[];
};

const TYPE_COLORS: Record<string, string> = {
  critical_reasoning: "bg-violet-500/80",
  reading_comprehension: "bg-blue-500/80",
  problem_solving: "bg-emerald-500/80",
  data_sufficiency: "bg-orange-500/80",
  multi_source_reasoning: "bg-cyan-500/80",
  table_analysis: "bg-pink-500/80",
  graphics_interpretation: "bg-yellow-500/80",
  two_part_analysis: "bg-red-500/80",
};

const TYPE_BG: Record<string, string> = {
  critical_reasoning: "bg-violet-500/10",
  reading_comprehension: "bg-blue-500/10",
  problem_solving: "bg-emerald-500/10",
  data_sufficiency: "bg-orange-500/10",
  multi_source_reasoning: "bg-cyan-500/10",
  table_analysis: "bg-pink-500/10",
  graphics_interpretation: "bg-yellow-500/10",
  two_part_analysis: "bg-red-500/10",
};

function AccuracyBar({ accuracy, type }: { accuracy: number; type: string }) {
  const color = TYPE_COLORS[type] ?? "bg-primary/70";
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("absolute inset-y-0 left-0 rounded-full transition-all", color)}
        style={{ width: `${Math.max(4, accuracy)}%` }}
      />
    </div>
  );
}

function strengthLabel(accuracy: number): { label: string; cls: string } {
  if (accuracy >= 80) return { label: "Strong", cls: "text-emerald-600 dark:text-emerald-400" };
  if (accuracy >= 60) return { label: "Moderate", cls: "text-yellow-600 dark:text-yellow-400" };
  if (accuracy >= 40) return { label: "Weak", cls: "text-orange-600 dark:text-orange-400" };
  return { label: "Critical", cls: "text-red-600 dark:text-red-400" };
}

export function WeaknessHeatmap({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Complete GMAT quizzes to see your skill breakdown
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-2.5">
      {sorted.map((item) => {
        const { label, cls } = strengthLabel(item.accuracy);
        const bg = TYPE_BG[item.type] ?? "bg-primary/5";
        return (
          <div key={item.type} className={cn("rounded-lg px-3 py-2.5 space-y-1.5", bg)}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.correct}/{item.total} correct
                </span>
                <span className={cn("text-xs font-semibold", cls)}>{label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AccuracyBar accuracy={item.accuracy} type={item.type} />
              <span className="text-xs font-medium tabular-nums w-10 text-right">
                {item.accuracy}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
