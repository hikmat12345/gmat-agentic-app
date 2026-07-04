"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFullGmatContext } from "@/components/full-gmat/full-gmat-context";

export default function FullGmatAttemptPage() {
  const router = useRouter();
  const params = useParams<{ attemptId: string }>();
  const { currentIndex } = useFullGmatContext();

  useEffect(() => {
    router.replace(`/full-gmat/${params.attemptId}/${currentIndex + 1}`);
  }, [router, params.attemptId, currentIndex]);

  return null;
}
