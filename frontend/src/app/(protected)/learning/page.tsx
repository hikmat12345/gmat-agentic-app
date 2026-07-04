"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getTopicIcon } from "@/lib/topic-icons";
import { cn } from "@/lib/utils";
import { ScoreBandRail, SCORE_BANDS, type ScoreBand } from "@/components/learning/score-band-rail";
import { QuestionTypeTag, type QuestionType } from "@/components/learning/question-type-tag";
import { ChevronRight, BookOpen, Clock, Layers, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

type Topic = {
  id: string;
  slug: string;
  name: string;
  overview: string;
  estimatedTotalMinutes: number;
  gmatRelevance: { percentageOfTest: number } | null;
  satRelevance: { percentageOfTest: number } | null;
  subtopics: { id: string; name: string }[];
  subject: string;
  orderIndex: number;
  isFree: boolean;
};

const SUBJECTS = [
  { key: "all",           label: "All" },
  { key: "verbal",        label: "Verbal" },
  { key: "quantitative",  label: "Quantitative" },
  { key: "data_insights", label: "Data Insights" },
  { key: "math",          label: "Math" },
  { key: "reading_writing", label: "Reading & Writing" },
] as const;

/** Derive question type tags from topic name / subject */
function getTopicQuestionTypes(topic: Topic): QuestionType[] {
  const n = topic.name.toLowerCase();
  if (n.includes("problem solving"))   return ["problem_solving"];
  if (n.includes("data sufficiency"))  return ["data_sufficiency"];
  if (n.includes("critical reasoning")) return ["critical_reasoning"];
  if (n.includes("reading comprehension")) return ["reading_comprehension"];
  if (n.includes("multi-source") || n.includes("multi source")) return ["multi_source_reasoning"];
  if (n.includes("table analysis"))    return ["table_analysis"];
  if (n.includes("graphics interpretation")) return ["graphics_interpretation"];
  if (n.includes("two-part") || n.includes("two part")) return ["two_part_analysis"];
  const s = topic.subject;
  if (s === "verbal")        return ["critical_reasoning", "reading_comprehension"];
  if (s === "quantitative")  return ["problem_solving", "data_sufficiency"];
  if (s === "data_insights") return ["multi_source_reasoning", "table_analysis"];
  return [];
}

/** Map topic order to a GMAT score band target */
function getTopicBand(topic: Topic): string {
  const order = topic.orderIndex ?? 0;
  const idx = Math.min(Math.floor(order / 4), SCORE_BANDS.length - 1);
  return SCORE_BANDS[idx].label;
}

/** Subject-based thumbnail gradient + accent */
const SUBJECT_STYLES: Record<string, { from: string; to: string; icon: string }> = {
  verbal:          { from: "#1d4ed8", to: "#0e7490", icon: "#60a5fa" },
  quantitative:    { from: "#7c3aed", to: "#4338ca", icon: "#a78bfa" },
  data_insights:   { from: "#c2410c", to: "#d97706", icon: "#fb923c" },
  math:            { from: "#7c3aed", to: "#4338ca", icon: "#a78bfa" },
  reading_writing: { from: "#0e7490", to: "#0369a1", icon: "#38bdf8" },
};

function getSubjectStyle(subject: string) {
  return SUBJECT_STYLES[subject] ?? { from: "#1e3a5f", to: "#1e293b", icon: "#94a3b8" };
}

// ── Quest row ──────────────────────────────────────────────────────────────

function QuestRow({ topic, index, isFirst, locked }: { topic: Topic; index: number; isFirst: boolean; locked: boolean }) {
  const Icon = getTopicIcon(topic.slug);
  const types = getTopicQuestionTypes(topic);
  const band = getTopicBand(topic);
  const style = getSubjectStyle(topic.subject);
  const isNext = isFirst && !locked;

  const rowContent = (
    <>
      {/* ── Index (desktop only) ── */}
      <div className={cn(
        "hidden md:flex h-full w-16 shrink-0 items-center justify-center border-r border-border/30 py-5 text-xs font-mono",
        locked ? "text-muted-foreground/30" : "text-muted-foreground/50"
      )}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* ── Thumbnail ── */}
      <div className="flex shrink-0 items-center justify-center p-4 md:p-5">
        <div
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden",
            locked && "opacity-40"
          )}
          style={{ background: `linear-gradient(135deg, ${style.from}55, ${style.to}33)` }}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-40"
            style={{ background: `radial-gradient(circle at 30% 30%, ${style.from}88, transparent 70%)` }}
          />
          <Icon className="relative h-7 w-7" style={{ color: style.icon }} />
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* ── Quest title + description ── */}
      <div className="flex min-w-0 flex-col gap-1 py-4 pr-4 md:border-r md:border-border/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(
            "text-base font-bold leading-snug md:text-[17px]",
            locked && "text-muted-foreground/60"
          )}>
            {topic.name}
          </span>
          {isNext && (
            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Next
            </span>
          )}
          {locked && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Premium
            </span>
          )}
        </div>
        <p className={cn(
          "line-clamp-2 text-sm leading-relaxed",
          locked ? "text-muted-foreground/40" : "text-muted-foreground"
        )}>
          {topic.overview || `${topic.subtopics.length} subtopics · ${topic.estimatedTotalMinutes} min`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <Layers className="h-3 w-3" />
            {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? "s" : ""}
          </div>
          {topic.estimatedTotalMinutes > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
              <Clock className="h-3 w-3" />
              {topic.estimatedTotalMinutes} min
            </div>
          )}
        </div>
      </div>

      {/* ── Classification (desktop only) ── */}
      <div className={cn(
        "hidden md:flex flex-col gap-2 border-r border-border/30 px-5 py-4",
        locked && "opacity-40"
      )}>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <QuestionTypeTag key={t} type={t} />
          ))}
        </div>
        <span
          className="w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: `${SCORE_BANDS.find(b => b.label === band)?.color ?? "#64748b"}20`,
            color: SCORE_BANDS.find(b => b.label === band)?.color ?? "#64748b",
          }}
        >
          {band}
        </span>
      </div>

      {/* ── Action ── */}
      <div className="flex shrink-0 items-center justify-end px-4 md:justify-center md:px-5">
        {locked ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Upgrade</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-end gap-2 md:hidden">
              <div className="flex flex-wrap gap-1 justify-end">
                {types.slice(0, 2).map((t) => (
                  <QuestionTypeTag key={t} type={t} />
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                Start <ChevronRight className="h-4 w-4" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all group-hover:bg-primary/90 group-hover:shadow-md">
              Start <ChevronRight className="h-4 w-4" />
            </div>
          </>
        )}
      </div>
    </>
  );

  if (locked) {
    return (
      <Link
        href="/billing"
        className={cn(
          "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[64px_auto_1fr_200px_140px] items-center gap-0",
          "border-b border-border/40 bg-card/60 transition-colors hover:bg-muted/20",
          "last:border-b-0"
        )}
      >
        {rowContent}
      </Link>
    );
  }

  return (
    <Link
      href={`/learning/${topic.slug}`}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[64px_auto_1fr_200px_140px] items-center gap-0",
        "border-b border-border/40 bg-card transition-colors hover:bg-muted/40",
        "last:border-b-0"
      )}
    >
      {rowContent}
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [activeBand, setActiveBand] = useState<ScoreBand>(null);
  const { isPremium } = useSubscription();

  const { data, isLoading: loading, isError } = useQuery<{ topics: Topic[] }>({
    queryKey: ["learning"],
    queryFn: () =>
      fetch("/api/learning").then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load learning data");
  }, [isError]);

  const topics = data?.topics ?? [];
  const availableSubjects = Array.from(new Set(topics.map((t) => t.subject)));
  const visibleSubjects = SUBJECTS.filter(
    (s) => s.key === "all" || availableSubjects.includes(s.key)
  );

  const filteredTopics = topics.filter((t) => {
    const subjectMatch = activeSubject === "all" || t.subject === activeSubject;
    if (!activeBand) return subjectMatch;
    return subjectMatch && getTopicBand(t) === activeBand;
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-20 animate-pulse rounded-xl bg-muted" />
        <div className="overflow-hidden rounded-xl border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse border-b border-border/40 bg-muted last:border-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Study Plan</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-10">
          Follow the guided roadmap to master every GMAT topic
        </p>
      </div>

      {/* ── Score band roadmap ────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
        <ScoreBandRail
          currentScore={null}
          activeBand={activeBand}
          onBandClick={setActiveBand}
        />
      </div>

      {/* ── Subject filter tabs ───────────────────────────────── */}
      {visibleSubjects.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {visibleSubjects.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSubject(s.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeSubject === s.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Quest table ───────────────────────────────────────── */}
      {filteredTopics.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/60">
          {/* Column headers — desktop only */}
          <div className="hidden md:grid grid-cols-[64px_auto_1fr_200px_140px] border-b border-border/60 bg-muted/50 px-0 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center justify-center">#</div>
            <div className="pl-5">Thumbnail</div>
            <div>Quest</div>
            <div className="px-5">Classification</div>
            <div className="text-center">Action</div>
          </div>

          {/* Rows */}
          {filteredTopics.map((topic, i) => (
            <QuestRow
              key={topic.id}
              topic={topic}
              index={i}
              isFirst={i === 0}
              locked={!topic.isFree && !isPremium}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No topics available yet for this section.
        </div>
      )}
    </div>
  );
}
