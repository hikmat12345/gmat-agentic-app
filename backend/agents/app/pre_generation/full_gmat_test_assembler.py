"""
Full GMAT Test Assembler — selects problems from the full_gmat bank and
assembles them into a 64-question GMAT Focus Edition test blueprint.

GMAT Focus Edition structure:
  Verbal Reasoning:      23 Qs / 45 min  (CR + RC)
  Quantitative Reasoning: 21 Qs / 45 min  (PS only)
  Data Insights:          20 Qs / 45 min  (DS, MSR, TA, GI, TPA)
  Total: 64 questions, 135 minutes

Usage:
    cd backend/agents && python -m cli.main assemble-full-gmat-test
    cd backend/agents && python -m cli.main assemble-full-gmat-test --test-number 2
"""

import random

from app.pre_generation.gmat_content_workflow import (
    GMAT_VERBAL_MAP,
    GMAT_QUANTITATIVE_MAP,
    GMAT_DATA_INSIGHTS_MAP,
    _make_slug,
)
from app.utils.db import get_topic_by_slug, get_subtopic
from app.utils.gmat_db import (
    get_full_gmat_tests,
    create_full_gmat_test,
    add_gmat_test_problems,
    get_used_full_gmat_problem_ids,
    get_full_gmat_problems_for_subtopic,
)

# ── GMAT test distribution ──────────────────────────────────────────────────────
# Maps subtopic name -> count of questions per full test.
# Total per section must match: Verbal=23, Quant=21, DI=20

VERBAL_DISTRIBUTION = {
    # Critical Reasoning: ~9 questions
    "Weaken and Strengthen Arguments": 2,
    "Identify Assumptions": 2,
    "Draw Inferences and Conclusions": 2,
    "Evaluate Arguments and Logical Flaws": 2,
    "Resolve Paradoxes and Explain Discrepancies": 1,
    # Reading Comprehension: ~14 questions
    "Main Idea and Primary Purpose": 3,
    "Inference and Implied Information": 3,
    "Supporting Evidence and Details": 3,
    "Author Tone and Attitude": 2,
    "Application and Passage Extension": 2,
}
# Total: 9 + 14 = 23 ✓

QUANTITATIVE_DISTRIBUTION = {
    "Divisibility, Primes, and Factors": 2,
    "Fractions, Decimals, and Percents": 2,
    "Ratios and Proportions": 2,
    "Powers, Roots, and Absolute Values": 2,
    "Linear and Quadratic Equations": 3,
    "Inequalities and Absolute Value Equations": 2,
    "Functions and Sequences": 1,
    "Word Problems with Algebra": 2,
    "Lines, Angles, and Triangles": 1,
    "Circles and Quadrilaterals": 1,
    "Coordinate Geometry": 1,
    "Area, Volume, and Surface Area": 1,
    "Mean, Median, Mode, and Standard Deviation": 1,
    "Combinations, Permutations, and Probability": 1,
    "Rate, Work, and Distance Problems": 1,
}
# Total: 21 ✓ (need to verify)

DATA_INSIGHTS_DISTRIBUTION = {
    # Data Sufficiency: ~5
    "Number Properties and Arithmetic DS": 1,
    "Algebra and Equations DS": 2,
    "Geometry DS": 1,
    "Statistics and Rates DS": 1,
    # Integrated Reasoning: ~15
    "Multi-Source Reasoning": 4,
    "Table Analysis": 4,
    "Graphics Interpretation": 4,
    "Two-Part Analysis": 3,
}
# Total: 5 + 15 = 20 ✓


def _count_distribution(dist: dict) -> int:
    return sum(dist.values())


# Sanity checks
assert _count_distribution(VERBAL_DISTRIBUTION) == 23, f"Verbal: {_count_distribution(VERBAL_DISTRIBUTION)}"
assert _count_distribution(QUANTITATIVE_DISTRIBUTION) == 21, f"Quant: {_count_distribution(QUANTITATIVE_DISTRIBUTION)}"
assert _count_distribution(DATA_INSIGHTS_DISTRIBUTION) == 20, f"DI: {_count_distribution(DATA_INSIGHTS_DISTRIBUTION)}"

