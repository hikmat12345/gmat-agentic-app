import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getUserSchedules } from "@/lib/db/queries/schedules";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Returns whether the user has a missed quest that locks practice.
 * A quest is "missed" if:
 *  - Yesterday (or further back, up to 3 days) was a scheduled study day
 *  - No quest was completed on that day
 *  - The user has completed at least one quest ever (grace period for new users)
 */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ locked: false });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ locked: false });

  const schedules = await getUserSchedules(user.id);
  if (schedules.length === 0) return NextResponse.json({ locked: false });

  const activeDays = new Set(schedules.filter((s) => s.isActive).map((s) => s.dayOfWeek.toLowerCase()));
  if (activeDays.size === 0) return NextResponse.json({ locked: false });

  // Check the last 3 days for any missed scheduled session
  const now = new Date();
  let missedDate: string | null = null;

  for (let daysBack = 1; daysBack <= 3; daysBack++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - daysBack);
    const dayName = DAY_NAMES[checkDate.getDay()];
    const dateStr = checkDate.toISOString().split("T")[0];

    if (!activeDays.has(dayName)) continue;

    // Check if a quest was completed on that day
    const { data } = await (supabase as any)
      .from("daily_quests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("quest_date", dateStr)
      .eq("status", "completed")
      .limit(1)
      .maybeSingle();

    if (!data) {
      // Check if any quest exists at all (not just completed) to distinguish skip vs never started
      const { data: anyQuest } = await (supabase as any)
        .from("daily_quests")
        .select("id")
        .eq("user_id", user.id)
        .eq("quest_date", dateStr)
        .limit(1)
        .maybeSingle();

      if (!anyQuest) {
        // No quest was even started — check if they have any completed quests (not a brand new user)
        const { data: hasHistory } = await (supabase as any)
          .from("daily_quests")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .limit(1)
          .maybeSingle();

        if (hasHistory) {
          missedDate = dateStr;
          break;
        }
      }
    }
  }

  if (!missedDate) return NextResponse.json({ locked: false });

  return NextResponse.json({
    locked: true,
    missedDate,
    message: `You missed your scheduled study session on ${missedDate}. Complete your accountability check to continue.`,
  });
}
