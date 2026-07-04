import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { requirePremium } from "@/lib/subscription";

const AGENT_URL = process.env.AGENT_SERVICE_URL || "http://localhost:8080";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const access = await requirePremium(user.id);
  if (!access.ok) {
    return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
  }

  const body = await req.json();
  const {
    topic,
    subtopic,
    description,
    learningObjectives,
    keyFormulas,
    commonMistakes,
    tipsAndTricks,
    conceptualOverview,
  } = body as {
    topic: string;
    subtopic: string;
    description?: string;
    learningObjectives?: string[];
    keyFormulas?: { latex: string; description: string }[];
    commonMistakes?: { mistake: string; correction: string; why: string }[];
    tipsAndTricks?: string[];
    conceptualOverview?: {
      definition: string;
      realWorldExample: string;
      satContext: string;
    };
  };

  if (!topic || !subtopic) {
    return NextResponse.json(
      { error: "Topic and subtopic are required" },
      { status: 400 }
    );
  }

  // Normalize common_mistakes: seed data may store strings; backend expects objects
  const normalizedCommonMistakes = (commonMistakes || []).map((m: unknown) =>
    typeof m === "string"
      ? { mistake: m, correction: "", why: "" }
      : (m as { mistake: string; correction: string; why: string })
  );

  // Normalize key_formulas: seed data may store strings; backend expects objects
  const normalizedKeyFormulas = (keyFormulas || []).map((f: unknown) =>
    typeof f === "string"
      ? { latex: f, description: "" }
      : (f as { latex: string; description: string })
  );

  try {
    const res = await fetch(`${AGENT_URL}/micro-lesson/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        subtopic,
        description: description || "",
        learning_objectives: learningObjectives || [],
        key_formulas: normalizedKeyFormulas,
        common_mistakes: normalizedCommonMistakes,
        tips_and_tricks: tipsAndTricks || [],
        conceptual_overview: conceptualOverview
          ? {
              definition: (conceptualOverview as Record<string, string>).definition || "",
              real_world_example: (conceptualOverview as Record<string, string>).real_world_example || (conceptualOverview as Record<string, string>).realWorldExample || "",
              sat_context: (conceptualOverview as Record<string, string>).sat_context || (conceptualOverview as Record<string, string>).satContext || "",
            }
          : null,
      }),
    });

    if (!res.ok || !res.body) {
      const errorBody = await res.text().catch(() => "no body");
      console.error(
        `[agent/micro-lesson/stream] Agent returned ${res.status}:`,
        errorBody
      );
      throw new Error(`Agent service returned ${res.status}: ${errorBody}`);
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[agent/micro-lesson/stream] Error:", err);
    return NextResponse.json(
      {
        error:
          "AI lesson generator is currently unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}
