import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { missedDate } = body as { missedDate?: string };

  if (missedDate) {
    // Insert a placeholder quest row so the status check no longer fires for this date.
    // The status endpoint treats any existing row (even non-completed) as "started",
    // which clears the accountability lock for that date.
    await (supabase as any)
      .from("daily_quests")
      .upsert(
        {
          user_id: user.id,
          quest_date: missedDate,
          status: "pending",
        },
        { onConflict: "user_id,quest_date", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ success: true });
}
