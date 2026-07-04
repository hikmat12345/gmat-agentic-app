import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const MENTOR_EMAIL = process.env.MENTOR_EMAIL ?? "hikmat12@yopmail.com";

function buildHtml(studentName: string, studentEmail: string, day: string, time: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:#1a1a2e;padding:24px 32px;">
        <h2 style="margin:0;color:#f5a623;font-size:20px;letter-spacing:-0.3px;">Athena — New Mentor Booking</h2>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 8px;font-size:15px;color:#374151;">You have a new session request:</p>
        <table style="width:100%;margin:20px 0;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:120px;">Student</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${studentName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">
              <a href="mailto:${studentEmail}" style="color:#6366f1;text-decoration:none;">${studentEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Day</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${day}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;">Time</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${time}</td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">Reply directly to this email to confirm the session with the student.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Sent via Athena GMAT Coach</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

  const subject = `Booking request: ${studentName} — ${day} at ${time}`;
  const emailHtml = buildHtml(studentName, studentEmail, day, time);

  // Try Resend if key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: MENTOR_EMAIL,
        replyTo: studentEmail,
        subject,
        html: emailHtml,
      });
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Resend failed, trying Gmail SMTP:", err);
    }
  }

  // Free fallback: Gmail SMTP via App Password
  // Add to .env.local:
  //   EMAIL_USER=you@gmail.com
  //   EMAIL_PASS=xxxx xxxx xxxx xxxx   (16-char Gmail App Password)
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json(
      { error: "Email not configured — add EMAIL_USER + EMAIL_PASS (Gmail App Password) to .env.local" },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"Athena GMAT" <${gmailUser}>`,
      to: MENTOR_EMAIL,
      replyTo: studentEmail,
      subject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gmail SMTP booking failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
