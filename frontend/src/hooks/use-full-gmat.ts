"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import type {
  GmatStatusResponse,
  GmatStartResponse,
  GmatSubmitResponse,
  GmatHistoryResponse,
  GmatSection,
} from "@/types/full-gmat";

export function useFullGmatStatus() {
  const { data, isLoading, isError, refetch } = useQuery<GmatStatusResponse>({
    queryKey: ["full-gmat"],
    queryFn: async () => {
      const res = await fetch("/api/full-gmat");
      if (!res.ok) throw new Error("Failed to fetch GMAT status");
      return res.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load GMAT test status");
  }, [isError]);

  return { data, isLoading, isError, refetch };
}

export function useStartFullGmat() {
  const queryClient = useQueryClient();

  return useMutation<
    GmatStartResponse,
    Error,
    { testId: string; sectionOrder: GmatSection[] }
  >({
    mutationFn: async ({ testId, sectionOrder }) => {
      const res = await fetch("/api/full-gmat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, sectionOrder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Failed to start GMAT test");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["full-gmat"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useAnswerFullGmat() {
  return useMutation({
    mutationFn: async (payload: {
      attemptId: string;
      problemId: string;
      section: GmatSection;
      orderIndex: number;
      selectedOption: string; // TEXT — supports TPA JSON
      responseTimeMs?: number;
    }) => {
      const res = await fetch("/api/full-gmat/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to record answer");
      return res.json();
    },
  });
}

export function useSubmitFullGmat() {
  const queryClient = useQueryClient();

  return useMutation<
    GmatSubmitResponse,
    Error,
    {
      attemptId: string;
      verbalTimeSeconds: number;
      quantitativeTimeSeconds: number;
      dataInsightsTimeSeconds: number;
    }
  >({
    mutationFn: async (payload) => {
      const res = await fetch("/api/full-gmat/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit GMAT test");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["full-gmat"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      toast.error("Failed to submit GMAT test");
    },
  });
}

export function useFullGmatHistory() {
  const { data, isLoading, isError } = useQuery<GmatHistoryResponse>({
    queryKey: ["full-gmat-history"],
    queryFn: async () => {
      const res = await fetch("/api/full-gmat/history");
      if (!res.ok) throw new Error("Failed to fetch GMAT history");
      return res.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load GMAT test history");
  }, [isError]);

  return { data, isLoading, isError };
}
