"""
GMAT Problem Generator — produces GMAT Focus Edition problems for all 8 question types.

Question types and their unique requirements:
  - problem_solving       : 5 options A-E, quantitative reasoning
  - critical_reasoning    : 5 options A-E, argument-based, verbal
  - reading_comprehension : passage in passage_text, 5 options, verbal
  - data_sufficiency      : fixed A-E choices (per GMAC), quantitative/DI
  - multi_source_reasoning: JSON tabs in passage_text, 5 options, DI
  - table_analysis        : sortable table JSON in chart_data, 5 options, DI
  - graphics_interpretation: chart JSON in chart_data, 5 options, DI
  - two_part_analysis     : 5-6 rows × 2 cols, col labels in hint, DI/verbal/quant
"""

import json
import re
from agno.agent import Agent
from agno.models.anthropic import Claude

BATCH_SIZE = 5   # Smaller batches for GMAT — more complex output structures
MAX_RETRIES = 3

# Fixed DS answer choices (always the same, per GMAC)
DS_OPTIONS = [
    "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "EACH statement ALONE is sufficient.",
    "Statements (1) and (2) TOGETHER are NOT sufficient to answer the question asked, and additional data are needed.",
]


# ── Shared JSON extractor ──────────────────────────────────────────────────────

def _extract_json_array(text: str) -> list[dict]:
    content = text.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0].strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    start = content.find("[")
    if start == -1:
        raise ValueError("No JSON array found in response")
    try:
        return json.loads(content[start:])
    except json.JSONDecodeError:
        pass
    last_brace = content.rfind("}")
    if last_brace == -1:
        raise ValueError("No complete JSON objects found")
    truncated = content[start: last_brace + 1].rstrip().rstrip(",")
    if not truncated.endswith("]"):
        truncated += "]"
    try:
        return json.loads(truncated)
    except json.JSONDecodeError:
        pass
    objects = []
    for match in re.finditer(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content):
        try:
            obj = json.loads(match.group())
            if "questionText" in obj:
                objects.append(obj)
        except json.JSONDecodeError:
            continue
    if objects:
        return objects
    raise ValueError(f"Could not parse JSON from LLM output (length={len(content)})")


# ── Problem Solving & Critical Reasoning ─────────────────────────────────────

_standard_agent = Agent(
    name="GMAT Standard Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate realistic GMAT Focus Edition problems.",
    instructions=[
        "You are an expert GMAT problem writer for GMAT Focus Edition.",
        "Generate GMAT-style multiple choice problems with EXACTLY 5 answer choices (A-E).",
        "Return ONLY a valid JSON array of problem objects with these exact keys:",
        "- questionType: string (the GMAT question type — e.g. 'problem_solving', 'critical_reasoning')",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- questionText: string (problem text — use LaTeX $...$ for math notation)",
        "- options: string[] (exactly 5 choices A-E)",
        "- correctOption: number (0-4, index of the correct answer)",
        "- explanation: string (full explanation, concise)",
        "- solutionSteps: { step: number, instruction: string, math: string }[] (2-4 steps)",
        "- conceptTags: string[] (e.g. 'algebra', 'argument-structure', 'weaken')",
        "- hint: string (nudge without giving the answer)",
        "- detailedHint: string (step-by-step without final answer)",
        "- timeRecommendationSeconds: number (GMAT target: PS ~120, CR ~150)",
        "- gmatFrequency: string ('high' | 'medium' | 'low')",
        "Never use em-dashes (—). Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_standard_batch(
    question_type: str,
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
    section: str,
) -> list[dict]:
    subject_label = "GMAT Verbal Reasoning" if section == "verbal" else "GMAT Quantitative Reasoning"
    qt_label = "Critical Reasoning" if question_type == "critical_reasoning" else "Problem Solving"
    prompt = (
        f"Subject: {subject_label}\n"
        f"Question type: {qt_label} ({question_type})\n"
        f"Topic: {topic_name}\n"
        f"Subtopic: {subtopic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} {difficulty} {qt_label} problems covering {subtopic_name}.\n"
        "Each problem must have EXACTLY 5 answer choices (A-E).\n"
        "Make each problem unique. Do not repeat question structures from earlier batches."
    )
    return await _run_standard_agent(prompt, subtopic_id, question_type, start_order_index, batch_size, section)


async def _run_standard_agent(prompt, subtopic_id, question_type, start_order_index, batch_size, section):
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _standard_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": question_type,
                    "difficulty": p.get("difficulty", "medium"),
                    "question_text": p["questionText"],
                    "options": p["options"][:5],
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 120),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": None,
                    "chart_data": None,
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"Standard batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Data Sufficiency ──────────────────────────────────────────────────────────

