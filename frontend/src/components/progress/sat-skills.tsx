"use client";

import { cn } from "@/lib/utils";

type TopicData = {
  name: string;
  slug: string;
  subject: string;
  total: number;
  correct: number;
  accuracy: number;
};

const SECTION_ORDER = ["verbal", "quantitative", "data_insights", "math", "reading_writing"];

const SECTION_LABELS: Record<string, string> = {
  verbal: "Verbal",
  quantitative: "Quantitative",
  data_insights: "Data Insights",
  math: "Math",
  reading_writing: "Reading & Writing",
};

function groupBySection(topics: TopicData[]) {
  const groups: Record<string, TopicData[]> = {};
  for (const t of topics) {
    const section = t.subject || "other";
    if (!groups[section]) groups[section] = [];
    groups[section].push(t);
  }
  return groups;
}

export function SatSkills({ topics }: { topics: TopicData[] }) {
  const groups = groupBySection(topics);
  const sectionKeys = SECTION_ORDER.filter((k) => groups[k]?.length);
  const otherKeys = Object.keys(groups).filter((k) => !SECTION_ORDER.includes(k));
  const allKeys = [...sectionKeys, ...otherKeys];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h2 className="mb-3 text-xs font-semibold text-muted-foreground">GMAT Skills</h2>
      <div className="space-y-4">
        {allKeys.map((section) => (
          <div key={section}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
              {SECTION_LABELS[section] ?? section}
            </p>
            <div className="space-y-2">
              {groups[section].map((topic) => {
                const pct = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
                const hasData = topic.total > 0;
                return (
                  <div key={topic.slug}>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          "font-medium",
                          !hasData && "text-muted-foreground"
                        )}
                      >
                        {topic.name}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {hasData ? `${pct}%` : "—"}
                      </span>
                    </div>
                    {hasData && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct >= 80
                              ? "bg-emerald-500"
                              : pct >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="py-2 text-xs text-muted-foreground">
            Complete quizzes to see your skill breakdown.
          </p>
        )}
      </div>
    </div>
  );
}
