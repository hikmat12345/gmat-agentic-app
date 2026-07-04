import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, updateUser } from "@/lib/db/queries/users";
import { completeDailyQuest } from "@/lib/db/queries/daily-quest";
import { generateQuestForDate } from "@/lib/adaptive/generate-quest";
import { computeFullGmatScore } from "@/lib/full-gmat/scoring";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { questId, timeElapsedSeconds } = body as {
    questId: string;
    timeElapsedSeconds: number;
  };

  if (!questId || timeElapsedSeconds == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Aggregate results from quest problems
  const { data: problems } = await (supabase as any)
    .from("daily_quest_problems")
    .select("is_correct, difficulty_level")
    .eq("quest_id", questId)
    .not("is_correct", "is", null) as { data: { is_correct: boolean; difficulty_level: number }[] | null };

  const answered = problems ?? [];
  const correctCount = answered.filter((p) => p.is_correct).length;
  const score = correctCount;

  let xpTotal = 0;
  for (const p of answered) {
    if (p.is_correct) {
      const dl = p.difficulty_level;
      if (dl >= 9) xpTotal += 40;
      else if (dl >= 7) xpTotal += 20;
      else if (dl >= 4) xpTotal += 10;
      else xpTotal += 5;
    }
  }

  const quest = await completeDailyQuest(questId, {
    score,
    correctCount,
    xpEarned: xpTotal,
    timeElapsedSeconds,
  });

  // Recompute GMAT section scores from all historical GMAT quiz + daily quest answers
  const { data: gmatAnswers } = await (supabase as any)
    .from("quiz_answers")
    .select("is_correct, quiz_sessions!inner(user_id, subtopic_id, subtopics!inner(topics!inner(subject)))")
    .eq("quiz_sessions.user_id", user.id)
    .eq("quiz_sessions.source", "gmat") as { data: any[] | null };

  const { data: dqProblems } = await (supabase as any)
    .from("daily_quest_problems")
    .select("is_correct, subtopics!inner(topics!inner(subject)), daily_quests!inner(user_id)")
    .eq("daily_quests.user_id", user.id)
    .not("is_correct", "is", null) as { data: any[] | null };

  let verbalCorrect = 0, verbalTotal = 0;
  let quantCorrect = 0, quantTotal = 0;
  let diCorrect = 0, diTotal = 0;

  const countBySubject = (subject: string, isCorrect: boolean) => {
    switch (subject) {
      case "verbal":
        verbalTotal++;
        if (isCorrect) verbalCorrect++;
        break;
      case "quantitative":
        quantTotal++;
        if (isCorrect) quantCorrect++;
        break;
      case "data_insights":
        diTotal++;
        if (isCorrect) diCorrect++;
        break;
      // Legacy SAT subjects still tracked for backward compat
      case "math":
        quantTotal++;
        if (isCorrect) quantCorrect++;
        break;
      case "reading_writing":
        verbalTotal++;
        if (isCorrect) verbalCorrect++;
        break;
    }
  };

  for (const a of gmatAnswers ?? []) {
    const session = a.quiz_sessions as { subtopics: { topics: { subject: string } } };
    const subject = session?.subtopics?.topics?.subject;
    if (subject) countBySubject(subject, a.is_correct);
  }

  for (const p of dqProblems ?? []) {
    const subtopic = p.subtopics as { topics: { subject: string } };
    const subject = subtopic?.topics?.subject;
    if (subject) countBySubject(subject, p.is_correct);
  }

  // Compute GMAT section scores using real raw counts
  const { verbalScaled, quantScaled, diScaled, total } = computeFullGmatScore(
    verbalCorrect,
    quantCorrect,
    diCorrect,
    verbalTotal || 23,
    quantTotal || 21,
    diTotal || 20
  );

  const updates: Record<string, number> = {
    currentComposite: total,
    currentVerbal: verbalScaled,
    currentQuantitative: quantScaled,
    currentDataInsights: diScaled,
  };

  if (user.startComposite == null) {
    updates.startComposite = total;
  }

  await updateUser(clerkId, updates);

  // Pre-generate tomorrow's quest (non-blocking)
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];
    await generateQuestForDate(user.id, tomorrowDate, total);
  } catch (e) {
    console.error("Failed to pre-generate tomorrow's quest:", e);
  }

  return NextResponse.json({
    quest,
    scores: {
      verbal: verbalScaled,
      quantitative: quantScaled,
      dataInsights: diScaled,
      composite: total,
    },
  });
}
