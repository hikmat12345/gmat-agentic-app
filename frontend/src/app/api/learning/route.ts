import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subject = request.nextUrl.searchParams.get("subject");

  const db = supabase as any;
  let topicsQuery = db
    .from("topics")
    .select("id, slug, name, icon, color_scheme, overview, estimated_total_minutes, sat_relevance, gmat_relevance, difficulty_distribution, order_index, subject")
    .order("order_index", { ascending: true });

  if (subject) {
    topicsQuery = topicsQuery.eq("subject", subject);
  }

  // Fetch user from DB to get their internal id
  const { data: userRow } = await (db as any)
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  const [topicsRes, subtopicsRes, skillsRes] = await Promise.all([
    topicsQuery,
    supabase
      .from("subtopics")
      .select("id, topic_id, slug, name, difficulty, estimated_minutes, description, order_index")
      .order("order_index", { ascending: true }),
    userRow
      ? (db as any)
          .from("subsection_skills")
          .select("subtopic_id, level, total_attempts, last_seen_at")
          .eq("user_id", userRow.id)
      : Promise.resolve({ data: [] }),
  ]);

  const allTopics = ((topicsRes.data ?? []) as any[]).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    icon: t.icon,
    colorScheme: t.color_scheme,
    overview: t.overview,
    estimatedTotalMinutes: t.estimated_total_minutes,
    satRelevance: t.sat_relevance,
    gmatRelevance: t.gmat_relevance,
    difficultyDistribution: t.difficulty_distribution,
    orderIndex: t.order_index,
    subject: t.subject,
  }));

  const allSubtopics = (subtopicsRes.data ?? []).map((st) => ({
    id: st.id,
    topicId: st.topic_id,
    slug: st.slug,
    name: st.name,
    difficulty: st.difficulty,
    estimatedMinutes: st.estimated_minutes,
    description: st.description,
    orderIndex: st.order_index,
  }));

  // Build a lookup of subtopic skill progress
  const skillMap = new Map<string, { level: number; totalAttempts: number; lastSeenAt: string | null }>();
  for (const s of (skillsRes.data ?? []) as any[]) {
    skillMap.set(s.subtopic_id, {
      level: s.level ?? 0,
      totalAttempts: s.total_attempts ?? 0,
      lastSeenAt: s.last_seen_at ?? null,
    });
  }

  // Compute per-subject position to mark first 3 per subject as free
  const subjectGroups = new Map<string, typeof allTopics>();
  for (const topic of allTopics) {
    const group = subjectGroups.get(topic.subject) ?? [];
    group.push(topic);
    subjectGroups.set(topic.subject, group);
  }
  for (const [subject, group] of subjectGroups) {
    subjectGroups.set(subject, [...group].sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const topicsWithSubtopics = allTopics.map((topic) => {
    const group = subjectGroups.get(topic.subject) ?? [];
    const posInSubject = group.findIndex((t) => t.id === topic.id);
    const topicSubtopics = allSubtopics.filter((st) => st.topicId === topic.id);
    const completedSubtopics = topicSubtopics.filter((st) => (skillMap.get(st.id)?.level ?? 0) >= 5).length;
    const startedSubtopics = topicSubtopics.filter((st) => (skillMap.get(st.id)?.totalAttempts ?? 0) > 0).length;
    return {
      ...topic,
      isFree: posInSubject < 3,
      subtopics: topicSubtopics,
      completedSubtopics,
      startedSubtopics,
    };
  });

  // Find most recently practiced subtopic for "Continue" banner
  let recentSubtopic: { subtopicId: string; subtopicName: string; subtopicSlug: string; topicName: string; topicSlug: string; lastSeenAt: string } | null = null;
  if (skillsRes.data && (skillsRes.data as any[]).length > 0) {
    const withDate = (skillsRes.data as any[]).filter((s) => s.last_seen_at).sort(
      (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
    );
    if (withDate.length > 0) {
      const latest = withDate[0];
      const subtopic = allSubtopics.find((st) => st.id === latest.subtopic_id);
      if (subtopic) {
        const topic = allTopics.find((t) => t.id === subtopic.topicId);
        if (topic) {
          recentSubtopic = {
            subtopicId: subtopic.id,
            subtopicName: subtopic.name,
            subtopicSlug: subtopic.slug,
            topicName: topic.name,
            topicSlug: topic.slug,
            lastSeenAt: latest.last_seen_at,
          };
        }
      }
    }
  }

  return NextResponse.json({ topics: topicsWithSubtopics, recentSubtopic });
}
