import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { mentorBookingHtml } from "@/lib/email/templates";

const MENTOR_EMAIL = process.env.MENTOR_EMAIL ?? "hikmatullahkust@gmail.com";
const MENTOR_MEET_LINK = process.env.MENTOR_MEET_LINK;

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerk = await currentUser();
  const studentName = clerk?.fullName ?? clerk?.firstName ?? "A student";
  const studentEmail = clerk?.emailAddresses?.[0]?.emailAddress ?? "unknown@email.com";

  const { day, time } = (await req.json()) as { day: string; time: string };
  if (!day || !time) {
    return NextResponse.json({ error: "day and time are required" }, { status: 400 });
  }

  const { subject, html } = mentorBookingHtml({ studentName, studentEmail, day, time, meetLink: MENTOR_MEET_LINK });

  const result = await sendEmail({ to: MENTOR_EMAIL, subject, html, replyTo: studentEmail });

  if (!result) {
    return NextResponse.json(
      { error: "Email not configured — add RESEND_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}
