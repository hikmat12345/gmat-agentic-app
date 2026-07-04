import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getActiveGmatTests,
  getLastCompletedGmatAttempt,
  getInProgressGmatAttempt,
  createGmatAttempt,
  getGmatTestProblems,
  createGmatAnswerRows,
  getGmatAttemptAnswers,
} from "@/lib/db/queries/full-gmat";
import { FULL_GMAT_COOLDOWN_MS, GMAT_SECTIONS } from "@/types/full-gmat";
import type { GmatSection } from "@/types/full-gmat";
import { requirePremium } from "@/lib/subscription";
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

  const access = await requirePremium(user.id);
  if (!access.ok) {
    return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
  }

  const body = await req.json();
  const { testId, sectionOrder } = body as {
    testId?: string;
    sectionOrder?: GmatSection[];
  };

  // Enforce cooldown
  const lastAttempt = await getLastCompletedGmatAttempt(user.id);
  if (lastAttempt?.completedAt) {
    const elapsed = Date.now() - new Date(lastAttempt.completedAt).getTime();
    if (elapsed < FULL_GMAT_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "You must wait 16 days between full GMAT tests." },
        { status: 429 }
      );
    }
  }

  // Resume in-progress attempt
  const existing = await getInProgressGmatAttempt(user.id);
  if (existing) {
    const [problems, answers, activeTests] = await Promise.all([
      getGmatTestProblems(existing.testId),
      getGmatAttemptAnswers(existing.id),
      getActiveGmatTests(),
    ]);
    const existingRank = Object.fromEntries(existing.sectionOrder.map((s, i) => [s, i]));
    const sortedProblems = [...problems].sort((a, b) => {
      const sectionDiff = (existingRank[a.section] ?? 99) - (existingRank[b.section] ?? 99);
      if (sectionDiff !== 0) return sectionDiff;
      return a.orderIndex - b.orderIndex;
    });
    const safeProblems = sortedProblems.map(({ correctOption: _co, ...p }) => p);
    const resumedTest = activeTests.find((t) => t.id === existing.testId) ?? { id: existing.testId, testNumber: 1, name: "Practice Test", status: "active" as const, createdAt: new Date().toISOString() };
    return NextResponse.json({
      attemptId: existing.id,
      test: resumedTest,
      problems: safeProblems,
      answers,
      sectionOrder: existing.sectionOrder,
      resumed: true,
    });
  }

  // Resolve test to start
  let resolvedTestId = testId;
  if (!resolvedTestId) {
    const tests = await getActiveGmatTests();
    if (tests.length === 0) {
      return NextResponse.json({ error: "No active GMAT tests available" }, { status: 404 });
    }
    resolvedTestId = tests[0].id;
  }

  // Validate + default section order
  const validOrder: GmatSection[] = (sectionOrder ?? GMAT_SECTIONS).filter(
    (s): s is GmatSection => GMAT_SECTIONS.includes(s as GmatSection)
  );
  const order: GmatSection[] =
    validOrder.length === 3 ? validOrder : [...GMAT_SECTIONS];

  // Create the attempt
  const attempt = await createGmatAttempt(user.id, resolvedTestId, order);

  // Load all problems for this test
  const problems = await getGmatTestProblems(resolvedTestId);

  // Sort problems by user-selected section order, then by orderIndex within each section
  const sectionRank = Object.fromEntries(order.map((s, i) => [s, i]));
  const sortedProblems = [...problems].sort((a, b) => {
    const sectionDiff = (sectionRank[a.section] ?? 99) - (sectionRank[b.section] ?? 99);
    if (sectionDiff !== 0) return sectionDiff;
    return a.orderIndex - b.orderIndex;
  });

  // Pre-create answer placeholder rows
  await createGmatAnswerRows(attempt.id, sortedProblems);
  const answers = await getGmatAttemptAnswers(attempt.id);

  // Strip correct answers before sending to client
  const safeProblems = sortedProblems.map(({ correctOption: _co, ...p }) => p);

  return NextResponse.json({
    attemptId: attempt.id,
    test: { id: resolvedTestId },
    problems: safeProblems,
    answers,
    sectionOrder: order,
    resumed: false,
  });
}
