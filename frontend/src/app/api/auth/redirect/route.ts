import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(`${base}/sign-in`);
  }

  const user = await getUserByClerkId(userId);

  if (!user || !user.onboardingCompleted) {
    return NextResponse.redirect(`${base}/onboarding`);
  }

  return NextResponse.redirect(`${base}/dashboard`);
}
