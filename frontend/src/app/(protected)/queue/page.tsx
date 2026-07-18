"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Target, CheckCircle2, ArrowRight, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import { SectionScores } from "@/components/progress/section-scores";
import { SatSkills } from "@/components/progress/sat-skills";
import { CompositeScore } from "@/components/progress/composite-score";
import { ScoreHistory } from "@/components/progress/score-history";
import { StudyStats } from "@/components/progress/study-stats";
import { TopicMastery } from "@/components/progress/topic-mastery";
import { PracticeTestResults } from "@/components/progress/practice-test-results";
import { JourneyRanks } from "@/components/progress/journey-ranks";
import { ActivityCalendar } from "@/components/progress/activity-calendar";
import { ScoreProjection } from "@/components/progress/score-projection";
import { WeaknessHeatmap } from "@/components/progress/weakness-heatmap";

type SectionData = {
  subject: string;
  total: number;
  correct: number;
  accuracy: number;
  scaledScore: number;
};

type QuestionTypePerf = {
  type: string;
  label: string;
  total: number;
  correct: number;
  accuracy: number;
};

type ProgressData = {
  user: {
    displayName: string | null;
    avatarUrl: string | null;
    targetScore: number | null;
    skillScore: number | null;
  };
  targetScore: number | null;
  activityCalendar: { date: string; count: number }[];
  questionTypePerformance: QuestionTypePerf[];
  scoreHistory: { date: string; score: number }[];
  accuracyByDifficulty: {
    difficulty: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  topicPerformance: {
    name: string;
    slug: string;
    subject: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  recentSessions: {
    id: string;
    subtopicName: string;
    score: number;
    totalQuestions: number;
    timeElapsedSeconds: number;
    date: string;
  }[];
  overallStats: {
    totalQuestions: number;
    accuracy: number;
    totalTimeSeconds: number;
    sessionCount: number;
    avgScore: number;
  };
  sectionScores: {
    verbal: SectionData;
    quantitative: SectionData;
    dataInsights: SectionData;
    compositeScore: number;
  };
  topicMastery: {
    items: {
      name: string;
      mastered: boolean;
      attempted: boolean;
    }[];
    masteredCount: number;
    totalCount: number;
  };
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProgressPage() {
  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery<ProgressData>({
    queryKey: ["progress"],
    queryFn: () =>
      fetch("/api/progress").then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load progress data");
  }, [isError]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-3" />
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const compositeScore = data.sectionScores.compositeScore;
  const targetScore = data.user.targetScore ?? data.targetScore ?? 655;

  const headerStats = [
    { icon: BarChart3,    label: "Composite",  value: compositeScore > 205 ? compositeScore : "—", color: "#60a5fa", bg: "#2563eb" },
    { icon: Target,       label: "Target",     value: targetScore,                                  color: "#2dd4bf", bg: "#0d9488" },
    { icon: CheckCircle2, label: "Accuracy",   value: `${data.overallStats.accuracy}%`,             color: "#a78bfa", bg: "#7c3aed" },
  ];

  return (
    <div className="p-6 pb-16">
      <motion.div
        className="mx-auto max-w-5xl space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* ── Hero header ── */}
        <motion.div variants={staggerItem} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">GMAT Progress</p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight">Your Analytics</h1>
              <p className="text-sm text-muted-foreground">Focus Edition · 205–805 scale</p>
            </div>
            <div className="flex gap-3 sm:ml-auto">
              {headerStats.map(({ icon: Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-border/40 py-3 px-4"
                  style={{ background: `${bg}10` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                  <span className="text-xl font-bold tabular-nums">{value}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section Scores + GMAT Skills row */}
        <motion.div variants={staggerItem}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Section Scores
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div className="lg:col-span-3 gap-6 grid" variants={staggerItem}>
            <SectionScores
              verbal={data.sectionScores.verbal}
              quantitative={data.sectionScores.quantitative}
              dataInsights={data.sectionScores.dataInsights}
            />

            <CompositeScore
              score={compositeScore}
              targetScore={targetScore}
            />
          </motion.div>
          <motion.div className="lg:col-span-2" variants={staggerItem}>
            <SatSkills topics={data.topicPerformance} />
          </motion.div>
        </div>


        {/* Score History + Study Stats / Topic Mastery */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div className="lg:col-span-3" variants={staggerItem}>
            <ScoreHistory data={data.scoreHistory} />
          </motion.div>
          <motion.div className="lg:col-span-2 space-y-6" variants={staggerItem}>
            <StudyStats stats={data.overallStats} />
            <TopicMastery mastery={data.topicMastery} />
          </motion.div>
        </div>

        {/* Analytics row: Score Projection + Weakness Heatmap */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={staggerItem} className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Score Projection</h2>
            <ScoreProjection
              history={data.scoreHistory}
              targetScore={targetScore}
              currentScore={compositeScore > 205 ? compositeScore : null}
            />
          </motion.div>
          <motion.div variants={staggerItem} className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Question Type Breakdown</h2>
            <WeaknessHeatmap data={data.questionTypePerformance ?? []} />
          </motion.div>
        </div>

        {/* Activity Calendar */}
        <motion.div variants={staggerItem} className="mt-6 rounded-xl border bg-card p-5">
          <ActivityCalendar data={data.activityCalendar ?? []} />
        </motion.div>

        {/* Practice Test Results */}
        <motion.div className="mt-6" variants={staggerItem}>
          <PracticeTestResults sessions={data.recentSessions} />
        </motion.div>

        {/* Journey */}
        <motion.div className="mt-6" variants={staggerItem}>
          <JourneyRanks
            currentScore={compositeScore}
          />
        </motion.div>

        {/* Recommended Actions */}
        <RecommendedActions />
      </motion.div>
    </div>
  );
}

// ── Recommended Actions (inline, uses stuck-points) ──────────────────────────

type StuckPoint = {
  subtopicId: string;
  subtopicName: string;
  subtopicSlug: string;
  topicName: string;
  topicSlug: string;
  stuckScore: number;
  metrics: { accuracy: number; totalAttempts: number; microLessonCompleted: boolean };
  recommendation: "micro-lesson" | "practice" | "review-quiz";
};

const ACTION_CONFIG = {
  "micro-lesson": { label: "Watch lesson", Icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  "practice":     { label: "Practice now", Icon: Zap,      color: "text-amber-500", bg: "bg-amber-500/10" },
  "review-quiz":  { label: "Review quiz",  Icon: ArrowRight, color: "text-violet-500", bg: "bg-violet-500/10" },
} as const;

function RecommendedActions() {
  const { data } = useQuery<{ stuckPoints: StuckPoint[]; summary: { totalSubtopicsAttempted: number; stuckCount: number } }>({
    queryKey: ["analytics", "stuck-points"],
    queryFn: () =>
      fetch("/api/analytics/stuck-points").then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    staleTime: 5 * 60_000,
  });

  if (!data || data.summary.totalSubtopicsAttempted === 0 || data.stuckPoints.length === 0) return null;

  const actions = data.stuckPoints.slice(0, 3);

  return (
    <motion.div variants={staggerItem} className="mt-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Recommended Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {actions.map((sp) => {
          const cfg = ACTION_CONFIG[sp.recommendation];
          const href =
            sp.recommendation === "micro-lesson"
              ? `/learning/${sp.topicSlug}/${sp.subtopicSlug}/micro-lesson`
              : `/learning/${sp.topicSlug}/${sp.subtopicSlug}/quiz`;
          return (
            <Link
              key={sp.subtopicId}
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/20"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{sp.subtopicName}</p>
                <p className="text-[11px] text-muted-foreground">{sp.topicName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {sp.metrics.accuracy}% accuracy
                  </span>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${cfg.color}`}>
                    {cfg.label} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
