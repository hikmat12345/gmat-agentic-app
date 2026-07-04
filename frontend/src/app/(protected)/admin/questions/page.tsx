"use client";

import { useState } from "react";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Problem = {
  id: string;
  question_text: string;
  options: string[] | null;
  correct_option: number | null;
  difficulty: string | null;
  source: string | null;
  question_type: string | null;
  created_at: string;
};

type QuestionsResponse = {
  problems: Problem[];
  total: number;
  page: number;
  totalPages: number;
};

const SOURCES = ["", "gmat", "full_gmat", "onboarding", "practice"];
const DIFFICULTIES = ["", "easy", "medium", "hard"];
const QUESTION_TYPES = [
  "", "critical_reasoning", "reading_comprehension", "problem_solving",
  "data_sufficiency", "multi_source_reasoning", "table_analysis",
  "graphics_interpretation", "two_part_analysis"
];
const QT_LABELS: Record<string,string> = {
  critical_reasoning: "CR", reading_comprehension: "RC",
  problem_solving: "PS", data_sufficiency: "DS",
  multi_source_reasoning: "MSR", table_analysis: "TA",
  graphics_interpretation: "GI", two_part_analysis: "TPA",
};
const DIFF_COLORS: Record<string,string> = {
  easy: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  medium: "text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20",
  hard: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

export default function AdminQuestionsPage() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const params = new URLSearchParams({ page: String(page) });
  if (source) params.set("source", source);
  if (difficulty) params.set("difficulty", difficulty);
  if (questionType) params.set("question_type", questionType);

  const { data, isLoading } = useQuery<QuestionsResponse>({
    queryKey: ["admin-questions", page, source, difficulty, questionType],
    queryFn: () => fetch(`/api/admin/questions?${params}`).then((r) => r.json()),
    staleTime: 60_000,
  });

  function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
      <select
        value={value}
        onChange={(e) => { onChange(e.target.value); setPage(1); }}
        className="rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">{label}: All</option>
        {options.filter(Boolean).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Question Bank</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? "..."} total problems</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter label="Source" value={source} onChange={setSource} options={SOURCES} />
          <Filter label="Difficulty" value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
          <Filter label="Type" value={questionType} onChange={setQuestionType} options={QUESTION_TYPES} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diff.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data?.problems ?? []).map((p) => (
                <Fragment key={p.id}>
                  <tr
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-xs leading-relaxed">{p.question_text}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {QT_LABELS[p.question_type ?? ""] ?? p.question_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{p.source ?? "—"}</td>
                    <td className="px-3 py-3">
                      {p.difficulty && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", DIFF_COLORS[p.difficulty] ?? "")}>
                          {p.difficulty}
                        </span>
                      )}
                    </td>
                  </tr>
                  {expanded === p.id && (
                    <tr key={p.id + "-exp"} className="bg-muted/20">
                      <td colSpan={4} className="px-4 py-3 text-xs space-y-2">
                        <p className="font-medium text-foreground">{p.question_text}</p>
                        {p.options && (
                          <ol className="list-decimal list-inside space-y-1">
                            {p.options.map((opt, i) => (
                              <li key={i} className={cn("text-muted-foreground", i === p.correct_option ? "font-semibold text-emerald-600 dark:text-emerald-400" : "")}>
                                {opt} {i === p.correct_option ? "✓" : ""}
                              </li>
                            ))}
                          </ol>
                        )}
                        <p className="text-muted-foreground text-[10px]">ID: {p.id}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground text-xs">
            Page {data.page} of {data.totalPages} · {data.total} problems
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
