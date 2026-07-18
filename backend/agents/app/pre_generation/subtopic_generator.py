"""
Subtopic Generator Agent — produces rich subtopic metadata for GMAT content.
"""

import json
from agno.agent import Agent
from agno.models.anthropic import Claude

SUBJECT_LABELS = {
    "math": "GMAT Quantitative Reasoning",
    "reading-writing": "GMAT Verbal Reasoning",
    "gmat": "GMAT",
    "verbal": "GMAT Verbal Reasoning",
    "quantitative": "GMAT Quantitative Reasoning",
    "data_insights": "GMAT Data Insights",
}

subtopic_agent = Agent(
    name="GMAT Subtopic Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate comprehensive GMAT subtopic metadata.",
    instructions=[
        "You are an expert GMAT curriculum designer.",
        "Given a subtopic name, its parent topic context, and the subject area, generate rich metadata.",
        "Return ONLY valid JSON with these exact keys:",
        "- description: string (2-3 sentences describing the subtopic in the context of the GMAT)",
        "- learningObjectives: string[] (3-5 specific learning objectives)",
        "- keyFormulas: { latex: string, description: string }[] (key formulas/rules — for Quant use LaTeX notation, for Verbal use logical reasoning rules or reading strategies)",
        "- commonMistakes: { mistake: string, correction: string, why: string }[] (3-5 common student mistakes)",
        "- tipsAndTricks: string[] (3-5 specific strategies for this subtopic)",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- estimatedMinutes: number (study time for this subtopic)",
        "- prerequisiteSubtopicSlugs: string[] (slugs of prerequisite subtopics, can be empty)",
        "- conceptualOverview: { definition: string, realWorldExample: string, satContext: string, visualDescription: string }",
        "For Quantitative: use LaTeX notation like \\frac{a}{b}, x^2, \\sqrt{x}, etc. in keyFormulas.",
        "For Verbal / Data Insights: keyFormulas should contain key reasoning rules, argument structures, or reading techniques (use plain text, not LaTeX).",
        "Be specific to the actual GMAT Focus Edition exam content and format.",
        "Never use em-dashes (—) in any text fields.",
        "Emojis are allowed but use them sparingly; do not overuse them.",
        "Return ONLY the JSON object, no markdown code fences or extra text.",
    ],
    markdown=False,
)


async def generate_subtopic(
    name: str,
    topic_name: str,
    topic_id: str,
    order_index: int,
    all_subtopic_names: list[str],
    subject: str = "math",
) -> dict:
    """Generate rich subtopic metadata via LLM."""
    subject_label = SUBJECT_LABELS.get(subject, "GMAT")
    prompt = (
        f"Subject: {subject_label}\n"
        f"Parent Topic: {topic_name}\n"
        f"Subtopic: {name}\n"
        f"Order Index (within topic): {order_index}\n"
        f"All subtopics in this topic: {', '.join(all_subtopic_names)}\n\n"
        "Generate the complete subtopic metadata JSON."
    )
    response = await subtopic_agent.arun(prompt)
    data = json.loads(response.content)

    slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "")
    return {
        "topic_id": topic_id,
        "slug": slug,
        "name": name,
        "order_index": order_index,
        "description": data["description"],
        "learning_objectives": data["learningObjectives"],
        "key_formulas": data["keyFormulas"],
        "common_mistakes": data["commonMistakes"],
        "tips_and_tricks": data["tipsAndTricks"],
        "difficulty": data["difficulty"],
        "estimated_minutes": data["estimatedMinutes"],
        "prerequisite_subtopic_slugs": data["prerequisiteSubtopicSlugs"],
        "conceptual_overview": data["conceptualOverview"],
    }
