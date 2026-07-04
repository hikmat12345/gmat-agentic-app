import { supabase } from "@/lib/supabase/client";
import { computeFullGmatScore } from "@/lib/full-gmat/scoring";

const db = supabase as any;

function scaleSection(correct: number, total: number): number {
  if (total <= 0) return 60;
  const ratio = Math.max(0, Math.min(1, correct / total));
  return Math.max(60, Math.min(90, Math.round(60 + ratio * 30)));
}

export async function getProgressData(userId: string) {
  // Fetch all GMAT quiz sessions for this user
  const { data: userSessions } = await db
    .from("quiz_sessions")
    .select("id, subtopic_id, score, total_questions, time_elapsed_seconds, created_at")
    .eq("user_id", userId)
    .eq("source", "gmat")
    .order("created_at", { ascending: true });

  type SessionRow = { id: string; subtopic_id: string | null; score: number; total_questions: number; time_elapsed_seconds: number; created_at: string };
  const sessions: SessionRow[] = userSessions ?? [];
  const sessionIds: string[] = sessions.map((s) => s.id);
  const subtopicIds: string[] = [...new Set(sessions.map((s) => s.subtopic_id).filter((id): id is string => id != null))];

  // Fetch answers, subtopics, topics in parallel
  const [answersRes, subtopicsRes, topicsRes] = await Promise.all([
    sessionIds.length > 0
      ? supabase
          .from("quiz_answers")
          .select("id, session_id, problem_id, is_correct")
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [] }),
    subtopicIds.length > 0
      ? supabase
          .from("subtopics")
          .select("id, topic_id, name")
          .in("id", subtopicIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("topics")
      .select("id, name, slug, subject, order_index")
      .order("order_index", { ascending: true }),
  ]);

  const answers = answersRes.data ?? [];
  const subtopics = subtopicsRes.data ?? [];
  const topics = topicsRes.data ?? [];

  // Fetch problem difficulties for answers
  const problemIds = [...new Set(answers.map((a) => a.problem_id))];
  let problemDifficultyMap: Record<string, string> = {};
  if (problemIds.length > 0) {
    const { data: problems } = await supabase
      .from("problems")
      .select("id, difficulty")
      .in("id", problemIds);
    for (const p of problems ?? []) {
      problemDifficultyMap[p.id] = p.difficulty;
    }
  }

  // Build lookup maps
  const subtopicMap: Record<string, { topic_id: string; name: string }> = {};
  for (const st of subtopics) {
    subtopicMap[st.id] = { topic_id: st.topic_id, name: st.name };
  }

  const topicMap: Record<string, { name: string; slug: string; subject: string; order_index: number }> = {};
  for (const t of topics) {
    topicMap[t.id] = { name: t.name, slug: t.slug, subject: t.subject, order_index: t.order_index };
  }

  const sessionMap: Record<string, { subtopic_id: string | null; score: number; total_questions: number; time_elapsed_seconds: number; created_at: string }> = {};
  for (const s of sessions) {
    sessionMap[s.id] = s;
  }

  // 1. Score history: GMAT composite over time from full test attempts
  const { data: gmatAttempts } = await db
    .from("full_gmat_attempts")
    .select("total_score, completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: true });

  const typedAttempts: { total_score: number | null; completed_at: string | null }[] = gmatAttempts ?? [];
  const scoreHistory = typedAttempts
    .filter((a) => a.total_score != null && a.completed_at != null)
    .map((a) => ({
      date: a.completed_at!.split("T")[0],
      score: a.total_score as number,
    }));

  // 2. Accuracy by difficulty
  const difficultyStats: Record<string, { total: number; correct: number }> = {};
  for (const ans of answers) {
    const difficulty = problemDifficultyMap[ans.problem_id];
    if (!difficulty) continue;
    if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { total: 0, correct: 0 };
    difficultyStats[difficulty].total++;
    if (ans.is_correct) difficultyStats[difficulty].correct++;
  }
  const accuracyByDifficulty = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
    difficulty,
    total: stats.total,
    correct: stats.correct,
    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));

  // 3. Topic performance
  const topicPerfStats: Record<string, { total: number; correct: number }> = {};
  for (const ans of answers) {
    const session = sessionMap[ans.session_id];
    if (!session || !session.subtopic_id) continue;
    const subtopic = subtopicMap[session.subtopic_id];
    if (!subtopic) continue;
    const topicId = subtopic.topic_id;
    if (!topicPerfStats[topicId]) topicPerfStats[topicId] = { total: 0, correct: 0 };
    topicPerfStats[topicId].total++;
    if (ans.is_correct) topicPerfStats[topicId].correct++;
  }

  const topicPerfMap: Record<string, { total: number; correct: number }> = {};
  for (const [topicId, stats] of Object.entries(topicPerfStats)) {
    const topic = topicMap[topicId];
    if (topic) topicPerfMap[topic.slug] = stats;
  }

  const allTopicPerformance = topics.map((t) => {
    const perf = topicPerfMap[t.slug];
    return {
      name: t.name,
      slug: t.slug,
      subject: t.subject,
      total: perf?.total ?? 0,
      correct: perf?.correct ?? 0,
      accuracy:
        perf && perf.total > 0
          ? Math.round((perf.correct / perf.total) * 100)
          : 0,
    };
  });

  // 4. Recent sessions with subtopic name
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      subtopicName: (s.subtopic_id ? subtopicMap[s.subtopic_id]?.name : "") ?? "",
      score: s.score,
      totalQuestions: s.total_questions,
      timeElapsedSeconds: s.time_elapsed_seconds,
      date: s.created_at,
    }));

  // 5. Overall stats
  const totalQ = answers.length;
  const totalCorrect = answers.filter((a) => a.is_correct).length;
  const totalTime = sessions.reduce((sum, s) => sum + s.time_elapsed_seconds, 0);
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const sessionCount = sessions.length;

  // 6. GMAT section scores (verbal / quantitative / data_insights)
  const sectionStats: Record<string, { total: number; correct: number }> = {
    verbal: { total: 0, correct: 0 },
    quantitative: { total: 0, correct: 0 },
    data_insights: { total: 0, correct: 0 },
  };

  for (const ans of answers) {
    const session = sessionMap[ans.session_id];
    if (!session || !session.subtopic_id) continue;
    const subtopic = subtopicMap[session.subtopic_id];
    if (!subtopic) continue;
    const topic = topicMap[subtopic.topic_id];
    if (!topic) continue;
    const subject = topic.subject;
    // Map legacy SAT subjects to GMAT equivalents
    const gmatSubject =
      subject === "math" || subject === "quantitative"
        ? "quantitative"
        : subject === "reading_writing" || subject === "english" || subject === "verbal"
        ? "verbal"
        : subject === "data_insights"
        ? "data_insights"
        : null;
    if (!gmatSubject) continue;
    sectionStats[gmatSubject].total++;
    if (ans.is_correct) sectionStats[gmatSubject].correct++;
  }

  const verbalScaled = scaleSection(sectionStats.verbal.correct, sectionStats.verbal.total);
  const quantScaled = scaleSection(sectionStats.quantitative.correct, sectionStats.quantitative.total);
  const diScaled = scaleSection(sectionStats.data_insights.correct, sectionStats.data_insights.total);

  const gmatScores = computeFullGmatScore(
    sectionStats.verbal.correct,
    sectionStats.quantitative.correct,
    sectionStats.data_insights.correct,
    sectionStats.verbal.total || 23,
    sectionStats.quantitative.total || 21,
    sectionStats.data_insights.total || 20,
  );

  // 7. Topic mastery
  const MASTERY_THRESHOLD = 0.7;
  const MIN_QUESTIONS = 5;

  const topicMasteryList = topics.map((t) => {
    const perf = topicPerfMap[t.slug];
    const total = perf?.total ?? 0;
    const correct = perf?.correct ?? 0;
    const mastered =
      total >= MIN_QUESTIONS && correct / total >= MASTERY_THRESHOLD;
    return {
      name: t.name,
      mastered,
      attempted: total > 0,
    };
  });

  const masteredCount = topicMasteryList.filter((s) => s.mastered).length;

  // 8. Activity calendar — count sessions per date (last 364 days)
  const activityMap: Record<string, number> = {};
  for (const s of sessions) {
    const dateKey = s.created_at.split("T")[0];
    activityMap[dateKey] = (activityMap[dateKey] ?? 0) + 1;
  }
  const activityCalendar = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

  // 9. Question-type breakdown from problems table
  const GMAT_QUESTION_TYPES = [
    { type: "critical_reasoning", label: "Critical Reasoning" },
    { type: "reading_comprehension", label: "Reading Comprehension" },
    { type: "problem_solving", label: "Problem Solving" },
    { type: "data_sufficiency", label: "Data Sufficiency" },
    { type: "multi_source_reasoning", label: "Multi-Source Reasoning" },
    { type: "table_analysis", label: "Table Analysis" },
    { type: "graphics_interpretation", label: "Graphics Interpretation" },
    { type: "two_part_analysis", label: "Two-Part Analysis" },
  ];

  const qtStats: Record<string, { total: number; correct: number }> = {};
  if (problemIds.length > 0) {
    const { data: problemsWithType } = await (supabase as any)
      .from("problems")
      .select("id, question_type")
      .in("id", problemIds);

    const qtMap: Record<string, string> = {};
    for (const p of (problemsWithType ?? []) as { id: string; question_type: string | null }[]) {
      if (p.question_type) qtMap[p.id] = p.question_type;
    }

    for (const ans of answers) {
      const qt = qtMap[ans.problem_id];
      if (!qt) continue;
      if (!qtStats[qt]) qtStats[qt] = { total: 0, correct: 0 };
      qtStats[qt].total++;
      if (ans.is_correct) qtStats[qt].correct++;
    }
  }

  const questionTypePerformance = GMAT_QUESTION_TYPES
    .filter((qt) => qtStats[qt.type])
    .map((qt) => {
      const s = qtStats[qt.type];
      return {
        type: qt.type,
        label: qt.label,
        total: s.total,
        correct: s.correct,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      };
    });

  return {
    scoreHistory,
    accuracyByDifficulty,
    topicPerformance: allTopicPerformance,
    recentSessions,
    overallStats: {
      totalQuestions: totalQ,
      accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
      totalTimeSeconds: totalTime,
      sessionCount,
      avgScore: sessionCount > 0 ? Math.round(totalScore / sessionCount) : 0,
    },
    sectionScores: {
      verbal: {
        subject: "verbal",
        total: sectionStats.verbal.total,
        correct: sectionStats.verbal.correct,
        accuracy: sectionStats.verbal.total > 0
          ? Math.round((sectionStats.verbal.correct / sectionStats.verbal.total) * 100) : 0,
        scaledScore: verbalScaled,
      },
      quantitative: {
        subject: "quantitative",
        total: sectionStats.quantitative.total,
        correct: sectionStats.quantitative.correct,
        accuracy: sectionStats.quantitative.total > 0
          ? Math.round((sectionStats.quantitative.correct / sectionStats.quantitative.total) * 100) : 0,
        scaledScore: quantScaled,
      },
      dataInsights: {
        subject: "data_insights",
        total: sectionStats.data_insights.total,
        correct: sectionStats.data_insights.correct,
        accuracy: sectionStats.data_insights.total > 0
          ? Math.round((sectionStats.data_insights.correct / sectionStats.data_insights.total) * 100) : 0,
        scaledScore: diScaled,
      },
      compositeScore: gmatScores.total,
    },
    topicMastery: {
      items: topicMasteryList,
      masteredCount,
      totalCount: topicMasteryList.length,
    },
    activityCalendar,
    questionTypePerformance,
  };
}