_ds_agent = Agent(
    name="GMAT DS Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Data Sufficiency problems.",
    instructions=[
        "You are an expert GMAT Data Sufficiency problem writer.",
        "Each problem has a question stem PLUS two statements labelled (1) and (2).",
        "The answer choices are ALWAYS the fixed GMAC set (A-E) — do NOT generate them.",
        "correctOption is an index 0-4 corresponding to: "
        "0=A (stmt1 alone sufficient), 1=B (stmt2 alone), 2=C (both together), 3=D (each alone), 4=E (neither).",
        "Return ONLY a valid JSON array with these keys:",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- questionText: string (question stem + Statement (1): ... + Statement (2): ..., LaTeX for math)",
        "- correctOption: number (0-4)",
        "- explanation: string (explain which answer choice is correct and why)",
        "- solutionSteps: { step: number, instruction: string, math: string }[] (2-4 steps: eval stmt1 alone, eval stmt2 alone, together)",
        "- conceptTags: string[] (e.g. 'inequalities', 'number-properties')",
        "- hint: string (e.g. 'Try substituting a negative value to test Statement 1')",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~120)",
        "- gmatFrequency: string ('high' | 'medium' | 'low')",
        "Never use em-dashes (—). Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_ds_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name}\n"
        f"Subtopic: {subtopic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} {difficulty} GMAT Data Sufficiency problems about {subtopic_name}.\n"
        "Include Statement (1) and Statement (2) inside questionText.\n"
        "Do NOT include the answer choices (they are always fixed A-E).\n"
        "Make each problem unique."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _ds_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "data_sufficiency",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": DS_OPTIONS,  # always fixed
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 120),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": None,
                    "chart_data": None,
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"DS batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Reading Comprehension ─────────────────────────────────────────────────────

_rc_agent = Agent(
    name="GMAT RC Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Reading Comprehension problems.",
    instructions=[
        "You are an expert GMAT Reading Comprehension problem writer.",
        "Each problem set shares one passage; generate independent questions about it.",
        "Return ONLY a valid JSON array. Each element represents ONE question about the passage:",
        "- passageText: string (the full passage — 150-400 words, rich content, business/science/humanities)",
        "- questionText: string (the specific question)",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- options: string[] (exactly 5 choices A-E, plausible but only one correct)",
        "- correctOption: number (0-4)",
        "- explanation: string",
        "- solutionSteps: { step: number, instruction: string, math: string }[]",
        "- conceptTags: string[] (e.g. 'main-idea', 'inference', 'detail')",
        "- hint: string",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~120)",
        "- gmatFrequency: string",
        "For efficiency, generate problems about the SAME passage. Vary question types: "
        "main idea, inference, supporting evidence, author tone, detail.",
        "Never use em-dashes (—). Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_rc_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name} — {subtopic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} GMAT RC questions (may share a passage or use different passages).\n"
        "Focus question types: main idea, inference, supporting evidence, detail.\n"
        "Passage topics: business strategy, science, social science, or humanities.\n"
        "Each question MUST have 5 options (A-E)."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _rc_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "reading_comprehension",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": p["options"][:5],
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 120),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": p.get("passageText", ""),
                    "chart_data": None,
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"RC batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Multi-Source Reasoning ─────────────────────────────────────────────────────

_msr_agent = Agent(
    name="GMAT MSR Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Multi-Source Reasoning problems.",
    instructions=[
        "You are an expert GMAT Multi-Source Reasoning (MSR) problem writer.",
        "MSR presents 2-3 information sources (tabs) and asks questions about synthesizing them.",
        "Return ONLY a valid JSON array. Each element is one question:",
        "- passageText: string — JSON array of source tabs: [{\"tabLabel\": \"Tab 1\", \"content\": \"...\"}, ...]",
        "  Include 2-3 tabs. Tab content should be text (business memo, email, table, graph description, etc.)",
        "- questionText: string",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- options: string[] (exactly 5 choices)",
        "- correctOption: number (0-4)",
        "- explanation: string",
        "- solutionSteps: { step: number, instruction: string, math: string }[]",
        "- conceptTags: string[]",
        "- hint: string",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~150)",
        "- gmatFrequency: string",
        "Never use em-dashes (—). Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_msr_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} GMAT Multi-Source Reasoning questions.\n"
        "Each question should have 2-3 source tabs covering business, finance, or analytics scenarios.\n"
        "passageText MUST be a valid JSON string: [{\"tabLabel\":\"Tab 1\",\"content\":\"...\"}]\n"
        "Each question needs exactly 5 answer choices."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _msr_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                # Validate/fix passageText is valid JSON
                passage_raw = p.get("passageText", "[]")
                try:
                    tabs = json.loads(passage_raw) if isinstance(passage_raw, str) else passage_raw
                    passage_json = json.dumps(tabs)
                except Exception:
                    passage_json = json.dumps([{"tabLabel": "Source", "content": str(passage_raw)}])
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "multi_source_reasoning",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": p["options"][:5],
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 150),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": passage_json,
                    "chart_data": None,
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"MSR batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Table Analysis ─────────────────────────────────────────────────────────────

