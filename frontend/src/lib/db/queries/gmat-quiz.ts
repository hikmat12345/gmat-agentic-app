import { supabase } from "@/lib/supabase/client";

const db = supabase as any;

export async function saveGmatQuizSession(data: {
  userId: string;
  subtopicId: string;
  score: number;
  totalQuestions: number;
  timeElapsedSeconds: number;
  answers: {
    problemId: string;
    selectedOption: number;
    isCorrect: boolean;
    difficultyLevel?: number;
    responseTimeMs?: number;
    wrongCount?: number;
    hintUsed?: boolean;
    tutorUsed?: boolean;
    practiceCompleted?: boolean;
  }[];
}) {
  const { data: session, error: sessionError } = await db
    .from("quiz_sessions")
    .insert({
      user_id: data.userId,
      source: "gmat",
      subtopic_id: data.subtopicId,
      score: data.score,
      total_questions: data.totalQuestions,
      time_elapsed_seconds: data.timeElapsedSeconds,
    })
    .select()
    .single();

  if (sessionError || !session) throw new Error(sessionError?.message ?? "Failed to save session");

  if (data.answers.length > 0) {
    const { error: answersError } = await supabase
      .from("quiz_answers")
      .insert(
        data.answers.map((a) => ({
          session_id: session.id,
          problem_id: a.problemId,
          selected_option: a.selectedOption,
          is_correct: a.isCorrect,
          ...(a.difficultyLevel !== undefined && { difficulty_level: a.difficultyLevel }),
          ...(a.responseTimeMs !== undefined && { response_time_ms: a.responseTimeMs }),
        }))
      );
    if (answersError) throw new Error(answersError.message);
  }

  return {
    id: session.id,
    userId: session.user_id,
    subtopicId: session.subtopic_id,
    score: session.score,
    totalQuestions: session.total_questions,
    timeElapsedSeconds: session.time_elapsed_seconds,
    createdAt: new Date(session.created_at),
  };
}

export async function getGmatUserBestScores(userId: string) {
  const { data } = await db
    .from("quiz_sessions")
    .select("subtopic_id, score, total_questions")
    .eq("user_id", userId)
    .eq("source", "gmat");

  const grouped: Record<
    string,
    { subtopicId: string; bestScore: number; totalQuestions: number; attemptCount: number }
  > = {};

  for (const row of data ?? []) {
    if (!row.subtopic_id) continue;
    if (!grouped[row.subtopic_id]) {
      grouped[row.subtopic_id] = {
        subtopicId: row.subtopic_id,
        bestScore: 0,
        totalQuestions: 0,
        attemptCount: 0,
      };
    }
    grouped[row.subtopic_id].bestScore = Math.max(grouped[row.subtopic_id].bestScore, row.score);
    grouped[row.subtopic_id].totalQuestions = Math.max(
      grouped[row.subtopic_id].totalQuestions,
      row.total_questions
    );
    grouped[row.subtopic_id].attemptCount++;
  }

  return Object.values(grouped);
}
