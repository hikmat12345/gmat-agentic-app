"""
Supabase persistence helpers for GMAT-specific content and full GMAT tests.

Mirrors db.py patterns but targets GMAT sources ('gmat', 'full_gmat')
and the full_gmat_tests / full_gmat_test_problems tables.

TPA note: Two-Part Analysis problems have no passage, so passage_text is
repurposed to store the correct TPA answer as a JSON string
{"col1": N, "col2": N}.  The answer route compares using this value.
"""

import json
from app.utils.db import client


# ── Problem counts ─────────────────────────────────────────────────────────────


def get_gmat_problem_count(subtopic_id: str) -> int:
    """Count existing gmat-source problems for a subtopic."""
    resp = (
        client()
        .table("problems")
        .select("id", count="exact")
        .eq("source", "gmat")
        .eq("subtopic_id", subtopic_id)
        .execute()
    )
    return resp.count or 0


def get_full_gmat_problem_count(subtopic_id: str) -> int:
    """Count existing full_gmat-source problems for a subtopic."""
    resp = (
        client()
        .table("problems")
        .select("id", count="exact")
        .eq("source", "full_gmat")
        .eq("subtopic_id", subtopic_id)
        .execute()
    )
    return resp.count or 0


# ── Problem saves ──────────────────────────────────────────────────────────────

def _build_problem_row(p: dict, source: str) -> dict:
    """
    Build a DB row dict from a problem dict produced by gmat_problem_generator.

    For TPA (two_part_analysis): the generator emits a '_tpa_correct' key
    containing the correct answer as a JSON string {"col1":N,"col2":N}.
    We store that in passage_text (which is otherwise NULL for TPA).
    """
    qt = p.get("question_type")
    if qt == "two_part_analysis":
        passage = p.get("_tpa_correct")  # JSON string
    else:
        passage = p.get("passage_text")

    return {
        "source": source,
        "subtopic_id": p["subtopic_id"],
        "topic_slug": p.get("topic_slug"),
        "subtopic_slug": p.get("subtopic_slug"),
        "order_index": p["order_index"],
        "difficulty": p["difficulty"],
        "difficulty_level": p.get("difficulty_level", 5),
        "question_type": qt,
        "question_text": p["question_text"],
        "options": p["options"],
        "correct_option": p["correct_option"],
        "explanation": p.get("explanation", ""),
        "solution_steps": p.get("solution_steps", []),
        "concept_tags": p.get("concept_tags", []),
        "time_recommendation_seconds": p.get("time_recommendation_seconds", 120),
        "gmat_frequency": p.get("gmat_frequency", "medium"),
        "hint": p.get("hint", ""),
        "detailed_hint": p.get("detailed_hint", ""),
        "passage_text": passage,
        "chart_data": p.get("chart_data"),
    }


def save_gmat_problems(problems: list[dict]) -> list[dict]:
    """Batch insert gmat-source problems. Returns saved rows."""
    if not problems:
        return []
    rows = [_build_problem_row(p, "gmat") for p in problems]
    resp = client().table("problems").insert(rows).execute()
    return resp.data or []


def save_full_gmat_problems(problems: list[dict]) -> list[dict]:
    """Batch insert full_gmat-source problems. Returns saved rows."""
    if not problems:
        return []
    rows = [_build_problem_row(p, "full_gmat") for p in problems]
    resp = client().table("problems").insert(rows).execute()
    return resp.data or []


# ── Full GMAT test blueprints ──────────────────────────────────────────────────


def get_full_gmat_tests() -> list[dict]:
    """Get all GMAT test blueprints, ordered by test_number."""
    resp = client().table("full_gmat_tests").select("*").order("test_number").execute()
    return resp.data or []


def create_full_gmat_test(test_number: int, name: str) -> dict:
    """Create a new GMAT test blueprint. Returns the saved row."""
    resp = (
        client()
        .table("full_gmat_tests")
        .insert({"test_number": test_number, "name": name, "status": "active"})
        .execute()
    )
    return resp.data[0]


def add_gmat_test_problems(test_id: str, mappings: list[dict]) -> None:
    """
    Bulk-insert problem mappings for a full GMAT test.

    Each mapping: { problem_id, section, order_index }
    No 'module' column — GMAT Focus Edition has no module structure.
    """
    if not mappings:
        return
    rows = [
        {
            "test_id": test_id,
            "problem_id": m["problem_id"],
            "section": m["section"],
            "order_index": m["order_index"],
        }
        for m in mappings
    ]
    client().table("full_gmat_test_problems").insert(rows).execute()


def get_used_full_gmat_problem_ids() -> set[str]:
    """Get all problem IDs already assigned to any full GMAT test."""
    resp = (
        client()
        .table("full_gmat_test_problems")
        .select("problem_id")
        .execute()
    )
    return {row["problem_id"] for row in (resp.data or [])}


def get_full_gmat_problems_for_subtopic(subtopic_id: str) -> list[dict]:
    """Get all full_gmat problems for a subtopic (id + difficulty metadata only)."""
    resp = (
        client()
        .table("problems")
        .select("id, difficulty, difficulty_level")
        .eq("source", "full_gmat")
        .eq("subtopic_id", subtopic_id)
        .execute()
    )
    return resp.data or []