_ta_agent = Agent(
    name="GMAT TA Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Table Analysis problems.",
    instructions=[
        "You are an expert GMAT Table Analysis (TA) problem writer.",
        "TA presents a sortable table and asks students to analyze data by sorting columns.",
        "Return ONLY a valid JSON array. Each element:",
        "- tableData: object with {\"type\":\"table\",\"headers\":[...],\"rows\":[[...],...]} — 4-8 columns, 5-10 rows of numeric/text data",
        "- questionText: string (specific analytical question about the table)",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- options: string[] (exactly 5 choices)",
        "- correctOption: number (0-4)",
        "- explanation: string",
        "- solutionSteps: { step: number, instruction: string, math: string }[]",
        "- conceptTags: string[]",
        "- hint: string (e.g. 'Sort by revenue column to find the answer')",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~150)",
        "- gmatFrequency: string",
        "Never use em-dashes (—). Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_ta_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} GMAT Table Analysis questions.\n"
        "Each question needs a realistic business/finance/science table with 5-10 rows and 4-6 columns.\n"
        "tableData must follow: {\"type\":\"table\",\"headers\":[...],\"rows\":[[...],...]}.\n"
        "Questions should require sorting/analyzing the table to answer. 5 choices each."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _ta_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                table_raw = p.get("tableData", {})
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "table_analysis",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": p["options"][:5],
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 150),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": None,
                    "chart_data": table_raw,  # stored as JSONB
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"TA batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Graphics Interpretation ────────────────────────────────────────────────────

_gi_agent = Agent(
    name="GMAT GI Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Graphics Interpretation problems.",
    instructions=[
        "You are an expert GMAT Graphics Interpretation (GI) problem writer.",
        "GI presents a chart/graph and asks students to interpret data from it.",
        "Return ONLY a valid JSON array. Each element:",
        "- chartData: object — one of:",
        "  {\"type\":\"bar\",\"title\":\"...\",\"xLabel\":\"...\",\"yLabel\":\"...\",\"data\":[{\"name\":\"...\",\"value\":N},...]}",
        "  {\"type\":\"line\",\"title\":\"...\",\"xLabel\":\"...\",\"yLabel\":\"...\",\"series\":[{\"name\":\"...\",\"data\":[{\"x\":...,\"y\":N},...]},...]}",
        "  {\"type\":\"pie\",\"title\":\"...\",\"data\":[{\"name\":\"...\",\"value\":N},...]}",
        "  {\"type\":\"scatter\",\"title\":\"...\",\"xLabel\":\"...\",\"yLabel\":\"...\",\"data\":[{\"x\":N,\"y\":N},...]}",
        "- questionText: string",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- options: string[] (exactly 5 choices)",
        "- correctOption: number (0-4)",
        "- explanation: string",
        "- solutionSteps: { step: number, instruction: string, math: string }[]",
        "- conceptTags: string[]",
        "- hint: string",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~150)",
        "- gmatFrequency: string",
        "Use realistic business/financial data. Never use em-dashes. Return ONLY the JSON array.",
    ],
    markdown=False,
)

async def _generate_gi_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} GMAT Graphics Interpretation questions.\n"
        "Each uses a chart with realistic numeric data (bar, line, pie, or scatter — vary types).\n"
        "Questions should require reading specific values or trends from the chart. 5 choices each."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _gi_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "graphics_interpretation",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": p["options"][:5],
                    "correct_option": min(int(p["correctOption"]), 4),
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 150),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": p.get("hint", ""),
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": None,
                    "chart_data": p.get("chartData"),
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"GI batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Two-Part Analysis ──────────────────────────────────────────────────────────

