"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { motion } from "framer-motion";
import {
  Clock,
  Trophy,
  ArrowRight,
  ChevronLeft,
  GripVertical,
  Calculator,
  MessageSquare,
  BarChart3,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import { useFullGmatStatus, useStartFullGmat, useFullGmatHistory } from "@/hooks/use-full-gmat";
import type { GmatSection } from "@/types/full-gmat";
import { GMAT_SECTION_CONFIG, GMAT_SECTIONS } from "@/types/full-gmat";
import { cn } from "@/lib/utils";

const DEFAULT_ORDER: GmatSection[] = ["verbal", "quantitative", "data_insights"];

// ── Section visual config ─────────────────────────────────────────────────

const SECTION_STYLE: Record<
  GmatSection,
  { from: string; to: string; accent: string; icon: React.ElementType; topics: string[] }
> = {
  verbal: {
    from: "#0d9488",
    to: "#0891b2",
    accent: "#2dd4bf",
    icon: MessageSquare,
    topics: ["Critical Reasoning", "Reading Comprehension"],
  },
  quantitative: {
    from: "#2563eb",
    to: "#4f46e5",
    accent: "#60a5fa",
    icon: Calculator,
    topics: ["Problem Solving", "Algebra", "Geometry"],
  },
  data_insights: {
    from: "#7c3aed",
    to: "#9333ea",
    accent: "#a78bfa",
    icon: BarChart3,
    topics: ["Data Sufficiency", "Table Analysis", "Multi-Source", "Graphics"],
  },
};

const SECTION_DESCRIPTIONS: Record<GmatSection, string> = {
  verbal: "Critical Reasoning and Reading Comprehension",
  quantitative: "Problem Solving questions testing mathematical skills",
  data_insights: "Data Sufficiency and analytical reasoning",
};

// ── Section Card ─────────────────────────────────────────────────────────

function SectionCard({
  section,
  onStart,
  isPending,
  actualCount,
}: {
  section: GmatSection;
  onStart: () => void;
  isPending: boolean;
  actualCount?: number;
}) {
  const cfg = GMAT_SECTION_CONFIG[section];
  const sty = SECTION_STYLE[section];
  const Icon = sty.icon;
  const visibleTopics = sty.topics.slice(0, 2);
  const extra = sty.topics.length - 2;
  const questionCount = actualCount ?? cfg.questions;
  const minutes = Math.round((questionCount / cfg.questions) * (cfg.timeLimitSeconds / 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      {/* Header */}
      <div
        className="relative p-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${sty.from}18, ${sty.to}0a)` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg, ${sty.from}44, ${sty.to}33)` }}
          >
            <Icon className="h-6 w-6" style={{ color: sty.accent }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{cfg.label}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground leading-snug">
              {SECTION_DESCRIPTIONS[section]}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 px-4 py-3">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-3">
          <CircleDot className="h-4 w-4" style={{ color: sty.accent }} />
          <span className="text-2xl font-bold tabular-nums">{questionCount}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Questions</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-3">
          <Clock className="h-4 w-4" style={{ color: sty.accent }} />
          <span className="text-2xl font-bold tabular-nums">{minutes}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Minutes</span>
        </div>
      </div>

      {/* Key Topics */}
      <div className="flex-1 px-4 pb-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Key Topics:</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTopics.map((t) => (
            <span
              key={t}
              className="rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{
                background: `${sty.from}22`,
                color: sty.accent,
                border: `1px solid ${sty.from}44`,
              }}
            >
              {t}
            </span>
          ))}
          {extra > 0 && (
            <span className="text-xs text-muted-foreground">+{extra} more</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={onStart}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Starting…" : (
            <>
              Start Section
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Section Order Picker ──────────────────────────────────────────────────

function SectionOrderPicker({
  order,
  onChange,
}: {
  order: GmatSection[];
  onChange: (o: GmatSection[]) => void;
}) {
  function move(from: number, to: number) {
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {order.map((section, idx) => {
        const sty = SECTION_STYLE[section];
        const Icon = sty.icon;
        return (
          <div
            key={section}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${sty.from}22` }}
            >
              <Icon className="h-4 w-4" style={{ color: sty.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{GMAT_SECTION_CONFIG[section].label}</p>
              <p className="text-xs text-muted-foreground">
                {GMAT_SECTION_CONFIG[section].questions} questions · 45 min
              </p>
            </div>
            <div className="flex gap-0.5">
              <button
                onClick={() => idx > 0 && move(idx, idx - 1)}
                disabled={idx === 0}
                className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >▲</button>
              <button
                onClick={() => idx < order.length - 1 && move(idx, idx + 1)}
                disabled={idx === order.length - 1}
                className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >▼</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function FullGmatLandingPage() {
  const router = useRouter();
  const { data: status, isLoading } = useFullGmatStatus();
  const { data: history } = useFullGmatHistory();
  const startMutation = useStartFullGmat();

  const [sectionOrder, setSectionOrder] = useState<GmatSection[]>(DEFAULT_ORDER);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [startingSection, setStartingSection] = useState<GmatSection | null>(null);

  if (isLoading || !status) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  const activeTestId = selectedTestId ?? status.tests[0]?.id ?? null;
  const activeTest = status.tests.find((t) => t.id === activeTestId) ?? status.tests[0];
  const sectionCounts: Partial<Record<GmatSection, number>> = {
    verbal: activeTest?.verbalCount,
    quantitative: activeTest?.quantitativeCount,
    data_insights: activeTest?.dataInsightsCount,
  };

  const handleStart = async (section?: GmatSection) => {
    if (!activeTestId) return;
    if (section) setStartingSection(section);
    try {
      const result = await startMutation.mutateAsync({ testId: activeTestId, sectionOrder });
      router.push(`/full-gmat/${result.attemptId}`);
    } finally {
      setStartingSection(null);
    }
  };

  const handleResume = () => {
    if (status.currentAttempt) router.push(`/full-gmat/${status.currentAttempt.id}`);
  };

  return (
    <FeatureGate
      feature="Full GMAT Practice Test"
      description="64-question timed GMAT Focus Edition simulation with real scoring (205–805). Available on Athena Premium."
    >
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Dashboard
      </button>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">GMAT Focus Edition Practice Test</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {activeTest?.totalQuestions ?? 64} questions across three sections. Timed, adaptive, and scored 205–805 just like the real GMAT.
        </p>
      </motion.div>

      {/* Resume banner */}
      {status.currentAttempt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button
            onClick={handleResume}
            className="w-full rounded-xl border-2 border-primary bg-primary/5 px-6 py-4 text-left transition-colors hover:bg-primary/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Resume In-Progress Test</p>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(status.currentAttempt.startedAt).toLocaleDateString()}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Three section cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {GMAT_SECTIONS.map((section) => (
          <SectionCard
            key={section}
            section={section}
            onStart={() => handleStart(section)}
            isPending={startMutation.isPending && startingSection === section}
            actualCount={sectionCounts[section]}
          />
        ))}
      </div>

      {/* Section order + start */}
      {!status.currentAttempt && status.tests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border bg-card p-5"
        >
          {/* Test selector (if multiple) */}
          {status.tests.length > 1 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Select Test
              </p>
              <div className="flex flex-wrap gap-2">
                {status.tests.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTestId(t.id)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      (selectedTestId ?? status.tests[0].id) === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section order */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Section Order
              </p>
              <button
                onClick={() => setShowOrderPicker((v) => !v)}
                className="text-xs text-primary hover:underline"
              >
                {showOrderPicker ? "Hide" : "Customize"}
              </button>
            </div>
            {showOrderPicker ? (
              <SectionOrderPicker order={sectionOrder} onChange={setSectionOrder} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {sectionOrder.map((s, i) => {
                  const sty = SECTION_STYLE[s];
                  return (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ borderColor: `${sty.from}44`, color: sty.accent }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: sty.accent }} />
                      {i + 1}. {GMAT_SECTION_CONFIG[s].label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50"
          >
            {startMutation.isPending ? "Starting…" : "Start Full Practice Test"}
          </button>
        </motion.div>
      )}

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 rounded-xl border bg-card p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold">How the Adaptive Exam Works</h2>
            <p className="text-sm text-muted-foreground">
              Our adaptive algorithm adjusts question difficulty based on your performance in real-time:
            </p>
          </div>
        </div>
        <ul className="space-y-2.5">
          {[
            "Starts at moderate difficulty level",
            "Increases difficulty when you answer correctly",
            "Decreases difficulty when you answer incorrectly",
            "Quickly finds your optimal challenge level",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Past attempts */}
      {history?.attempts && history.attempts.filter((a) => a.status === "completed").length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Past Attempts
          </h2>
          {history.attempts
            .filter((a) => a.status === "completed")
            .map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between rounded-xl border bg-card px-5 py-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {new Date(attempt.completedAt!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Verbal: {attempt.verbalScaledScore ?? "—"}</span>
                    <span>Quant: {attempt.quantitativeScaledScore ?? "—"}</span>
                    <span>DI: {attempt.dataInsightsScaledScore ?? "—"}</span>
                    <span>{Math.round(attempt.totalTimeSeconds / 60)}min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="text-xl font-bold tabular-nums">{attempt.totalScore ?? "—"}</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
