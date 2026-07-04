"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FullGmatContext, type GmatPhase } from "./full-gmat-context";
import { useAnswerFullGmat, useSubmitFullGmat } from "@/hooks/use-full-gmat";
import {
  GMAT_SECTION_CONFIG,
  type GmatTestProblem,
  type GmatAnswer,
  type GmatAttempt,
  type GmatTest,
  type GmatSection,
} from "@/types/full-gmat";

type Props = {
  attempt: GmatAttempt;
  test: GmatTest;
  problems: GmatTestProblem[];
  initialAnswers: GmatAnswer[];
  children: React.ReactNode;
};

function getSectionLabel(section: GmatSection): string {
  return GMAT_SECTION_CONFIG[section].label;
}

function getSectionTimeLimit(section: GmatSection, actualCount: number): number {
  const standardCount = GMAT_SECTION_CONFIG[section].questions;
  const standardTime = GMAT_SECTION_CONFIG[section].timeLimitSeconds;
  if (actualCount <= 0 || actualCount >= standardCount) return standardTime;
  return Math.round((actualCount / standardCount) * standardTime);
}

export function FullGmatProvider({
  attempt,
  test,
  problems,
  initialAnswers,
  children,
}: Props) {
  const router = useRouter();
  const answerMutation = useAnswerFullGmat();
  const submitMutation = useSubmitFullGmat();

  const sectionOrder = attempt.sectionOrder;

  // Build answer state from any existing answers
  const [answers, setAnswers] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const a of initialAnswers) {
      if (a.selectedOption != null) map.set(a.problemId, a.selectedOption);
    }
    return map;
  });

  const [lockedIds, setLockedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const a of initialAnswers) {
      if (a.selectedOption != null) set.add(a.problemId);
    }
    return set;
  });

  // Compute section boundary indices from actual loaded problems (not hardcoded config)
  const sectionBoundaries = useMemo(() => {
    const bounds: { section: GmatSection; start: number; end: number }[] = [];
    let idx = 0;
    for (const section of sectionOrder) {
      const count = problems.filter((p) => p.section === section).length;
      if (count === 0) continue;
      bounds.push({ section, start: idx, end: idx + count - 1 });
      idx += count;
    }
    return bounds;
  }, [sectionOrder, problems]);

  function getSectionForIndex(globalIdx: number): GmatSection {
    for (const b of sectionBoundaries) {
      if (globalIdx >= b.start && globalIdx <= b.end) return b.section;
    }
    return sectionOrder[sectionOrder.length - 1];
  }

  function getSectionStart(section: GmatSection): number {
    return sectionBoundaries.find((b) => b.section === section)?.start ?? 0;
  }

  function getSectionEnd(section: GmatSection): number {
    return sectionBoundaries.find((b) => b.section === section)?.end ?? 0;
  }

  // Find resume position
  const resumeIndex = useMemo(() => {
    for (let i = 0; i < problems.length; i++) {
      if (!lockedIds.has(problems[i].problemId)) return i;
    }
    return 0;
  }, [problems, lockedIds]);

  const [currentIndex, setCurrentIndex] = useState(resumeIndex);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<GmatPhase>(
    attempt.status === "completed" ? "completed" : "active"
  );

  const currentSection = getSectionForIndex(currentIndex);
  const currentProblem = problems[currentIndex] ?? null;

  // Per-section time tracking
  const [verbalTimeUsed, setVerbalTimeUsed] = useState(attempt.verbalTimeSeconds ?? 0);
  const [quantitativeTimeUsed, setQuantitativeTimeUsed] = useState(attempt.quantitativeTimeSeconds ?? 0);
  const [dataInsightsTimeUsed, setDataInsightsTimeUsed] = useState(attempt.dataInsightsTimeSeconds ?? 0);

  function getTimeUsed(section: GmatSection): number {
    if (section === "verbal") return verbalTimeUsed;
    if (section === "quantitative") return quantitativeTimeUsed;
    return dataInsightsTimeUsed;
  }

  function setTimeUsed(section: GmatSection, elapsed: number) {
    if (section === "verbal") setVerbalTimeUsed((p) => p + elapsed);
    else if (section === "quantitative") setQuantitativeTimeUsed((p) => p + elapsed);
    else setDataInsightsTimeUsed((p) => p + elapsed);
  }

  const getActualSectionCount = useCallback(
    (section: GmatSection) => problems.filter((p) => p.section === section).length,
    [problems]
  );

  const [timeLeft, setTimeLeft] = useState(() => {
    const limit = getSectionTimeLimit(currentSection, getActualSectionCount(currentSection));
    return Math.max(0, limit - getTimeUsed(currentSection));
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionStartRef = useRef(Date.now());

  // Reset timer when section changes
  useEffect(() => {
    if (phase !== "active") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const limit = getSectionTimeLimit(currentSection, getActualSectionCount(currentSection));
    const used = getTimeUsed(currentSection);
    setTimeLeft(Math.max(0, limit - used));
    sectionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // Intentionally depend on currentSection identity, not all getTimeUsed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentSection]);

  // Auto-advance / submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && phase === "active") {
      const sectionIdx = sectionOrder.indexOf(currentSection);
      if (sectionIdx < sectionOrder.length - 1) {
        finishSection();
      } else {
        submitTest();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const displayTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  // Navigation
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => Math.min(i + 1, problems.length - 1));
  }, [problems.length]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(Math.max(0, Math.min(index, problems.length - 1)));
    },
    [currentIndex, problems.length]
  );

  // Answer handling
  const handleSelectAnswer = useCallback(
    (problemId: string, selectedOption: string) => {
      if (phase !== "active") return;

      const problem = problems.find((p) => p.problemId === problemId);
      if (!problem) return;

      setAnswers((prev) => new Map(prev).set(problemId, selectedOption));
      setLockedIds((prev) => new Set(prev).add(problemId));

      answerMutation.mutate({
        attemptId: attempt.id,
        problemId,
        section: problem.section,
        orderIndex: problem.orderIndex,
        selectedOption,
        responseTimeMs: undefined,
      });
    },
    [phase, problems, attempt.id, answerMutation]
  );

  // Finish current section, move to next
  const finishSection = useCallback(() => {
    const elapsed = Math.round((Date.now() - sectionStartRef.current) / 1000);
    setTimeUsed(currentSection, elapsed);

    const sectionIdx = sectionOrder.indexOf(currentSection);
    if (sectionIdx < sectionOrder.length - 1) {
      const nextSection = sectionOrder[sectionIdx + 1];
      const nextStart = getSectionStart(nextSection);
      setCurrentIndex(nextStart);
    }
    // Timer useEffect will handle resetting via currentSection change
  }, [currentSection, sectionOrder, sectionBoundaries]);

  // Submit test
  const submitTest = useCallback(() => {
    const elapsed = Math.round((Date.now() - sectionStartRef.current) / 1000);
    const finalVerbal = currentSection === "verbal" ? verbalTimeUsed + elapsed : verbalTimeUsed;
    const finalQuant = currentSection === "quantitative" ? quantitativeTimeUsed + elapsed : quantitativeTimeUsed;
    const finalDI = currentSection === "data_insights" ? dataInsightsTimeUsed + elapsed : dataInsightsTimeUsed;

    setPhase("completed");

    submitMutation.mutate(
      {
        attemptId: attempt.id,
        verbalTimeSeconds: finalVerbal,
        quantitativeTimeSeconds: finalQuant,
        dataInsightsTimeSeconds: finalDI,
      },
      {
        onSuccess: () => {
          router.push(`/full-gmat/${attempt.id}/results`);
        },
      }
    );
  }, [attempt.id, currentSection, verbalTimeUsed, quantitativeTimeUsed, dataInsightsTimeUsed, submitMutation, router]);

  // Status helpers
  const getQuestionStatus = useCallback(
    (index: number): "unanswered" | "answered" => {
      const problem = problems[index];
      if (!problem) return "unanswered";
      return lockedIds.has(problem.problemId) ? "answered" : "unanswered";
    },
    [problems, lockedIds]
  );

  const sectionStartIndex = getSectionStart(currentSection);
  const sectionEndIndex = getSectionEnd(currentSection);
  const sectionTotalQuestions = sectionEndIndex - sectionStartIndex + 1;
  const sectionQuestionIndex = currentIndex - sectionStartIndex;
  const answeredCount = lockedIds.size;
  const sectionLabel = getSectionLabel(currentSection);

  return (
    <FullGmatContext.Provider
      value={{
        attempt,
        test,
        problems,
        sectionOrder,
        currentIndex,
        currentSection,
        currentProblem,
        answers,
        lockedIds,
        phase,
        timeLeft,
        displayTime,
        goNext,
        goBack,
        goTo,
        direction,
        handleSelectAnswer,
        finishSection,
        submitTest,
        getQuestionStatus,
        totalQuestions: problems.length,
        answeredCount,
        sectionLabel,
        sectionQuestionIndex,
        sectionTotalQuestions,
        sectionStartIndex,
        verbalTimeUsed,
        quantitativeTimeUsed,
        dataInsightsTimeUsed,
      }}
    >
      {children}
    </FullGmatContext.Provider>
  );
}
