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
  const source = searchParams.get("source") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const questionType = searchParams.get("question_type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  let query = db
    .from("problems")
    .select("id, question_text, options, correct_option, difficulty, source, question_type, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (source) query = query.eq("source", source);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (questionType) query = query.eq("question_type", questionType);

  const { data: problems, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    problems: problems ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
