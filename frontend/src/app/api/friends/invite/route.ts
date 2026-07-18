import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { friendInviteHtml } from "@/lib/email/templates";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const clerk = await currentUser();
  const inviterName =
    clerk?.fullName ?? clerk?.firstName ?? user.displayName ?? "A friend";
  const inviterScore = user.currentComposite ?? 0;

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Use admin client so RLS doesn't block reading other users' emails
  const admin = getAdminClient();

  const { data: friendUser } = await admin
    .from("users")
    .select("id, email, display_name")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  // Friend not on Athena yet — send invitation email
  if (!friendUser) {
    const { subject, html } = friendInviteHtml({ inviterName, inviterScore });
    const result = await sendEmail({ to: email, subject, html }).catch((err) => {
      console.error("[friends/invite] email send failed:", err);
      return null;
    });

    if (!result) {
      console.error("[friends/invite] Could not send invite to:", email);
      return NextResponse.json(
        { error: "Could not send invitation email. Check RESEND_API_KEY is set and restart the server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invited: true,
      message: "Invitation sent! They'll get an email to join Athena.",
    });
  }

  if (friendUser.id === user.id) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  // Check if friendship already exists
  const { data: existing } = await admin
    .from("friendships")
    .select("id")
    .eq("user_id", user.id)
    .eq("friend_user_id", friendUser.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Friend already added" }, { status: 409 });
  }

  const { data: friendship } = await admin
    .from("friendships")
    .insert({
      user_id: user.id,
      friend_user_id: friendUser.id,
      status: "pending",
    })
    .select()
    .single();

  // Notify the friend that they were added
  if (friendUser.email) {
    const { subject, html } = friendInviteHtml({ inviterName, inviterScore });
    sendEmail({ to: friendUser.email, subject, html }).catch(console.error);
  }

  return NextResponse.json({ friendship });
}
