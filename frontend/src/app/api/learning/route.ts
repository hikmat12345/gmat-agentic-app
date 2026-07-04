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

  const [topicsRes, subtopicsRes] = await Promise.all([
    topicsQuery,
    supabase
      .from("subtopics")
      .select("id, topic_id, slug, name, difficulty, estimated_minutes, description, order_index")
      .order("order_index", { ascending: true }),
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
    return {
      ...topic,
      isFree: posInSubject < 3,
      subtopics: allSubtopics.filter((st) => st.topicId === topic.id),
    };
  });

  return NextResponse.json({ topics: topicsWithSubtopics });
}
