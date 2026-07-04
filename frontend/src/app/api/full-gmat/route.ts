import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getActiveGmatTests,
  getLastCompletedGmatAttempt,
  getInProgressGmatAttempt,
} from "@/lib/db/queries/full-gmat";
import { FULL_GMAT_COOLDOWN_MS } from "@/types/full-gmat";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [tests, lastAttempt, currentAttempt] = await Promise.all([
    getActiveGmatTests(),
    getLastCompletedGmatAttempt(user.id),
    getInProgressGmatAttempt(user.id),
  ]);

  let canTakeTest = true;
  let nextAvailableDate: string | null = null;

  if (lastAttempt?.completedAt) {
    const completedTime = new Date(lastAttempt.completedAt).getTime();
    const nowTime = Date.now();
    const elapsed = nowTime - completedTime;

    if (elapsed < FULL_GMAT_COOLDOWN_MS) {
      canTakeTest = false;
      const nextDate = new Date(completedTime + FULL_GMAT_COOLDOWN_MS);
      nextAvailableDate = nextDate.toISOString();
    }
  }

  return NextResponse.json({
    tests,
    lastAttempt: lastAttempt
      ? {
          completedAt: lastAttempt.completedAt,
          totalScore: lastAttempt.totalScore,
          testId: lastAttempt.testId,
        }
      : null,
    canTakeTest,
    nextAvailableDate,
    currentAttempt,
  });
}