_tpa_agent = Agent(
    name="GMAT TPA Problem Generator",
    model=Claude(id="claude-sonnet-4-6"),
    description="You generate GMAT Two-Part Analysis problems.",
    instructions=[
        "You are an expert GMAT Two-Part Analysis (TPA) problem writer.",
        "TPA requires selecting one answer for EACH of two columns from the same set of rows.",
        "Return ONLY a valid JSON array. Each element:",
        "- questionText: string (the question/scenario; explain what Column 1 and Column 2 represent)",
        "- options: string[] (5-6 row choices shared by both columns)",
        "- col1Label: string (e.g. 'Revenue Increase', 'Greater Value', 'Assumption 1')",
        "- col2Label: string (e.g. 'Cost Decrease', 'Lesser Value', 'Assumption 2')",
        "- correctOption: number — NOT USED FOR TPA; set to 0",
        "- correctCol1: number (0-based row index for Column 1 answer)",
        "- correctCol2: number (0-based row index for Column 2 answer)",
        "- difficulty: string ('easy' | 'medium' | 'hard')",
        "- explanation: string (explain which rows are correct and why for each column)",
        "- solutionSteps: { step: number, instruction: string, math: string }[]",
        "- conceptTags: string[]",
        "- hint: string — format: 'Col1: <col1Label>|Col2: <col2Label>'",
        "- detailedHint: string",
        "- timeRecommendationSeconds: number (~180)",
        "- gmatFrequency: string",
        "Use business, algebra, or verbal reasoning contexts. Never use em-dashes. Return ONLY JSON.",
    ],
    markdown=False,
)

async def _generate_tpa_batch(
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str,
    batch_size: int,
    start_order_index: int,
) -> list[dict]:
    prompt = (
        f"Topic: {topic_name} — {subtopic_name}\n"
        f"Difficulty: {difficulty}\n"
        f"Batch: {batch_number + 1}\n"
        f"Generate exactly {batch_size} GMAT Two-Part Analysis problems.\n"
        "Vary contexts: quantitative (algebra, rates, statistics) and verbal (argument, evaluation).\n"
        "hint field MUST be in format: 'Col1: <col1Label>|Col2: <col2Label>'\n"
        "The options array is the shared row choices (5-6 items). Both columns pick from this list."
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = await _tpa_agent.arun(prompt)
            problems = _extract_json_array(response.content)
            if not problems:
                raise ValueError("Empty array")
            result = []
            for i, p in enumerate(problems[:batch_size]):
                col1 = int(p.get("correctCol1", 0))
                col2 = int(p.get("correctCol2", 1))
                options = p.get("options", [])
                col1_label = p.get("col1Label", "Column 1")
                col2_label = p.get("col2Label", "Column 2")
                # Build the TPA correct answer as JSON string
                correct_tpa = json.dumps({"col1": col1, "col2": col2})
                hint = p.get("hint", f"Col1: {col1_label}|Col2: {col2_label}")
                result.append({
                    "subtopic_id": subtopic_id,
                    "order_index": start_order_index + i,
                    "question_type": "two_part_analysis",
                    "difficulty": p.get("difficulty", difficulty),
                    "question_text": p["questionText"],
                    "options": options[:6],
                    "correct_option": 0,  # TPA uses correct_tpa_answer instead; stored separately
                    "explanation": p.get("explanation", ""),
                    "solution_steps": p.get("solutionSteps", []),
                    "concept_tags": p.get("conceptTags", []),
                    "time_recommendation_seconds": p.get("timeRecommendationSeconds", 180),
                    "gmat_frequency": p.get("gmatFrequency", "medium"),
                    "hint": hint,
                    "detailed_hint": p.get("detailedHint", ""),
                    "passage_text": None,
                    "chart_data": None,
                    # Store the correct TPA answer as a meta field for the answer API to use
                    "_tpa_correct": correct_tpa,
                })
            return result
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                print(f"⚠", end="", flush=True)
    raise RuntimeError(f"TPA batch failed after {MAX_RETRIES} attempts: {last_error}")


# ── Public dispatcher ──────────────────────────────────────────────────────────

DIFFICULTY_LEVELS = {
    "easy": 3,
    "medium": 5,
    "hard": 8,
}


async def generate_gmat_problems_batch(
    question_type: str,
    subtopic_name: str,
    topic_name: str,
    subtopic_id: str,
    batch_number: int,
    difficulty: str = "medium",
    batch_size: int = BATCH_SIZE,
    start_order_index: int = 0,
    section: str = "quantitative",
) -> list[dict]:
    """
    Main entry point for GMAT problem generation.
    Dispatches to the correct generator based on question_type.
    """
    if question_type == "data_sufficiency":
        return await _generate_ds_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    elif question_type == "reading_comprehension":
        return await _generate_rc_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    elif question_type == "multi_source_reasoning":
        return await _generate_msr_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    elif question_type == "table_analysis":
        return await _generate_ta_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    elif question_type == "graphics_interpretation":
        return await _generate_gi_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    elif question_type == "two_part_analysis":
        return await _generate_tpa_batch(subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index)
    else:
        # problem_solving, critical_reasoning
        return await _generate_standard_batch(question_type, subtopic_name, topic_name, subtopic_id, batch_number, difficulty, batch_size, start_order_index, section)
