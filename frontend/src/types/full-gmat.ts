// GMAT Focus Edition — TypeScript types and constants

// ── Section enums ──

export type GmatSection = "verbal" | "quantitative" | "data_insights";
export type GmatTestStatus = "draft" | "active" | "retired";
export type GmatAttemptStatus = "in_progress" | "completed" | "abandoned";

export type GmatQuestionType =
  | "problem_solving"
  | "critical_reasoning"
  | "reading_comprehension"
  | "data_sufficiency"
  | "multi_source_reasoning"
  | "table_analysis"
  | "graphics_interpretation"
  | "two_part_analysis";

// ── Section configuration ──

export const GMAT_SECTION_CONFIG: Record<
  GmatSection,
  {
    label: string;
    questions: number;
    timeLimitSeconds: number;
    questionTypes: GmatQuestionType[];
  }
> = {
  verbal: {
    label: "Verbal Reasoning",
    questions: 23,
    timeLimitSeconds: 45 * 60,
    questionTypes: ["critical_reasoning", "reading_comprehension"],
  },
  quantitative: {
    label: "Quantitative Reasoning",
    questions: 21,
    timeLimitSeconds: 45 * 60,
    questionTypes: ["problem_solving"],
  },
  data_insights: {
    label: "Data Insights",
    questions: 20,
    timeLimitSeconds: 45 * 60,
    questionTypes: [
      "data_sufficiency",
      "multi_source_reasoning",
      "table_analysis",
      "graphics_interpretation",
      "two_part_analysis",
    ],
  },
};

export const GMAT_SECTIONS: GmatSection[] = ["verbal", "quantitative", "data_insights"];

/** Cooldown between full GMAT tests: 16 days (official GMAT rule) */
export const FULL_GMAT_COOLDOWN_MS = 0;

/** GMAT total score range */
export const GMAT_TOTAL_SCORE = { min: 205, max: 805, step: 10 } as const;

/** GMAT section score range */
export const GMAT_SECTION_SCORE = { min: 60, max: 90 } as const;

// ── Fixed Data Sufficiency answer choices (always the same, per GMAC) ──

export const DS_OPTIONS: string[] = [
  "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
  "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
  "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
  "EACH statement ALONE is sufficient.",
  "Statements (1) and (2) TOGETHER are NOT sufficient to answer the question asked, and additional data are needed.",
];
export const DS_OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

// ── Domain types ──

export type GmatTest = {
  id: string;
  testNumber: number;
  name: string;
  status: GmatTestStatus;
  createdAt: string;
  totalQuestions?: number;
  verbalCount?: number;
  quantitativeCount?: number;
  dataInsightsCount?: number;
};

export type GmatAttempt = {
  id: string;
  userId: string;
  testId: string;
  status: GmatAttemptStatus;
  // Raw scores (correct count)
  verbalRawScore: number | null;
  quantitativeRawScore: number | null;
  dataInsightsRawScore: number | null;
  // Scaled scores (60-90)
  verbalScaledScore: number | null;
  quantitativeScaledScore: number | null;
  dataInsightsScaledScore: number | null;
  // Total (205-805)
  totalScore: number | null;
  // Timing
  verbalTimeSeconds: number;
  quantitativeTimeSeconds: number;
  dataInsightsTimeSeconds: number;
  totalTimeSeconds: number;
  // Navigation
  sectionOrder: GmatSection[];
  currentSection: GmatSection | null;
  currentQuestion: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
};

export type GmatTestProblem = {
  id: string;
  problemId: string;
  section: GmatSection;
  orderIndex: number;
  questionType: GmatQuestionType | null;
  // Problem content (joined from problems table)
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
  solutionSteps: { step: number; instruction: string; math?: string }[];
  hint: string;
  detailedHint?: string;
  subtopicId: string | null;
  difficultyLevel: number;
  difficulty: string;
  // GMAT-specific fields
  passageText?: string | null;
  chartData?: GmatChartData | null;
};

export type GmatAnswer = {
  id: string;
  attemptId: string;
  problemId: string;
  section: GmatSection;
  orderIndex: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  responseTimeMs: number | null;
  answeredAt: string | null;
};

// ── Chart data for Graphics Interpretation questions ──

export type GmatChartData =
  | GmatBarChartData
  | GmatLineChartData
  | GmatScatterPlotData
  | GmatPieChartData;

export type GmatBarChartData = {
  type: "bar";
  title: string;
  xLabel?: string;
  yLabel?: string;
  data: { name: string; value: number; group?: string }[];
};

export type GmatLineChartData = {
  type: "line";
  title: string;
  xLabel?: string;
  yLabel?: string;
  series: { name: string; data: { x: number | string; y: number }[] }[];
};

export type GmatScatterPlotData = {
  type: "scatter";
  title: string;
  xLabel?: string;
  yLabel?: string;
  data: { x: number; y: number; label?: string }[];
};

export type GmatPieChartData = {
  type: "pie";
  title: string;
  data: { name: string; value: number }[];
};

// ── Multi-Source Reasoning tab data ──

export type GmatMsrSource = {
  tabLabel: string;
  content: string; // markdown or plain text
};

// ── API response shapes ──

export type GmatStatusResponse = {
  tests: GmatTest[];
  lastAttempt: {
    completedAt: string;
    totalScore: number;
    testId: string;
  } | null;
  canTakeTest: boolean;
  nextAvailableDate: string | null;
  currentAttempt: GmatAttempt | null;
};

export type GmatStartResponse = {
  attemptId: string;
  test: GmatTest;
  problems: GmatTestProblem[];
  answers: GmatAnswer[];
  sectionOrder: GmatSection[];
};

export type GmatSubmitResponse = {
  verbalRawScore: number;
  verbalScaledScore: number;
  quantitativeRawScore: number;
  quantitativeScaledScore: number;
  dataInsightsRawScore: number;
  dataInsightsScaledScore: number;
  totalScore: number;
};

export type GmatHistoryResponse = {
  attempts: GmatAttempt[];
};

// ── Helpers ──

/** Maps section to its question count */
export function sectionQuestionCount(section: GmatSection): number {
  return GMAT_SECTION_CONFIG[section].questions;
}

/** Maps section to its time limit in seconds */
export function sectionTimeLimitSeconds(section: GmatSection): number {
  return GMAT_SECTION_CONFIG[section].timeLimitSeconds;
}

/** Returns true if the question type belongs to Data Insights */
export function isDataInsightsType(qt: GmatQuestionType): boolean {
  return [
    "data_sufficiency",
    "multi_source_reasoning",
    "table_analysis",
    "graphics_interpretation",
    "two_part_analysis",
  ].includes(qt);
}

/** Returns human-readable label for a question type */
export function questionTypeLabel(qt: GmatQuestionType): string {
  const labels: Record<GmatQuestionType, string> = {
    problem_solving: "Problem Solving",
    critical_reasoning: "Critical Reasoning",
    reading_comprehension: "Reading Comprehension",
    data_sufficiency: "Data Sufficiency",
    multi_source_reasoning: "Multi-Source Reasoning",
    table_analysis: "Table Analysis",
    graphics_interpretation: "Graphics Interpretation",
    two_part_analysis: "Two-Part Analysis",
  };
  return labels[qt] ?? qt;
}
