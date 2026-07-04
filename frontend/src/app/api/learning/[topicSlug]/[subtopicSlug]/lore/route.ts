import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { WhiteboardStep } from "@/types/whiteboard";

async function resolveSubtopicId(
  topicSlug: string,
  subtopicSlug: string
): Promise<string | null> {
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("slug", topicSlug)
    .limit(1)
    .maybeSingle();

  if (!topic) return null;

  const { data: subtopic } = await supabase
    .from("subtopics")
    .select("id")
    .eq("topic_id", topic.id)
    .eq("slug", subtopicSlug)
    .limit(1)
    .maybeSingle();

  return subtopic?.id ?? null;
}

export async function GET(
  _req: Request,
  {
    params,
  }: { params: Promise<{ topicSlug: string; subtopicSlug: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicSlug, subtopicSlug } = await params;
  const subtopicId = await resolveSubtopicId(topicSlug, subtopicSlug);
  if (!subtopicId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: lore } = await supabase
    .from("subtopic_lore")
    .select("*")
    .eq("subtopic_id", subtopicId)
    .limit(1)
    .maybeSingle();

  if (!lore) {
    return NextResponse.json(null);
  }

  if (lore.status === "generating") {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (new Date(lore.updated_at) < tenMinutesAgo) {
      return NextResponse.json({ status: "stale" });
    }
  }

  return NextResponse.json({
    status: lore.status,
    whiteboardSteps: lore.whiteboard_steps,
  });
}

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ topicSlug: string; subtopicSlug: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicSlug, subtopicSlug } = await params;
  const subtopicId = await resolveSubtopicId(topicSlug, subtopicSlug);
  if (!subtopicId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  if (body.action === "start") {
    const { data: existing } = await supabase
      .from("subtopic_lore")
      .select("*")
      .eq("subtopic_id", subtopicId)
      .limit(1)
      .maybeSingle();

    // Already ready with actual content — don't regenerate
    if (
      existing?.status === "ready" &&
      Array.isArray(existing.whiteboard_steps) &&
      existing.whiteboard_steps.length > 0
    ) {
      return NextResponse.json({ acquired: false });
    }

    // Stuck in generating (empty steps or stale) — reset and acquire
    if (existing) {
      await supabase
        .from("subtopic_lore")
        .update({
          status: "generating",
          whiteboard_steps: [],
          updated_at: new Date().toISOString(),
        })
        .eq("subtopic_id", subtopicId);
      return NextResponse.json({ acquired: true });
    }

    // No row yet — insert fresh
    await supabase.from("subtopic_lore").insert({
      subtopic_id: subtopicId,
      status: "generating",
      whiteboard_steps: [],
    });
    return NextResponse.json({ acquired: true });
  }

  if (body.action === "save") {
    const { whiteboardSteps } = body as {
      whiteboardSteps: WhiteboardStep[];
    };

    await supabase
      .from("subtopic_lore")
      .update({
        status: "ready",
        whiteboard_steps: whiteboardSteps,
        updated_at: new Date().toISOString(),
      })
      .eq("subtopic_id", subtopicId);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
