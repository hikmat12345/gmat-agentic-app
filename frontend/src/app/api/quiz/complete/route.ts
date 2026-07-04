import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, updateUser } from "@/lib/db/queries/users";
import { getUserQuizAttempts, getQuestionById, getQuizQuestions } from "@/lib/db/queries/quiz";
import { upsertOnboardingProgress } from "@/lib/db/queries/onboarding";
import { calculateSkillScore } from "@/lib/scoring";
import { computeFullGmatScore } from "@/lib/full-gmat/scoring";
import { NextResponse } from "next/server";

// Map onboarding question categories to GMAT sections
function categoryToSection(category: string): "verbal" | "quantitative" | "data_insights" | null {
  const c = category.toLowerCase().trim();
  if (c === "verbal" || c === "critical_reasoning" || c === "reading_comprehension" ||
      c === "reading-writing" || c === "english" || c === "reading" || c === "writing") {
    return "verbal";
  }
  if (c === "quantitative" || c === "math" || c === "problem_solving" || c === "arithmetic") {
    return "quantitative";
  }
  if (c === "data_insights" || c === "data sufficiency" || c === "data_sufficiency" ||
      c === "integrated reasoning" || c === "reasoning") {
    return "data_insights";
  }
  return null;
}

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [attempts, quizQuestions] = await Promise.all([
    getUserQuizAttempts(user.id),
    getQuizQuestions(),
  ]);

  const attemptsWithDifficulty = await Promise.all(
    attempts.map(async (a) => {
      const q = await getQuestionById(a.questionId);
      return { difficulty: q?.difficulty ?? "easy", isCorrect: a.isCorrect, category: q?.category ?? "" };
    })
  );

  // SAT legacy skill score
  const skillScore = calculateSkillScore(attemptsWithDifficulty);

  // GMAT section baseline from category distribution
  let verbalCorrect = 0, verbalTotal = 0;
  let quantCorrect = 0, quantTotal = 0;
  let diCorrect = 0, diTotal = 0;
  let unknownCorrect = 0, unknownTotal = 0;

  for (const a of attemptsWithDifficulty) {
    const section = categoryToSection(a.category);
    switch (section) {
      case "verbal":
        verbalTotal++;
        if (a.isCorrect) verbalCorrect++;
        break;
      case "quantitative":
        quantTotal++;
        if (a.isCorrect) quantCorrect++;
        break;
      case "data_insights":
        diTotal++;
        if (a.isCorrect) diCorrect++;
        break;
      default:
        unknownTotal++;
        if (a.isCorrect) unknownCorrect++;
    }
  }

  // If category mapping failed for most questions, distribute evenly across sections
  if (unknownTotal > verbalTotal + quantTotal + diTotal) {
    const third = Math.floor(unknownTotal / 3);
    const remainder = unknownTotal % 3;
    const cV = Math.floor(unknownCorrect / 3);
    const cQ = Math.floor(unknownCorrect / 3);
    const cDI = unknownCorrect - cV - cQ;
    verbalTotal += third; verbalCorrect += cV;
    quantTotal += third; quantCorrect += cQ;
    diTotal += third + remainder; diCorrect += cDI;
  }

  // Compute GMAT scores — use real section totals if available, else fallback to full-test denominators
  const { verbalScaled, quantScaled, diScaled, total } = computeFullGmatScore(
    verbalCorrect,
    quantCorrect,
    diCorrect,
    Math.max(verbalTotal, 1),
    Math.max(quantTotal, 1),
    Math.max(diTotal, 1),
  );

  const updates: Record<string, number | boolean> = { skillScore };

  // Only set GMAT baseline if not already set (first diagnostic)
  if (user.currentComposite == null || user.currentComposite === 0) {
    updates.currentComposite = total;
    updates.currentVerbal = verbalScaled;
    updates.currentQuantitative = quantScaled;
    updates.currentDataInsights = diScaled;
  }
  if (user.startComposite == null || user.startComposite === 0) {
    updates.startComposite = total;
  }

  await updateUser(clerkId, updates as {
    skillScore?: number;
    currentComposite?: number;
    currentVerbal?: number;
    currentQuantitative?: number;
    currentDataInsights?: number;
    startComposite?: number;
  });
  await upsertOnboardingProgress(user.id, { currentStep: "schedule" });

  return NextResponse.json({
    skillScore,
    totalQuestions: quizQuestions.length,
    correctCount: attempts.filter((a) => a.isCorrect).length,
    gmatScores: { verbal: verbalScaled, quantitative: quantScaled, dataInsights: diScaled, composite: total },
  });
}
