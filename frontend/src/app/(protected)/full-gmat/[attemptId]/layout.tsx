"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FullGmatProvider } from "@/components/full-gmat/full-gmat-provider";
import type {
  GmatTestProblem,
  GmatAnswer,
  GmatAttempt,
  GmatTest,
  GmatSection,
} from "@/types/full-gmat";

type LoadedData = {
  attempt: GmatAttempt;
  test: GmatTest;
  problems: GmatTestProblem[];
  answers: GmatAnswer[];
};

export default function FullGmatAttemptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Use start endpoint in resume mode (testId: "resume")
        const res = await fetch("/api/full-gmat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId: "resume" }),
        });

        if (!res.ok) {
          router.push("/full-gmat");
          return;
        }

        const json = await res.json();

        const test: GmatTest = json.test ?? { id: "", testNumber: 1, name: "Practice Test", status: "active" as const, createdAt: new Date().toISOString() };

        const attempt: GmatAttempt = {
          id: json.attemptId,
          userId: "",
          testId: test.id,
          status: "in_progress",
          verbalRawScore: null,
          quantitativeRawScore: null,
          dataInsightsRawScore: null,
          verbalScaledScore: null,
          quantitativeScaledScore: null,
          dataInsightsScaledScore: null,
          totalScore: null,
          verbalTimeSeconds: 0,
          quantitativeTimeSeconds: 0,
          dataInsightsTimeSeconds: 0,
          totalTimeSeconds: 0,
          sectionOrder: (json.sectionOrder ?? ["verbal", "quantitative", "data_insights"]) as GmatSection[],
          currentSection: null,
          currentQuestion: 0,
          startedAt: new Date().toISOString(),
          completedAt: null,
          createdAt: new Date().toISOString(),
        };

        setData({
          attempt,
          test,
          problems: json.problems,
          answers: json.answers,
        });
      } catch {
        toast.error("Failed to load GMAT test");
        router.push("/full-gmat");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.attemptId, router]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <FullGmatProvider
      attempt={data.attempt}
      test={data.test}
      problems={data.problems}
      initialAnswers={data.answers}
    >
      {children}
    </FullGmatProvider>
  );
}
