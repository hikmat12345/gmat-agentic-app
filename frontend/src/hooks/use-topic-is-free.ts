"use client";

import { useQuery } from "@tanstack/react-query";

type TopicFreeData = { topics: { slug: string; isFree: boolean }[] };

/**
 * Returns whether a topic is in the free tier (first 3 per subject group).
 * Uses the same cached ["learning"] query so no extra network request.
 */
export function useTopicIsFree(topicSlug: string) {
  const { data, isLoading } = useQuery<TopicFreeData>({
    queryKey: ["learning"],
    queryFn: () => fetch("/api/learning").then((r) => r.json()),
    staleTime: 10 * 60_000,
  });

  const topic = data?.topics.find((t) => t.slug === topicSlug);
  return {
    isFree: topic?.isFree ?? null,
    isLoading,
  };
}
