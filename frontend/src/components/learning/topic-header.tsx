"use client";

import { Clock, Target, BarChart2 } from "lucide-react";
import { getTopicIcon } from "@/lib/topic-icons";
import { QuestionTypeTag, sectionToQuestionTypes } from "@/components/learning/question-type-tag";

type TopicHeaderProps = {
  slug: string;
  name: string;
  overview: string;
  estimatedTotalMinutes: number;
  subject: string;
  satRelevance:  { percentageOfTest: number; description: string } | null;
  gmatRelevance?: { percentageOfTest: number; description: string } | null;
  difficultyDistribution: { easy: number; medium: number; hard: number };
};

const SUBJECT_GRADIENTS: Record<string, { from: string; to: string; icon: string }> = {
  verbal:          { from: "#1d4ed8", to: "#0e7490", icon: "#60a5fa" },
  quantitative:    { from: "#7c3aed", to: "#4338ca", icon: "#a78bfa" },
  data_insights:   { from: "#c2410c", to: "#d97706", icon: "#fb923c" },
  math:            { from: "#7c3aed", to: "#4338ca", icon: "#a78bfa" },
  reading_writing: { from: "#0e7490", to: "#0369a1", icon: "#38bdf8" },
};

function getGradient(subject: string) {
  return SUBJECT_GRADIENTS[subject] ?? { from: "#1e3a5f", to: "#1e293b", icon: "#94a3b8" };
}

export function TopicHeader({ topic }: { topic: TopicHeaderProps }) {
  const Icon = getTopicIcon(topic.slug);
  const g = getGradient(topic.subject);
  const total =
    topic.difficultyDistribution.easy +
    topic.difficultyDistribution.medium +
    topic.difficultyDistribution.hard;
  const relevance = topic.gmatRelevance ?? topic.satRelevance;
  const questionTypes = sectionToQuestionTypes(topic.subject);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      {/* Title row */}
      <div className="flex items-center gap-4">
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${g.from}55, ${g.to}33)` }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(circle at 30% 30%, ${g.from}88, transparent 70%)` }}
          />
          <Icon className="relative h-7 w-7" style={{ color: g.icon }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{topic.name}</h1>
          {questionTypes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {questionTypes.map((t) => (
                <QuestionTypeTag key={t} type={t} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">{topic.overview}</p>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{topic.estimatedTotalMinutes} min total</span>
        </div>
        {relevance && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{relevance.percentageOfTest}% of test</span>
          </div>
        )}
        {total > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart2 className="h-4 w-4" />
            <div className="flex h-2 w-28 overflow-hidden rounded-full bg-muted">
              <div className="bg-green-500 transition-all" style={{ width: `${(topic.difficultyDistribution.easy / total) * 100}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${(topic.difficultyDistribution.medium / total) * 100}%` }} />
              <div className="bg-red-500 transition-all"  style={{ width: `${(topic.difficultyDistribution.hard / total) * 100}%` }} />
            </div>
            <span className="text-xs">difficulty mix</span>
          </div>
        )}
      </div>
    </div>
  );
}
