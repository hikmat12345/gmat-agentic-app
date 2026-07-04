"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { TopicHeader } from "@/components/learning/topic-header";
import { SubtopicCard } from "@/components/learning/subtopic-card";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { useSubscription } from "@/hooks/use-subscription";

type Subtopic = {
  id: string;
  slug: string;
  name: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
};

type Topic = {
  id: string;
  slug: string;
  name: string;
  subject: string;
  overview: string;
  estimatedTotalMinutes: number;
  satRelevance: { percentageOfTest: number; description: string } | null;
  gmatRelevance?: { percentageOfTest: number; description: string } | null;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  subtopics: Subtopic[];
  isFree?: boolean;
};

export default function TopicPage() {
  const params = useParams<{ topicSlug: string }>();
  const { isPremium, isLoading: subLoading } = useSubscription();

  const { data, isLoading, isError } = useQuery<{ topics: Topic[] }>({
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
  const activeTopic = topics.find((t) => t.slug === params.topicSlug) ?? topics[0];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
          <div className="overflow-hidden rounded-xl border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse border-b border-border/40 bg-muted last:border-b-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeTopic) return null;

  // Gate locked topics for non-premium users
  if (!subLoading && !isLoading && activeTopic.isFree === false && !isPremium) {
    return (
      <FeatureGate
        feature={activeTopic.name}
        description="Unlock all GMAT topics with Athena Premium."
      >
        <div className="mx-auto max-w-7xl p-6 opacity-30 pointer-events-none select-none">
          <h1 className="text-2xl font-bold">{activeTopic.name}</h1>
          <p className="mt-2 text-muted-foreground">{activeTopic.overview}</p>
        </div>
      </FeatureGate>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Breadcrumb */}
      <Link
        href="/learning"
        className="mb-5 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Study Plan
      </Link>

      <div className="space-y-5">
        <TopicHeader topic={activeTopic} />

        {/* Subtopics list */}
        {activeTopic.subtopics.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {/* Header row */}
            <div className="border-b border-border/60 bg-muted/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Subtopics — {activeTopic.subtopics.length} lesson{activeTopic.subtopics.length !== 1 ? "s" : ""}
            </div>
            {activeTopic.subtopics.map((st, i) => (
              <SubtopicCard
                key={st.id}
                subtopic={st}
                topicSlug={activeTopic.slug}
                index={i}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No subtopics available yet for this topic.
          </p>
        )}
      </div>
    </div>
  );
}
