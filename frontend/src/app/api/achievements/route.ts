import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { supabase } from "@/lib/supabase/client";
import { ACHIEVEMENTS, computeUnlocked, type AchievementStats } from "@/lib/achievements";
import { NextResponse } from "next/server";

const db = supabase as any;

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Collect stats needed for achievement evaluation
  const [sessionsRes, answersRes, friendsRes, attemptsRes, masteryRes] = await Promise.all([
    db.from("sessions").select("id").eq("user_id", user.id).eq("status", "completed"),
    db.from("quiz_answers")
      .select("is_correct, session_id")
      .in("session_id",
        (await db.from("sessions").select("id").eq("user_id", user.id).eq("status", "completed")).data?.map((s: any) => s.id) ?? []
      ),
    db.from("friendships").select("id").or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq("status", "accepted"),
    db.from("full_gmat_attempts").select("total_score, verbal_scaled_score, quantitative_scaled_score, data_insights_scaled_score")
      .eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }).limit(1),
    db.from("topics").select("id, name, slug"),
  ]);

  const sessions = sessionsRes.data ?? [];
  const answers = answersRes.data ?? [];
  const latestAttempt = attemptsRes.data?.[0] ?? null;
  const allTopics = masteryRes.data ?? [];

  // Compute topic mastery from quiz sessions
  const topicsWithPerf = new Set<string>();
  const topicCorrect: Record<string, number> = {};
  const topicTotal: Record<string, number> = {};

  const sessionWithSubtopic = await db
    .from("sessions")
    .select("id, subtopic_id")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const sessionSubtopicMap: Record<string, string> = {};
  for (const s of sessionWithSubtopic.data ?? []) {
    if (s.subtopic_id) sessionSubtopicMap[s.id] = s.subtopic_id;
  }

  const subtopicIds = [...new Set(Object.values(sessionSubtopicMap))];
  const subtopicsRes = subtopicIds.length > 0
    ? await db.from("subtopics").select("id, topic_id").in("id", subtopicIds)
    : { data: [] };
  const subtopicTopicMap: Record<string, string> = {};
  for (const st of subtopicsRes.data ?? []) {
    subtopicTopicMap[st.id] = st.topic_id;
  }

  for (const ans of answers) {
    const subtopicId = sessionSubtopicMap[ans.session_id];
    if (!subtopicId) continue;
    const topicId = subtopicTopicMap[subtopicId];
    if (!topicId) continue;
    if (!topicTotal[topicId]) topicTotal[topicId] = 0;
    if (!topicCorrect[topicId]) topicCorrect[topicId] = 0;
    topicTotal[topicId]++;
    if (ans.is_correct) topicCorrect[topicId]++;
  }

  const topicsMastered = allTopics.filter((t: any) => {
    const total = topicTotal[t.id] ?? 0;
    const correct = topicCorrect[t.id] ?? 0;
    return total >= 5 && correct / total >= 0.7;
  }).length;

  const totalQ = answers.length;
  const totalCorrect = answers.filter((a: any) => a.is_correct).length;

  const userAny = user as any;
  const stats: AchievementStats = {
    streak: userAny.streak ?? 0,
    bestStreak: userAny.bestStreak ?? userAny.streak ?? 0,
    questsDone: sessions.length,
    totalQuestions: totalQ,
    accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
    compositeScore: latestAttempt?.total_score ?? (user as any).currentComposite ?? 0,
    verbalScore: latestAttempt?.verbal_scaled_score ?? 0,
    quantScore: latestAttempt?.quantitative_scaled_score ?? 0,
    diScore: latestAttempt?.data_insights_scaled_score ?? 0,
    topicsMastered,
    totalTopics: allTopics.length,
    friendCount: (friendsRes.data ?? []).length,
  };

  const unlocked = computeUnlocked(stats);

  const result = ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    unlocked: unlocked.has(a.id),
  }));

  return NextResponse.json({ achievements: result, stats });
}
