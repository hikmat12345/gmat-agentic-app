import { supabase } from "@/lib/supabase/client";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBREVS = ["S", "M", "T", "W", "T", "F", "S"];

export async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = DAY_NAMES[new Date().getDay()];

  // Fetch sessions with schedule info (join via schedules)
  const [upcomingSessionsRes, allSessionsRes, queueRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, scheduled_date, status, schedules!schedule_id(day_of_week, start_time, end_time)")
      .eq("user_id", userId)
      .gte("scheduled_date", today)
      .order("scheduled_date", { ascending: true })
      .limit(5),
    supabase
      .from("sessions")
      .select("id, scheduled_date, status, schedules!schedule_id(day_of_week, start_time)")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: false })
      .limit(10),
    supabase
      .from("learning_queue")
      .select("id, lesson_id, status, progress_pct, lessons!lesson_id(title, estimated_duration_minutes)")
      .eq("user_id", userId),
  ]);

  type ScheduleInfo = { day_of_week: string; start_time: string; end_time?: string };

  const upcomingSessions = (upcomingSessionsRes.data ?? []).map((s) => {
    const sched = s.schedules as ScheduleInfo | null;
    return {
      id: s.id,
      scheduledDate: s.scheduled_date,
      status: s.status,
      dayOfWeek: sched?.day_of_week ?? null,
      startTime: sched?.start_time ?? null,
      endTime: sched?.end_time ?? null,
    };
  });

  const sessionHistory = (allSessionsRes.data ?? []).map((s) => {
    const sched = s.schedules as Pick<ScheduleInfo, "day_of_week" | "start_time"> | null;
    return {
      id: s.id,
      scheduledDate: s.scheduled_date,
      status: s.status,
      dayOfWeek: sched?.day_of_week ?? null,
      startTime: sched?.start_time ?? null,
    };
  });

  type LessonInfo = { title: string; estimated_duration_minutes: number };
  const queueItems = (queueRes.data ?? []).map((q) => {
    const lesson = q.lessons as LessonInfo | null;
    return {
      id: q.id,
      lessonId: q.lesson_id,
      status: q.status,
      progressPct: q.progress_pct,
      lessonTitle: lesson?.title ?? null,
      estimatedDuration: lesson?.estimated_duration_minutes ?? null,
    };
  });

  // Completion stats — fetch all sessions for user
  const { data: allStatusSessions } = await supabase
    .from("sessions")
    .select("status")
    .eq("user_id", userId);

  const completedSessions = (allStatusSessions ?? []).filter((s) => s.status === "completed").length;
  const totalSessions = (allStatusSessions ?? []).length;

  // Calculate streak from daily quest history (consecutive days)
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
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // GMAT composite score from users table (updated on each quest completion)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const db = supabase as any;

  const [userRecord, recentAttempts] = await Promise.all([
    supabase
      .from("users")
      .select("target_score, current_composite")
      .eq("id", userId)
      .limit(1)
      .maybeSingle(),
    db
      .from("full_gmat_attempts")
      .select("total_score, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: true }),
  ]);

  const totalScore = userRecord.data?.current_composite ?? 205;
  const targetScore = userRecord.data?.target_score ?? null;

  // weeklyDelta: improvement in GMAT composite this week from full test attempts
  const attempts: { total_score: number | null; completed_at: string | null }[] = recentAttempts.data ?? [];
  const thisWeekAttempts = attempts.filter(
    (a) => a.completed_at && new Date(a.completed_at) >= sevenDaysAgo
  );
  let weeklyDelta = 0;
  if (thisWeekAttempts.length >= 2) {
    const first = thisWeekAttempts[0].total_score ?? 0;
    const last = thisWeekAttempts[thisWeekAttempts.length - 1].total_score ?? 0;
    weeklyDelta = last - first;
  } else if (thisWeekAttempts.length === 1 && attempts.length >= 2) {
    const prevAttempt = attempts[attempts.length - 2];
    const currAttempt = thisWeekAttempts[0];
    weeklyDelta = (currAttempt.total_score ?? 0) - (prevAttempt.total_score ?? 0);
  }

  const pendingLessons = queueItems.filter((q) => q.status !== "completed");
  const completedLessons = queueItems.filter((q) => q.status === "completed");

  // Topics with subtopic counts
  const [topicsRes, subtopicsCountRes] = await Promise.all([
    supabase
      .from("topics")
      .select("id, slug, name, order_index")
      .order("order_index", { ascending: true }),
    supabase
      .from("subtopics")
      .select("id, topic_id"),
  ]);

  const subtopicsByTopic: Record<string, number> = {};
  for (const st of subtopicsCountRes.data ?? []) {
    subtopicsByTopic[st.topic_id] = (subtopicsByTopic[st.topic_id] ?? 0) + 1;
  }

  const topicRows = (topicsRes.data ?? []).map((t) => ({
    slug: t.slug,
    name: t.name,
    subtopicCount: subtopicsByTopic[t.id] ?? 0,
  }));

  // Weekly streak days — based on daily quests
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

  const { data: weekQuestsData } = await supabase
    .from("daily_quests")
    .select("quest_date")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("quest_date", startOfWeekStr)
    .lte("quest_date", today);

  const completedDates = new Set((weekQuestsData ?? []).map((q) => q.quest_date));

  const weeklyStreakDays = DAY_ABBREVS.map((abbrev, idx) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + idx);
    const dateStr = dayDate.toISOString().split("T")[0];
    const completed = completedDates.has(dateStr);
    const isPast = dateStr < today && !completed;
    return { day: abbrev, completed, isPast };
  });

  // Battle zones: correct answers per topic from GMAT quiz sessions
  const { data: userSessions } = await db
    .from("quiz_sessions")
    .select("id, subtopic_id")
    .eq("user_id", userId)
    .eq("source", "gmat");

  let battleZones: { name: string; slug: string; done: number }[] = [];
  const typedSessions: { id: string; subtopic_id: string | null }[] = userSessions ?? [];

  if (typedSessions.length > 0) {
    const sessionIds: string[] = typedSessions.map((s) => s.id);
    const subtopicIdsBySession: Record<string, string> = {};
    for (const s of typedSessions) {
      if (s.subtopic_id) subtopicIdsBySession[s.id] = s.subtopic_id;
    }

    const [answersRes, subtopicsRes] = await Promise.all([
      supabase
        .from("quiz_answers")
        .select("session_id")
        .in("session_id", sessionIds)
        .eq("is_correct", true),
      supabase
        .from("subtopics")
        .select("id, topic_id"),
    ]);

    const subtopicToTopicId: Record<string, string> = {};
    for (const st of subtopicsRes.data ?? []) {
      subtopicToTopicId[st.id] = st.topic_id;
    }

    const topicIdsInUse = new Set<string>(
      typedSessions.filter((s) => s.subtopic_id).map((s) => subtopicToTopicId[s.subtopic_id!]).filter((id): id is string => Boolean(id))
    );

    const { data: topicsData } = await supabase
      .from("topics")
      .select("id, name, slug, order_index")
      .in("id", Array.from(topicIdsInUse))
      .order("order_index", { ascending: true });

    const topicById: Record<string, { name: string; slug: string }> = {};
    for (const t of topicsData ?? []) {
      topicById[t.id] = { name: t.name, slug: t.slug };
    }

    const correctByTopic: Record<string, number> = {};
    for (const ans of answersRes.data ?? []) {
      const subtopicId = subtopicIdsBySession[ans.session_id];
      if (!subtopicId) continue;
      const topicId = subtopicToTopicId[subtopicId];
      if (!topicId) continue;
      correctByTopic[topicId] = (correctByTopic[topicId] ?? 0) + 1;
    }

    battleZones = (topicsData ?? []).map((t) => ({
      name: t.name,
      slug: t.slug,
      done: correctByTopic[t.id] ?? 0,
    }));
  }

  // Today's study time
  const { data: todayScheduleData } = await supabase
    .from("schedules")
    .select("start_time")
    .eq("user_id", userId)
    .eq("day_of_week", todayDayOfWeek)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const todayStudyTime = todayScheduleData?.start_time ?? null;

  // Friends scores — use current_composite from their user records
  const { data: friendRows } = await supabase
    .from("friendships")
    .select("friend_user_id, users!friend_user_id(display_name, avatar_url, current_composite)")
    .eq("user_id", userId)
    .eq("status", "accepted");

  type FriendUserInfo = { display_name: string | null; avatar_url: string | null; current_composite: number | null };

  const friendsScores = (friendRows ?? []).map((f) => {
    const userInfo = f.users as FriendUserInfo | null;
    return {
      id: f.friend_user_id,
      displayName: userInfo?.display_name ?? null,
      avatarUrl: userInfo?.avatar_url ?? null,
      totalScore: userInfo?.current_composite ?? 205,
      weeklyDelta: 0,
    };
  });

  return {
    upcomingSessions,
    queueItems: pendingLessons.slice(0, 3),
    totalQueueCount: pendingLessons.length,
    completedLessonCount: completedLessons.length,
    completedSessions,
    totalSessions,
    streak,
    totalScore,
    weeklyDelta,
    topics: topicRows,
    weeklyStreakDays,
    battleZones,
    todayStudyTime,
    targetScore,
    friendsScores,
  };
}
