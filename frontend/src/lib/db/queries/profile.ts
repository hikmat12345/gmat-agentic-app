import { supabase } from "@/lib/supabase/client";

const db = supabase as any;

export async function getProfileData(userId: string) {
  const [
    userRes,
    sessionsRes,
    quizSessionsRes,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("display_name, avatar_url, created_at, target_score, best_streak, current_composite")
      .eq("id", userId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("scheduled_date, status")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: false })
      .limit(30),
    db
      .from("quiz_sessions")
      .select("id, score, total_questions, time_elapsed_seconds")
      .eq("user_id", userId)
      .eq("source", "gmat"),
  ]);

  const userRecord = userRes.data;
  const sessionHistory = sessionsRes.data ?? [];
  type QSRow = { id: string; score: number; total_questions: number; time_elapsed_seconds: number };
  const quizSessions: QSRow[] = quizSessionsRes.data ?? [];

  // Fetch answers for all gmat quiz sessions
  const sessionIds: string[] = quizSessions.map((s) => s.id);
  let totalAnswers = 0;
  let correctAnswers = 0;

  if (sessionIds.length > 0) {
    const { data: answers } = await supabase
      .from("quiz_answers")
      .select("is_correct")
      .in("session_id", sessionIds);

    totalAnswers = answers?.length ?? 0;
    correctAnswers = answers?.filter((a) => a.is_correct).length ?? 0;
  }

  // Calculate current streak from daily quests
  const today = new Date().toISOString().split("T")[0];
  const { data: questHistory } = await supabase
    .from("daily_quests")
    .select("quest_date, status")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("quest_date", { ascending: false });

  let streak = 0;
  if (questHistory && questHistory.length > 0) {
    const todayDate = new Date(today);
    const mostRecent = new Date(questHistory[0].quest_date);
    const daysSinceLast = Math.floor(
      (todayDate.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLast <= 1) {
      streak = 1;
      for (let i = 1; i < questHistory.length; i++) {
        const curr = new Date(questHistory[i].quest_date);
        const prev = new Date(questHistory[i - 1].quest_date);
        const diffDays = Math.round(
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) streak++;
        else break;
      }
    }
  }

  // totalScore = GMAT composite (205-805); falls back to 205 if not yet set
  const totalScore = userRecord?.current_composite ?? 205;
  const totalTimeSeconds = quizSessions.reduce(
    (sum, s) => sum + s.time_elapsed_seconds,
    0
  );
  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const questsDone = quizSessions.length;

  // Legacy session streak (for fallback)
  const completedHistory = sessionHistory
    .filter((s) => s.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.scheduled_date).getTime() -
        new Date(a.scheduled_date).getTime()
    );

  if (streak === 0 && completedHistory.length > 0) {
    streak = 1;
    for (let i = 1; i < completedHistory.length; i++) {
      const curr = new Date(completedHistory[i].scheduled_date);
      const prev = new Date(completedHistory[i - 1].scheduled_date);
      const diffDays =
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) streak++;
      else break;
    }
  }

  return {
    user: userRecord
      ? {
          displayName: userRecord.display_name,
          avatarUrl: userRecord.avatar_url,
          createdAt: new Date(userRecord.created_at),
          targetScore: userRecord.target_score,
          bestStreak: userRecord.best_streak,
        }
      : null,
    totalScore,
    questsDone,
    totalTimeSeconds,
    accuracy,
    streak,
    bestStreak: userRecord?.best_streak ?? 0,
  };
}
