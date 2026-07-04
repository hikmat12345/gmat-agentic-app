import { supabase } from "@/lib/supabase/client";
import type {
  GmatTest,
  GmatAttempt,
  GmatTestProblem,
  GmatAnswer,
  GmatSection,
} from "@/types/full-gmat";

const db = supabase as any;

// ── Tests ──

export async function getActiveGmatTests(): Promise<GmatTest[]> {
  const { data: tests } = await db
    .from("full_gmat_tests")
    .select("id, test_number, name, status, created_at")
    .eq("status", "active")
    .order("test_number");

  if (!tests || tests.length === 0) return [];

  const testIds = tests.map((t: any) => t.id);
  const { data: problemRows } = await db
    .from("full_gmat_test_problems")
    .select("test_id, section")
    .in("test_id", testIds);

  const countMap = new Map<string, { verbal: number; quantitative: number; data_insights: number }>();
  for (const row of problemRows ?? []) {
    if (!countMap.has(row.test_id)) {
      countMap.set(row.test_id, { verbal: 0, quantitative: 0, data_insights: 0 });
    }
    const entry = countMap.get(row.test_id)!;
    if (row.section === "verbal") entry.verbal++;
    else if (row.section === "quantitative") entry.quantitative++;
    else if (row.section === "data_insights") entry.data_insights++;
  }

  return tests.map((row: any) => {
    const counts = countMap.get(row.id) ?? { verbal: 0, quantitative: 0, data_insights: 0 };
    const total = counts.verbal + counts.quantitative + counts.data_insights;
    return {
      ...mapGmatTest(row),
      verbalCount: counts.verbal,
      quantitativeCount: counts.quantitative,
      dataInsightsCount: counts.data_insights,
      totalQuestions: total,
    };
  });
}

// ── Attempts ──

