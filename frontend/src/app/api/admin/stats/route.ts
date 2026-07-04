import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

const db = supabase as any;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

async function isAdmin(clerkId: string): Promise<boolean> {
  if (ADMIN_EMAILS.length === 0) return false;
  const { data } = await db.from("users").select("email").eq("clerk_id", clerkId).maybeSingle();
  return data?.email && ADMIN_EMAILS.includes(data.email);
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(clerkId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [usersRes, problemsRes, sessionsRes, attemptsRes, subscriptionsRes] = await Promise.all([
    db.from("users").select("id, created_at, onboarding_completed, subscription_status"),
    db.from("problems").select("id, source, difficulty, question_type"),
    db.from("sessions").select("id, status, created_at"),
    db.from("full_gmat_attempts").select("id, status, total_score, created_at"),
    db.from("subscriptions").select("id, status, plan"),
  ]);

  const users = usersRes.data ?? [];
  const problems = problemsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const subscriptions = subscriptionsRes.data ?? [];

  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const activeSubscriptions = subscriptions.filter((s: any) => ["active", "trialing"].includes(s.status));
  const monthlyRevenue = activeSubscriptions.filter((s: any) => s.plan === "monthly").length * 29;
  const annualRevenue = activeSubscriptions.filter((s: any) => s.plan === "annual").length * (199 / 12);

  return NextResponse.json({
    users: {
      total: users.length,
      onboarded: users.filter((u: any) => u.onboarding_completed).length,
      newLast7: users.filter((u: any) => u.created_at >= last7).length,
      newLast30: users.filter((u: any) => u.created_at >= last30).length,
    },
    problems: {
      total: problems.length,
      bySource: Object.fromEntries(
        ["gmat", "full_gmat", "onboarding", "practice", "sat", "full_sat"].map((src) => [
          src,
          problems.filter((p: any) => p.source === src).length,
        ])
      ),
      byDifficulty: Object.fromEntries(
        ["easy", "medium", "hard"].map((d) => [
          d,
          problems.filter((p: any) => p.difficulty === d).length,
        ])
      ),
      byType: [
        "critical_reasoning","reading_comprehension","problem_solving",
        "data_sufficiency","multi_source_reasoning","table_analysis",
        "graphics_interpretation","two_part_analysis"
      ].reduce<Record<string,number>>((acc, t) => {
        acc[t] = problems.filter((p: any) => p.question_type === t).length;
        return acc;
      }, {}),
    },
    sessions: {
      total: sessions.length,
      completed: sessions.filter((s: any) => s.status === "completed").length,
      last7: sessions.filter((s: any) => s.created_at >= last7).length,
    },
    fullGmatTests: {
      total: attempts.length,
      completed: attempts.filter((a: any) => a.status === "completed").length,
      avgScore: (() => {
        const scored = attempts.filter((a: any) => a.total_score != null);
        return scored.length > 0
          ? Math.round(scored.reduce((sum: number, a: any) => sum + a.total_score, 0) / scored.length)
          : null;
      })(),
    },
    subscriptions: {
      active: activeSubscriptions.length,
      trialing: subscriptions.filter((s: any) => s.status === "trialing").length,
      monthly: subscriptions.filter((s: any) => s.plan === "monthly" && activeSubscriptions.includes(s)).length,
      annual: subscriptions.filter((s: any) => s.plan === "annual" && activeSubscriptions.includes(s)).length,
      estimatedMRR: Math.round(monthlyRevenue + annualRevenue),
    },
  });
}
