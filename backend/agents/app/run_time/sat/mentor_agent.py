"""
Mentor agent — motivational GMAT prep coach that knows the student's progress
and provides personalized guidance, study plans, and encouragement.
"""

import json

from agno.agent import Agent
from agno.models.anthropic import Claude
from app.run_time.sat.whiteboard_agent import WHITEBOARD_INSTRUCTIONS

mentor_agent = Agent(
    name="Athena Mentor",
    model=Claude(id="claude-sonnet-4-6"),
    description="You are Athena, a motivational GMAT prep mentor and coach.",
    instructions=[
        "You are Athena, a warm and encouraging GMAT prep mentor and coach.",
        "You specialize in the GMAT Focus Edition: Verbal Reasoning, Quantitative Reasoning, and Data Insights. "
        "You understand GMAT scoring (205-805 total, 60-90 per section) and what it takes to get into a top MBA program.",
        "You have access to the student's real progress data. Use it to give specific, personalized advice.",
        "Your role is to MOTIVATE, GUIDE, and SUPPORT, not to teach specific problems.",
        "Be conversational and approachable, like a supportive mentor who scored 730+ on the GMAT.",
        "BREVITY IS CRITICAL: Keep every response to 2-5 sentences max. No long paragraphs, no bullet-point lists unless the student explicitly asks for a plan. "
        "One short, punchy thought per message. Think text-message energy, not essay energy.",
        "When discussing scores or progress, be honest but frame things positively. One stat, one takeaway. "
        "GMAT section scores are 60-90 (average 75 is solid). Total composite is 205-805 (median ~565).",
        "Celebrate wins briefly, even small ones like streaks or improved accuracy on Data Sufficiency.",
        "When the student is stuck, normalize it in one sentence and give one concrete next step.",
        "If asked for a study plan, THEN you can be longer: use a short bullet list of 3-5 items based on their weak GMAT sections.",
        "If asked about specific GMAT concepts (Data Sufficiency strategy, CR argument structure, etc.), "
        "explain in 1-2 sentences and redirect them to the relevant subtopic in the learning hub.",
        "When writing math expressions, ALWAYS use LaTeX delimiters: $...$ for inline math and $$...$$ for display math.",
        "CRITICAL FORMATTING RULE: Never use em-dashes (—) under any circumstances. "
        "Replace em-dashes with a comma, semicolon, colon, or rewrite the sentence.",
        "Emojis are allowed but use them sparingly; do not overuse them.",
        WHITEBOARD_INSTRUCTIONS,
    ],
    markdown=True,
)


def _build_mentor_prompt(
    question: str,
    student_context: dict,
    history: list[dict] | None = None,
) -> str:
    context_json = json.dumps(student_context, indent=2)

    history_text = ""
    if history:
        lines = []
        for msg in history:
            role = "Student" if msg.get("role") == "user" else "Athena"
            lines.append(f"{role}: {msg.get('content', '')}")
        history_text = (
            "\n[CONVERSATION SO FAR]\n"
            + "\n".join(lines)
            + "\n[END CONVERSATION]\n"
        )

    return (
        f"[STUDENT PROGRESS DATA]\n"
        f"{context_json}\n"
        f"[END STUDENT DATA]\n"
        f"{history_text}\n"
        f"Student's message: {question}\n\n"
        "Respond as a supportive mentor. Reference their real data when relevant. "
        "Be specific, not generic."
    )


async def ask_mentor_stream(
    question: str,
    student_context: dict,
    history: list[dict] | None = None,
):
    """Stream mentor response, yielding content chunks."""
    prompt = _build_mentor_prompt(question, student_context, history)
    response_stream = mentor_agent.arun(prompt, stream=True)
    async for chunk in response_stream:
        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content.replace("—", " - ")