export async function getLastCompletedGmatAttempt(
  userId: string
): Promise<GmatAttempt | null> {
  const { data } = await db
    .from("full_gmat_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? mapGmatAttempt(data) : null;
}

export async function getInProgressGmatAttempt(
  userId: string
): Promise<GmatAttempt | null> {
  const { data } = await db
    .from("full_gmat_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? mapGmatAttempt(data) : null;
}

export async function getUserGmatAttempts(userId: string): Promise<GmatAttempt[]> {
  const { data } = await db
    .from("full_gmat_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapGmatAttempt);
}

export async function createGmatAttempt(
  userId: string,
  testId: string,
  sectionOrder: GmatSection[]
): Promise<GmatAttempt> {
  const { data, error } = await db
    .from("full_gmat_attempts")
    .insert({
      user_id: userId,
      test_id: testId,
      status: "in_progress",
      section_order: sectionOrder,
      current_section: sectionOrder[0],
      current_question: 0,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create GMAT attempt");
  return mapGmatAttempt(data);
}

export async function updateGmatAttemptPosition(
  attemptId: string,
  currentSection: string,
  currentQuestion: number
) {
  await db
    .from("full_gmat_attempts")
    .update({ current_section: currentSection, current_question: currentQuestion })
    .eq("id", attemptId);
}

export async function completeGmatAttempt(
  attemptId: string,
  scores: {
    verbalRawScore: number;
    verbalScaledScore: number;
    quantitativeRawScore: number;
    quantitativeScaledScore: number;
    dataInsightsRawScore: number;
    dataInsightsScaledScore: number;
    totalScore: number;
    verbalTimeSeconds: number;
    quantitativeTimeSeconds: number;
    dataInsightsTimeSeconds: number;
    totalTimeSeconds: number;
  }
) {
  const { error } = await db
    .from("full_gmat_attempts")
    .update({
      status: "completed",
      verbal_raw_score: scores.verbalRawScore,
      verbal_scaled_score: scores.verbalScaledScore,
      quantitative_raw_score: scores.quantitativeRawScore,
      quantitative_scaled_score: scores.quantitativeScaledScore,
      data_insights_raw_score: scores.dataInsightsRawScore,
      data_insights_scaled_score: scores.dataInsightsScaledScore,
      total_score: scores.totalScore,
      verbal_time_seconds: scores.verbalTimeSeconds,
      quantitative_time_seconds: scores.quantitativeTimeSeconds,
      data_insights_time_seconds: scores.dataInsightsTimeSeconds,
      total_time_seconds: scores.totalTimeSeconds,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  if (error) throw new Error(error.message);
}

// ── Test problems ──

export async function getGmatTestProblems(testId: string): Promise<GmatTestProblem[]> {
  const { data } = await db
    .from("full_gmat_test_problems")
    .select(`
      id,
      problem_id,
      section,
      order_index,
      problems!inner (
        question_text,
        options,
        correct_option,
        explanation,
        solution_steps,
        hint,
        detailed_hint,
        subtopic_id,
        difficulty_level,
        difficulty,
        question_type,
        passage_text,
        chart_data
      )
    `)
    .eq("test_id", testId)
    .order("section")
    .order("order_index");

  return (data ?? []).map((row: any) => ({
    id: row.id,
    problemId: row.problem_id,
    section: row.section as GmatSection,
    orderIndex: row.order_index,
    questionType: row.problems.question_type ?? null,
    questionText: row.problems.question_text,
    options: row.problems.options,
    correctOption: row.problems.correct_option,
    explanation: row.problems.explanation,
    solutionSteps: row.problems.solution_steps ?? [],
    hint: row.problems.hint ?? "",
    detailedHint: row.problems.detailed_hint,
    subtopicId: row.problems.subtopic_id,
    difficultyLevel: row.problems.difficulty_level,
    difficulty: row.problems.difficulty,
    passageText: row.problems.passage_text ?? null,
    chartData: row.problems.chart_data ?? null,
  }));
}

// ── Answers ──

export async function createGmatAnswerRows(
  attemptId: string,
  problems: GmatTestProblem[]
) {
  const rows = problems.map((p) => ({
    attempt_id: attemptId,
    problem_id: p.problemId,
    section: p.section,
    order_index: p.orderIndex,
  }));

  const { error } = await db.from("full_gmat_answers").insert(rows);
  if (error) throw new Error(error.message);
}

export async function getGmatAttemptAnswers(attemptId: string): Promise<GmatAnswer[]> {
  const { data } = await db
    .from("full_gmat_answers")
    .select("*")
    .eq("attempt_id", attemptId)
    .order("section")
    .order("order_index");

  return (data ?? []).map(mapGmatAnswer);
}

export async function upsertGmatAnswer(
  attemptId: string,
  answer: {
    problemId: string;
    section: string;
    orderIndex: number;
    selectedOption: string;
    isCorrect: boolean;
    responseTimeMs?: number;
  }
) {
  const { error } = await db
    .from("full_gmat_answers")
    .update({
      selected_option: answer.selectedOption,
      is_correct: answer.isCorrect,
      response_time_ms: answer.responseTimeMs ?? null,
      answered_at: new Date().toISOString(),
    })
    .eq("attempt_id", attemptId)
    .eq("section", answer.section)
    .eq("order_index", answer.orderIndex);

  if (error) throw new Error(error.message);
}

// ── Mappers ──

function mapGmatTest(row: any): GmatTest {
  return {
    id: row.id,
    testNumber: row.test_number,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapGmatAttempt(row: any): GmatAttempt {
  return {
    id: row.id,
    userId: row.user_id,
    testId: row.test_id,
    status: row.status,
    verbalRawScore: row.verbal_raw_score ?? null,
    quantitativeRawScore: row.quantitative_raw_score ?? null,
    dataInsightsRawScore: row.data_insights_raw_score ?? null,
    verbalScaledScore: row.verbal_scaled_score ?? null,
    quantitativeScaledScore: row.quantitative_scaled_score ?? null,
    dataInsightsScaledScore: row.data_insights_scaled_score ?? null,
    totalScore: row.total_score ?? null,
    verbalTimeSeconds: row.verbal_time_seconds ?? 0,
    quantitativeTimeSeconds: row.quantitative_time_seconds ?? 0,
    dataInsightsTimeSeconds: row.data_insights_time_seconds ?? 0,
    totalTimeSeconds: row.total_time_seconds ?? 0,
    sectionOrder: (row.section_order as GmatSection[]) ?? ["verbal", "quantitative", "data_insights"],
    currentSection: row.current_section ?? null,
    currentQuestion: row.current_question ?? 0,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
  };
}

function mapGmatAnswer(row: any): GmatAnswer {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    problemId: row.problem_id,
    section: row.section as GmatSection,
    orderIndex: row.order_index,
    selectedOption: row.selected_option ?? null,
    isCorrect: row.is_correct ?? null,
    responseTimeMs: row.response_time_ms ?? null,
    answeredAt: row.answered_at ?? null,
  };
}
