import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmailHtml } from "@/lib/email/templates";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingUser = await getUserByClerkId(clerkUser.id);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    undefined;

  let admin;
  try {
    admin = getAdminClient();
  } catch (e) {
    console.error("[sync] admin client init failed:", e);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { data: row, error } = await admin
    .from("users")
    .upsert(
      {
        clerk_id: clerkUser.id,
        email,
        display_name: displayName ?? null,
        avatar_url: clerkUser.imageUrl || null,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[sync] upsert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const user = row
    ? {
        id: row.id,
        clerkId: row.clerk_id,
        email: row.email,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        onboardingCompleted: row.onboarding_completed,
      }
    : null;

  if (!existingUser && email) {
    const { subject, html } = welcomeEmailHtml({
      displayName: displayName || "there",
    });
    sendEmail({ to: email, subject, html }).catch(console.error);
  }

  return NextResponse.json({ user });
}
