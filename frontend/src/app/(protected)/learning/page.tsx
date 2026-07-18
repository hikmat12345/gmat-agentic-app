"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getTopicIcon } from "@/lib/topic-icons";
import { cn } from "@/lib/utils";
import { ScoreBandRail, SCORE_BANDS, type ScoreBand } from "@/components/learning/score-band-rail";
import { QuestionTypeTag, type QuestionType } from "@/components/learning/question-type-tag";
import { ArrowRight, BookOpen, ChevronRight, Clock, Layers, Lock, CheckCircle2, Star, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

type RecentSubtopic = {
  subtopicId: string;
  subtopicName: string;
  subtopicSlug: string;
  topicName: string;
  topicSlug: string;
  lastSeenAt: string;
};

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
  completedSubtopics: number;
  startedSubtopics: number;
};

const SUBJECTS = [
  { key: "all",           label: "All" },
  { key: "verbal",        label: "Verbal" },
  { key: "quantitative",  label: "Quantitative" },
  { key: "data_insights", label: "Data Insights" },
] as const;

type Phase = { label: string; description: string; scoreRange: string; color: string; bg: string };

const PHASES: Phase[] = [
  {
    label: "Foundation",
    description: "Core concepts that appear on every GMAT exam. Master these first.",
    scoreRange: "Up to 605",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/8 border-blue-500/20",
  },
  {
    label: "Practice",
    description: "Intermediate skills that separate 600 from 650+ scores.",
    scoreRange: "605 – 654",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/8 border-violet-500/20",
  },
  {
    label: "Mastery",
    description: "Advanced question types that unlock 700+ performance.",
    scoreRange: "655 – 805",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/8 border-amber-500/20",
  },
];

function getPhaseIndex(orderIndex: number): number {
  if (orderIndex <= 2) return 0; // Foundation
  if (orderIndex <= 5) return 1; // Practice
  return 2;                       // Mastery
}

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

function QuestRow({ topic, index, showNextBadge, locked }: { topic: Topic; index: number; showNextBadge: boolean; locked: boolean }) {
  const Icon = getTopicIcon(topic.slug);
  const types = getTopicQuestionTypes(topic);
  const band = getTopicBand(topic);
  const style = getSubjectStyle(topic.subject);
  const isNext = showNextBadge && !locked;

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
          {!locked && topic.completedSubtopics > 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-500/80">
              <CheckCircle2 className="h-3 w-3" />
              {topic.completedSubtopics}/{topic.subtopics.length} done
            </div>
          )}
          {!locked && topic.completedSubtopics === 0 && topic.startedSubtopics > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500/80">
              <div className="h-2 w-2 rounded-full bg-amber-500/70" />
              In progress
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
            <div className="hidden md:flex flex-col items-end gap-1.5">
              {topic.completedSubtopics > 0 && topic.subtopics.length > 0 && (
                <div className="w-20 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(topic.completedSubtopics / topic.subtopics.length) * 100}%` }}
                  />
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                topic.completedSubtopics === topic.subtopics.length && topic.subtopics.length > 0
                  ? "bg-emerald-500 text-white group-hover:bg-emerald-600"
                  : "bg-primary text-primary-foreground group-hover:bg-primary/90 group-hover:shadow-md"
              )}>
                {topic.completedSubtopics === topic.subtopics.length && topic.subtopics.length > 0 ? (
                  <><CheckCircle2 className="h-4 w-4" /> Done</>
                ) : topic.startedSubtopics > 0 ? (
                  <>Continue <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>Start <ChevronRight className="h-4 w-4" /></>
                )}
              </div>
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

// ── Phase header divider ───────────────────────────────────────────────────

function PhaseHeader({ phase, isFirst }: { phase: Phase; isFirst: boolean }) {
  return (
    <div className={cn(
      "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 border-b border-border/60",
      phase.bg,
      !isFirst && "border-t border-border/60"
    )}>
      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", phase.color, "ring-1 ring-current/30")}>
        {phase.label.slice(0, 1)}
      </div>
      <div className="min-w-0">
        <span className={cn("text-xs font-bold uppercase tracking-widest", phase.color)}>
          {phase.label}
        </span>
        <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
          — {phase.description}
        </span>
      </div>
      <span className={cn("text-[11px] font-semibold tabular-nums", phase.color)}>
        {phase.scoreRange}
      </span>
    </div>
  );
}

// ── Milestone row between phases ──────────────────────────────────────────

const PHASE_MILESTONES = [
  { from: "Foundation", to: "Practice",  pts: "+40",  score: "605+", icon: "🎯" },
  { from: "Practice",   to: "Mastery",   pts: "+60",  score: "655+", icon: "⭐" },
];

function MilestoneRow({ phaseLabel, allDone, phaseTopics }: { phaseLabel: string; allDone: boolean; phaseTopics: Topic[] }) {
  const milestone = PHASE_MILESTONES.find(m => m.from === phaseLabel);
  if (!milestone) return null;

  const done = phaseTopics.filter(t => t.completedSubtopics === t.subtopics.length && t.subtopics.length > 0).length;
  const total = phaseTopics.length;

  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-3.5 border-y border-dashed",
      allDone
        ? "bg-emerald-500/5 border-emerald-500/25"
        : "bg-muted/30 border-border/50"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
        allDone ? "bg-emerald-500/15" : "bg-muted"
      )}>
        {allDone ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="text-base">{milestone.icon}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-semibold", allDone ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
          {allDone
            ? `${phaseLabel} complete — ${milestone.pts} pts estimate unlocked`
            : `Complete ${phaseLabel} to unlock ${milestone.to} (${milestone.score} target) — est. ${milestone.pts} pts`}
        </p>
        {!allDone && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 max-w-[120px] overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary/60 transition-all"
                style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{done}/{total}</span>
          </div>
        )}
      </div>
      {allDone && <Star className="h-4 w-4 text-emerald-500 shrink-0" />}
    </div>
  );
}

