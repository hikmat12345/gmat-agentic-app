"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type AccountabilityStatus = {
  locked: boolean;
  missedDate?: string;
  message?: string;
};

export function useAccountability() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AccountabilityStatus>({
    queryKey: ["accountability"],
    queryFn: () => fetch("/api/accountability/status").then((r) => r.json()),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const recommit = useMutation({
    mutationFn: (missedDate?: string) =>
      fetch("/api/accountability/recommit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missedDate }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountability"] });
    },
  });

  return {
    locked: data?.locked ?? false,
    missedDate: data?.missedDate,
    message: data?.message,
    isLoading,
    recommit: recommit.mutate,
    recommitting: recommit.isPending,
  };
}
