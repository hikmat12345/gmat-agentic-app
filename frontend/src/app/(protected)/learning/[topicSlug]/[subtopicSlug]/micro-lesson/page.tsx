"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MicroLesson } from "@/components/learning/micro-lesson";
import { WhiteboardSkeleton } from "@/components/whiteboard/whiteboard-skeleton";
import { GenerationProgress } from "@/components/lessons/generation-progress";
import { FeatureGate } from "@/components/subscription/feature-gate";
import { useSubscription } from "@/hooks/use-subscription";
import { useTopicIsFree } from "@/hooks/use-topic-is-free";

export default function MicroLessonPage() {
  const params = useParams<{ topicSlug: string; subtopicSlug: string }>();
  const router = useRouter();
  const { topicSlug, subtopicSlug } = params;
  const { isPremium, isLoading: subLoading } = useSubscription();
  const { isFree, isLoading: freeLoading } = useTopicIsFree(topicSlug);

  // Once we start generating locally, stop polling so the refetch
  // doesn't unmount MicroLesson by switching to the "generating" spinner.
  const generatingLocallyRef = useRef(false);

  const {
    data,
    isLoading: metaLoading,
    isError: metaError,
  } = useQuery({
    queryKey: ["learning", topicSlug, subtopicSlug],
    queryFn: () =>
      fetch(`/api/learning/${topicSlug}/${subtopicSlug}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 600_000,
  });

  const {
    data: storedLesson,
    isLoading: lessonLoading,
    isError: lessonError,
  } = useQuery({
    queryKey: ["micro-lesson", topicSlug, subtopicSlug],
    queryFn: () =>
      fetch(`/api/learning/${topicSlug}/${subtopicSlug}/micro-lesson`).then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      }),
    staleTime: 0,
    refetchInterval: (query) => {
      if (generatingLocallyRef.current) return false;
      return query.state.data?.status === "generating" ? 3000 : false;
    },
  });

  useEffect(() => {
    if (metaError) toast.error("Failed to load subtopic");
  }, [metaError]);

  useEffect(() => {
    if (lessonError) toast.error("Failed to load lesson");
  }, [lessonError]);

  if (metaLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!data) return null;

  // Another client is currently generating — show polling spinner
  // (but not if we're the one generating)
  if (storedLesson?.status === "generating" && !generatingLocallyRef.current) {
    return (
      <div className="flex flex-col h-[100dvh]">
        <div className="flex items-center justify-center py-6">
          <GenerationProgress />
        </div>
        <div className="flex-1 min-h-0">
          <WhiteboardSkeleton className="h-full" />
        </div>
      </div>
    );
  }

  const { topic, subtopic } = data;

  // Determine existing lesson: ready rows pass content; null/stale/error → generate
  const existingLesson =
    storedLesson?.status === "ready"
      ? { lessonContent: storedLesson.lessonContent, whiteboardSteps: storedLesson.whiteboardSteps }
      : null;

  // If no existing lesson, we'll generate locally — stop polling
  if (!existingLesson) {
    generatingLocallyRef.current = true;
  }

  const lessonContent = (
    <MicroLesson
      topic={topic.name}
      subtopic={subtopic.name}
      metadata={{
        description: subtopic.description,
        learningObjectives: subtopic.learningObjectives,
        keyFormulas: subtopic.keyFormulas,
        commonMistakes: subtopic.commonMistakes,
        tipsAndTricks: subtopic.tipsAndTricks,
        conceptualOverview: subtopic.conceptualOverview,
      }}
      existingLesson={existingLesson}
      subtopicApiPath={`/api/learning/${topicSlug}/${subtopicSlug}/micro-lesson`}
      practiceMode={{ subject: "gmat" }}
      onClose={() => router.push(`/learning/${topicSlug}/${subtopicSlug}`)}
      tracking={storedLesson?.id ? { microLessonId: storedLesson.id, subtopicId: storedLesson.subtopicId ?? data.subtopic.id } : undefined}
    />
  );

  // Free topics are always accessible; premium topics require subscription
  const needsGate = !freeLoading && !subLoading && isFree === false && !isPremium;

  return needsGate ? (
    <FeatureGate
      feature="AI Micro-lesson"
      description="Interactive AI whiteboard lessons for every GMAT concept. Available on Athena Premium."
    >
      {lessonContent}
    </FeatureGate>
  ) : lessonContent;
}
