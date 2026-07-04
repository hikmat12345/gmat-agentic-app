import { auth } from "@clerk/nextjs/server";
import {
  upsertGmatAnswer,
  updateGmatAttemptPosition,
} from "@/lib/db/queries/full-gmat";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    attemptId,
    problemId,
    section,
    orderIndex,
    selectedOption,
    responseTimeMs,
    currentQuestion,
  } = body as {
    attemptId: string;
    problemId: string;
    section: string;
    orderIndex: number;
    selectedOption: string;
    responseTimeMs?: number;
    currentQuestion: number;
  };

  if (!attemptId || !problemId || !section || orderIndex == null || selectedOption == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Look up the correct answer to compute isCorrect
  const { data: problem } = await (supabase as any)
    .from("problems")
    .select("correct_option, question_type, passage_text")
    .eq("id", problemId)
    .single() as { data: { correct_option: number; question_type: string | null; passage_text: string | null } | null };

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  let isCorrect: boolean;
  if (problem.question_type === "two_part_analysis") {
    // TPA: selectedOption is JSON string {"col1":N,"col2":N}
    // passage_text stores the correct TPA answer JSON (set during seeding)
    try {
      const userAnswer = JSON.parse(selectedOption);
      const correctAnswer = JSON.parse(problem.passage_text ?? "{}");
      isCorrect =
        userAnswer.col1 === correctAnswer.col1 &&
        userAnswer.col2 === correctAnswer.col2;
    } catch {
      isCorrect = false;
    }
  } else {
    // Standard: selectedOption is "0"–"4"
    isCorrect = parseInt(selectedOption, 10) === problem.correct_option;
  }

  await upsertGmatAnswer(attemptId, {
    problemId,
    section,
    orderIndex,
    selectedOption,
    isCorrect,
    responseTimeMs,
  });

  // Update navigation position
  await updateGmatAttemptPosition(attemptId, section, currentQuestion + 1);

  return NextResponse.json({ isCorrect });
}