// ── Stuck-area recommendation banner ─────────────────────────────────────

type StuckPoint = { subtopicId: string; subtopicName: string; subtopicSlug: string; topicName: string; topicSlug: string; metrics: { accuracy: number } };

function StuckRecommendationBanner({ visible }: { visible: boolean }) {
  const { data } = useQuery<{ stuckPoints: StuckPoint[]; summary: { totalSubtopicsAttempted: number; stuckCount: number } }>({
    queryKey: ["analytics", "stuck-points"],
    queryFn: () => fetch("/api/analytics/stuck-points").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    staleTime: 5 * 60_000,
    enabled: visible,
  });

  const top = data?.stuckPoints?.[0];
  if (!top || !data?.summary?.totalSubtopicsAttempted) return null;

  return (
    <Link
      href={`/learning/${top.topicSlug}/${top.subtopicSlug}/quiz`}
      className="mb-4 flex items-center gap-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-3.5 transition-colors hover:bg-amber-500/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <Zap className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Athena recommends: {top.subtopicName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {top.topicName} · {top.metrics.accuracy}% accuracy — practice this to move your score
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-amber-500 shrink-0" />
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [activeBand, setActiveBand] = useState<ScoreBand>(null);
  const { isPremium } = useSubscription();

  const { data, isLoading: loading, isError } = useQuery<{ topics: Topic[]; recentSubtopic: RecentSubtopic | null }>({
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
  const recentSubtopic = data?.recentSubtopic ?? null;
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

  const hasAnyActivity = topics.some((t) => t.startedSubtopics > 0 || t.completedSubtopics > 0);
  const hasNoActivity = topics.length > 0 && activeSubject === "all" && !activeBand && !hasAnyActivity;

  // First unlocked topic the user hasn't started, or first still-incomplete unlocked topic
  const isUnlocked = (t: Topic) => t.isFree || isPremium;
  const nextTopicId =
    filteredTopics.find(t => isUnlocked(t) && t.startedSubtopics === 0)?.id ??
    filteredTopics.find(t => isUnlocked(t) && t.completedSubtopics < t.subtopics.length)?.id;

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

      {/* ── Adaptive focus banner — from stuck-points analytics ──────── */}
      {hasAnyActivity && activeSubject === "all" && !activeBand && (
        <StuckRecommendationBanner visible={hasAnyActivity} />
      )}

      {/* ── "Continue where you left off" banner ─────────────────── */}
      {recentSubtopic && activeSubject === "all" && !activeBand && (
        <Link
          href={`/learning/${recentSubtopic.topicSlug}/${recentSubtopic.subtopicSlug}`}
          className="mb-4 flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 transition-colors hover:bg-emerald-500/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-lg">
            ▶️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Continue where you left off</p>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {recentSubtopic.subtopicName} · {recentSubtopic.topicName}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />
        </Link>
      )}

      {/* ── "Start Here" banner (shown when no subject/band filter active) ── */}
      {hasNoActivity && !recentSubtopic && (
        <div className="mb-6 flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Start at Foundation</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The roadmap is organised into three phases. Begin with Foundation topics — Critical Reasoning and Reading Comprehension appear on every GMAT exam and form the base of your Verbal score.
            </p>
          </div>
          <Link
            href={topics[0] ? `/learning/${topics[0].slug}` : "/learning"}
            className="shrink-0 flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Begin <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

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

      {/* ── Quest table with phase dividers ──────────────────── */}
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

          {/* Rows with phase dividers + milestones when no filter is active */}
          {filteredTopics.map((topic, i) => {
            const showPhaseHeader =
              !activeBand &&
              activeSubject === "all" &&
              (i === 0 || getPhaseIndex(topic.orderIndex) !== getPhaseIndex(filteredTopics[i - 1].orderIndex));
            const phaseIdx = getPhaseIndex(topic.orderIndex);

            // Milestone: show BEFORE the new phase header (i.e. after the last topic of the previous phase)
            const prevPhaseIdx = i > 0 ? getPhaseIndex(filteredTopics[i - 1].orderIndex) : -1;
            const showMilestone =
              !activeBand && activeSubject === "all" && i > 0 && phaseIdx !== prevPhaseIdx;

            const prevPhaseTopics = showMilestone
              ? filteredTopics.filter(t => getPhaseIndex(t.orderIndex) === prevPhaseIdx)
              : [];
            const prevPhaseAllDone =
              prevPhaseTopics.length > 0 &&
              prevPhaseTopics.every(t => t.completedSubtopics === t.subtopics.length && t.subtopics.length > 0);

            return (
              <div key={topic.id}>
                {showMilestone && (
                  <MilestoneRow
                    phaseLabel={PHASES[prevPhaseIdx].label}
                    allDone={prevPhaseAllDone}
                    phaseTopics={prevPhaseTopics}
                  />
                )}
                {showPhaseHeader && (
                  <PhaseHeader phase={PHASES[phaseIdx]} isFirst={i === 0} />
                )}
                <QuestRow
                  topic={topic}
                  index={i}
                  showNextBadge={topic.id === nextTopicId}
                  locked={!topic.isFree && !isPremium}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No topics available yet for this section.
        </div>
      )}
    </div>
  );
}
