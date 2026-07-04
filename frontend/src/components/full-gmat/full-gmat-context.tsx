"use client";

import { createContext, useContext } from "react";
import type {
  GmatTestProblem,
  GmatAnswer,
  GmatSection,
  GmatAttempt,
  GmatTest,
} from "@/types/full-gmat";

export type GmatPhase = "active" | "completed";

export type FullGmatContextValue = {
  // Test metadata
  attempt: GmatAttempt;
  test: GmatTest;
  problems: GmatTestProblem[]; // ordered by sectionOrder then orderIndex
  sectionOrder: GmatSection[];

  // Current position (global across all sections)
  currentIndex: number;
  currentSection: GmatSection;
  currentProblem: GmatTestProblem | null;

  // State
  answers: Map<string, string>; // problemId → selectedOption (TEXT)
  lockedIds: Set<string>;
  phase: GmatPhase;

  // Timer (per section, counts down)
  timeLeft: number;
  displayTime: string;

  // Navigation
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  direction: number;

  // Actions
  handleSelectAnswer: (problemId: string, selectedOption: string) => void;
  finishSection: () => void; // advance to next section
  submitTest: () => void;

  // Status helpers
  getQuestionStatus: (index: number) => "unanswered" | "answered";
  totalQuestions: number;
  answeredCount: number;
  sectionLabel: string;
  sectionQuestionIndex: number; // 0-based within current section
  sectionTotalQuestions: number;
  sectionStartIndex: number; // global index where current section starts

  // Timing for submission
  verbalTimeUsed: number;
  quantitativeTimeUsed: number;
  dataInsightsTimeUsed: number;
};

export const FullGmatContext = createContext<FullGmatContextValue | null>(null);

export function useFullGmatContext() {
  const ctx = useContext(FullGmatContext);
  if (!ctx) throw new Error("useFullGmatContext must be used within FullGmatProvider");
  return ctx;
}