# Map subtopic name -> (topic_name, section) for DB lookup
_SUBTOPIC_SECTION_MAP: dict[str, tuple[str, str]] = {}
for section_map, section_name in [
    (GMAT_VERBAL_MAP, "verbal"),
    (GMAT_QUANTITATIVE_MAP, "quantitative"),
    (GMAT_DATA_INSIGHTS_MAP, "data_insights"),
]:
    for topic_name, meta in section_map.items():
        for sub_meta in meta["subtopics"]:
            _SUBTOPIC_SECTION_MAP[sub_meta["name"]] = (topic_name, section_name)


def _resolve_subtopic_id(subtopic_name: str) -> str | None:
    entry = _SUBTOPIC_SECTION_MAP.get(subtopic_name)
    if not entry:
        return None
    topic_name, _ = entry
    topic_slug = _make_slug(topic_name)
    topic_row = get_topic_by_slug(topic_slug)
    if not topic_row:
        return None
    subtopic_slug = _make_slug(subtopic_name)
    subtopic_row = get_subtopic(topic_row["id"], subtopic_slug)
    return subtopic_row["id"] if subtopic_row else None


def _select_problems(subtopic_id: str, count: int, used_ids: set[str]) -> list[dict]:
    all_problems = get_full_gmat_problems_for_subtopic(subtopic_id)
    available = [p for p in all_problems if p["id"] not in used_ids]
    if len(available) < count:
        print(f"    !! Only {len(available)} available (need {count})")
        count = len(available)
    if count == 0:
        return []
    return random.sample(available, count)


def _select_section_problems(
    distribution: dict[str, int],
    used_ids: set[str],
    section_label: str,
) -> list[dict]:
    problems = []
    print(f"\n  {section_label}:")
    for subtopic_name, count in distribution.items():
        subtopic_id = _resolve_subtopic_id(subtopic_name)
        if not subtopic_id:
            print(f"    !! {subtopic_name}: not in DB — run generate-gmat-content + seed-full-gmat-bank first")
            continue
        selected = _select_problems(subtopic_id, count, used_ids)
        for p in selected:
            used_ids.add(p["id"])
        problems.extend(selected)
        print(f"    + {subtopic_name}: {len(selected)}/{count}")
    return problems


def assemble_full_gmat_test(test_number: int | None = None) -> dict:
    """Assemble a 64-question GMAT test from the problem bank."""
    existing_tests = get_full_gmat_tests()
    if test_number is None:
        test_number = len(existing_tests) + 1

    name = f"GMAT Focus Edition Practice Test {test_number}"
    print(f"\n  Assembling: {name}")

    used_ids = get_used_full_gmat_problem_ids()
    print(f"  {len(used_ids)} problems already used in other tests")

    verbal_problems = _select_section_problems(VERBAL_DISTRIBUTION, used_ids, "Verbal Reasoning")
    quant_problems = _select_section_problems(QUANTITATIVE_DISTRIBUTION, used_ids, "Quantitative Reasoning")
    di_problems = _select_section_problems(DATA_INSIGHTS_DISTRIBUTION, used_ids, "Data Insights")

    total = len(verbal_problems) + len(quant_problems) + len(di_problems)
    print(f"\n  Total selected: {len(verbal_problems)}V + {len(quant_problems)}Q + {len(di_problems)}DI = {total}")

    # Shuffle within each section
    random.shuffle(verbal_problems)
    random.shuffle(quant_problems)
    random.shuffle(di_problems)

    # Create the test record
    test = create_full_gmat_test(test_number, name)
    test_id = test["id"]
    print(f"  Created test: {test_id[:8]}...")

    # Build mappings
    mappings: list[dict] = []

    for i, p in enumerate(verbal_problems):
        mappings.append({
            "problem_id": p["id"],
            "section": "verbal",
            "order_index": i,
        })

    for i, p in enumerate(quant_problems):
        mappings.append({
            "problem_id": p["id"],
            "section": "quantitative",
            "order_index": i,
        })

    for i, p in enumerate(di_problems):
        mappings.append({
            "problem_id": p["id"],
            "section": "data_insights",
            "order_index": i,
        })

    add_gmat_test_problems(test_id, mappings)
    print(f"  Assigned {len(mappings)} problems to test")

    return test
