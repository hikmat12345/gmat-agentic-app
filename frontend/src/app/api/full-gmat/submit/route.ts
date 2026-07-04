import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, updateUser } from "@/lib/db/queries/users";
import {
  getGmatAttemptAnswers,
  completeGmatAttempt,
  getGmatTestProblems,
} from "@/lib/db/queries/full-gmat";
import {
  getSubsectionSkill,
  upsertSubsectionSkill,
  initializeAllSkills,
  subjectToSectionCategory,
} from "@/lib/db/queries/subsection-skills";
import { updateSkillAfterAnswer } from "@/lib/adaptive/engine";
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
  const { attemptId, verbalTimeSeconds, quantitativeTimeSeconds, dataInsightsTimeSeconds } =
    body as {
      attemptId: string;
      verbalTimeSeconds?: number;
      quantitativeTimeSeconds?: number;
      dataInsightsTimeSeconds?: number;
    };

  if (!attemptId) {
    return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
  }

  const answers = await getGmatAttemptAnswers(attemptId);

  // Count correct per section
  let verbalCorrect = 0, verbalTotal = 0;
  let quantCorrect = 0, quantTotal = 0;
  let diCorrect = 0, diTotal = 0;

  for (const a of answers) {
    if (a.section === "verbal") {
      verbalTotal++;
      if (a.isCorrect) verbalCorrect++;
    } else if (a.section === "quantitative") {
      quantTotal++;
      if (a.isCorrect) quantCorrect++;
    } else if (a.section === "data_insights") {
      diTotal++;
      if (a.isCorrect) diCorrect++;
    }
  }

  const { verbalScaled, quantScaled, diScaled, total } = computeFullGmatScore(
    verbalCorrect, quantCorrect, diCorrect,
    verbalTotal || 23, quantTotal || 21, diTotal || 20
  );

  const vTime = verbalTimeSeconds ?? 0;
  const qTime = quantitativeTimeSeconds ?? 0;
  const dTime = dataInsightsTimeSeconds ?? 0;

  await completeGmatAttempt(attemptId, {
    verbalRawScore: verbalCorrect,
    verbalScaledScore: verbalScaled,
    quantitativeRawScore: quantCorrect,
    quantitativeScaledScore: quantScaled,
    dataInsightsRawScore: diCorrect,
    dataInsightsScaledScore: diScaled,
    totalScore: total,
    verbalTimeSeconds: vTime,
    quantitativeTimeSeconds: qTime,
    dataInsightsTimeSeconds: dTime,
    totalTimeSeconds: vTime + qTime + dTime,
  });

  // Update user scores
  await updateUser(clerkId, {
    currentComposite: total,
    currentVerbal: verbalScaled,
    currentQuantitative: quantScaled,
    currentDataInsights: diScaled,
    ...(user.startComposite == null ? { startComposite: total } : {}),
  });

  // Update subsection skills
  try {
    const { data: attemptRow } = await (supabase as any)
      .from("full_gmat_attempts")
      .select("test_id")
      .eq("id", attemptId)
      .single() as { data: { test_id: string } | null };

    if (attemptRow) {
      const problems = await getGmatTestProblems(attemptRow.test_id);
      const problemMap = new Map(problems.map((p) => [p.problemId, p]));

      const bySubtopic = new Map<string, { isCorrect: boolean; difficultyLevel: number }[]>();

      for (const a of answers) {
        if (a.selectedOption == null) continue;
        const problem = problemMap.get(a.problemId);
        if (!problem?.subtopicId) continue;
        const arr = bySubtopic.get(problem.subtopicId) ?? [];
        arr.push({ isCorrect: a.isCorrect ?? false, difficultyLevel: problem.difficultyLevel ?? 5 });
        bySubtopic.set(problem.subtopicId, arr);
      }

      let totalXpEarned = 0;

      for (const [subtopicId, subtopicAnswers] of bySubtopic) {
        const { data: subtopicData } = await supabase
          .from("subtopics")
          .select("id, topics!inner(subject)")
          .eq("id", subtopicId)
          .limit(1)
          .single();

        if (!subtopicData) continue;
        const topic = subtopicData.topics as unknown as { subject: string };
        const sectionCategory = subjectToSectionCategory(topic?.subject ?? "quantitative");

        let skill = await getSubsectionSkill(user.id, subtopicId);
        if (!skill) {
          await initializeAllSkills(user.id);
          skill = await getSubsectionSkill(user.id, subtopicId);
        }

        if (skill) {
          let currentSkill = skill;
          for (const answer of subtopicAnswers) {
            const mutations = updateSkillAfterAnswer(currentSkill, answer.isCorrect, answer.difficultyLevel);
            totalXpEarned += mutations.xp - currentSkill.xp;
            currentSkill = { ...currentSkill, ...mutations };
          }

          await upsertSubsectionSkill(user.id, subtopicId, sectionCategory, {
            level: currentSkill.level,
            xp: currentSkill.xp,
            totalAttempts: currentSkill.totalAttempts,
            correctAttempts: currentSkill.correctAttempts,
            last10: currentSkill.last10,
            streakCorrect: currentSkill.streakCorrect,
            streakWrong: currentSkill.streakWrong,
            lastSeenAt: new Date().toISOString(),
          });
        }
      }

      if (totalXpEarned > 0) {
        await updateUser(clerkId, { totalXp: (user.totalXp ?? 0) + totalXpEarned });
      }
    }
  } catch (e) {
    console.error("Failed to update subsection skills:", e);
  }

  return NextResponse.json({
    verbalRawScore: verbalCorrect,
    verbalScaledScore: verbalScaled,
    quantitativeRawScore: quantCorrect,
    quantitativeScaledScore: quantScaled,
    dataInsightsRawScore: diCorrect,
    dataInsightsScaledScore: diScaled,
    totalScore: total,
  });
}
