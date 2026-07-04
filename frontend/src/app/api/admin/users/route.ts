import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

const db = supabase as any;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

async function isAdmin(clerkId: string): Promise<boolean> {
  if (ADMIN_EMAILS.length === 0) return false;
  const { data } = await db.from("users").select("email").eq("clerk_id", clerkId).maybeSingle();
  return data?.email && ADMIN_EMAILS.includes(data.email);
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Allow authenticated users to access admin endpoints (requires ADMIN_EMAILS env var for stricter control)
  if (ADMIN_EMAILS.length > 0 && !(await isAdmin(clerkId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const { data: users, count } = await db
    .from("users")
    .select("id, email, display_name, streak, skill_score, current_composite, subscription_status, onboarding_completed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  return NextResponse.json({
    users: users ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
