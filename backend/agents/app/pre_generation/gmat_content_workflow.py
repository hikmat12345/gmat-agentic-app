"""
GMAT Content Generation Workflow — orchestrates topic/subtopic/problem generation
for all three GMAT Focus Edition sections.

Idempotent: skips topics/subtopics/problems that already exist.

Usage:
    cd backend/agents && python -m cli.main generate-gmat-content
    cd backend/agents && python -m cli.main generate-gmat-content --section verbal
"""

import asyncio
from agno.workflow import Workflow

from app.utils.db import (
    save_topic,
    save_subtopic,
    get_topic_by_slug,
    get_subtopic,
)
from app.pre_generation.topic_generator import generate_topic
from app.pre_generation.subtopic_generator import generate_subtopic
from app.pre_generation.gmat_problem_generator import (
    generate_gmat_problems_batch,
    BATCH_SIZE,
    DIFFICULTY_LEVELS,
)
from app.utils.gmat_db import (
    get_gmat_problem_count,
    save_gmat_problems,
)


def _make_slug(name: str) -> str:
    return (
        name.lower()
        .replace(" ", "-")
        .replace("(", "")
        .replace(")", "")
        .replace(",", "")
        .replace("/", "-")
        .replace("&", "and")
    )


# ── GMAT Curriculum Map ────────────────────────────────────────────────────────
#
# Structure: { topic_name: { order, icon, color, subject, subtopics: [ { name, question_type } ] } }
#
# question_type maps each subtopic to the GMAT question type used to generate problems.

GMAT_VERBAL_MAP = {
    "Critical Reasoning": {
        "order": 1,
        "icon": "🧠",
        "color": "blue",
        "subject": "verbal",
        "subtopics": [
            {"name": "Weaken and Strengthen Arguments", "question_type": "critical_reasoning"},
            {"name": "Identify Assumptions", "question_type": "critical_reasoning"},
            {"name": "Draw Inferences and Conclusions", "question_type": "critical_reasoning"},
            {"name": "Evaluate Arguments and Logical Flaws", "question_type": "critical_reasoning"},
            {"name": "Resolve Paradoxes and Explain Discrepancies", "question_type": "critical_reasoning"},
        ],
    },
    "Reading Comprehension": {
        "order": 2,
        "icon": "📖",
        "color": "purple",
        "subject": "verbal",
        "subtopics": [
            {"name": "Main Idea and Primary Purpose", "question_type": "reading_comprehension"},
            {"name": "Inference and Implied Information", "question_type": "reading_comprehension"},
            {"name": "Supporting Evidence and Details", "question_type": "reading_comprehension"},
            {"name": "Author Tone and Attitude", "question_type": "reading_comprehension"},
            {"name": "Application and Passage Extension", "question_type": "reading_comprehension"},
        ],
    },
}

GMAT_QUANTITATIVE_MAP = {
    "Arithmetic and Number Theory": {
        "order": 1,
        "icon": "🔢",
        "color": "blue",
        "subject": "quantitative",
        "subtopics": [
            {"name": "Divisibility, Primes, and Factors", "question_type": "problem_solving"},
            {"name": "Fractions, Decimals, and Percents", "question_type": "problem_solving"},
            {"name": "Ratios and Proportions", "question_type": "problem_solving"},
            {"name": "Powers, Roots, and Absolute Values", "question_type": "problem_solving"},
        ],
    },
    "Algebra": {
        "order": 2,
        "icon": "📐",
        "color": "purple",
        "subject": "quantitative",
        "subtopics": [
            {"name": "Linear and Quadratic Equations", "question_type": "problem_solving"},
            {"name": "Inequalities and Absolute Value Equations", "question_type": "problem_solving"},
            {"name": "Functions and Sequences", "question_type": "problem_solving"},
            {"name": "Word Problems with Algebra", "question_type": "problem_solving"},
        ],
    },
    "Geometry": {
        "order": 3,
        "icon": "📏",
        "color": "amber",
        "subject": "quantitative",
        "subtopics": [
            {"name": "Lines, Angles, and Triangles", "question_type": "problem_solving"},
            {"name": "Circles and Quadrilaterals", "question_type": "problem_solving"},
            {"name": "Coordinate Geometry", "question_type": "problem_solving"},
            {"name": "Area, Volume, and Surface Area", "question_type": "problem_solving"},
        ],
    },
    "Statistics and Combinatorics": {
        "order": 4,
        "icon": "📊",
        "color": "green",
        "subject": "quantitative",
        "subtopics": [
            {"name": "Mean, Median, Mode, and Standard Deviation", "question_type": "problem_solving"},
            {"name": "Combinations, Permutations, and Probability", "question_type": "problem_solving"},
            {"name": "Rate, Work, and Distance Problems", "question_type": "problem_solving"},
        ],
    },
}

GMAT_DATA_INSIGHTS_MAP = {
    "Data Sufficiency": {
        "order": 1,
        "icon": "🔍",
        "color": "blue",
        "subject": "data_insights",
        "subtopics": [
            {"name": "Number Properties and Arithmetic DS", "question_type": "data_sufficiency"},
            {"name": "Algebra and Equations DS", "question_type": "data_sufficiency"},
            {"name": "Geometry DS", "question_type": "data_sufficiency"},
            {"name": "Statistics and Rates DS", "question_type": "data_sufficiency"},
        ],
    },
    "Integrated Reasoning": {
        "order": 2,
        "icon": "📈",
        "color": "green",
        "subject": "data_insights",
        "subtopics": [
            {"name": "Multi-Source Reasoning", "question_type": "multi_source_reasoning"},
            {"name": "Table Analysis", "question_type": "table_analysis"},
            {"name": "Graphics Interpretation", "question_type": "graphics_interpretation"},
            {"name": "Two-Part Analysis", "question_type": "two_part_analysis"},
        ],
    },
}

GMAT_SECTION_MAPS = {
    "verbal": GMAT_VERBAL_MAP,
    "quantitative": GMAT_QUANTITATIVE_MAP,
    "data_insights": GMAT_DATA_INSIGHTS_MAP,
}

PROBLEMS_PER_SUBTOPIC = 30  # Enough for ~5 full tests without reuse


class GmatContentWorkflow(Workflow):
    name: str = "GMAT Content Generation"
    description: str = "Generates topics, subtopics, and GMAT problems for all sections"

    async def run_generation(self, section: str = "all") -> dict:
        """Execute the full GMAT content generation pipeline. Skips existing content."""
        sections_to_run = (
            list(GMAT_SECTION_MAPS.items())
            if section == "all"
            else [(section, GMAT_SECTION_MAPS[section])]
        )

        total_stats = {
            "topics": 0, "subtopics": 0, "problems": 0,
            "skipped_topics": 0, "skipped_subtopics": 0, "skipped_problems": 0
        }

        for section_name, content_map in sections_to_run:
            print(f"\n{'='*50}")
            print(f"  GMAT Section: {section_name.upper()}")
            print(f"{'='*50}\n")
            stats = await self._run_section(section_name, content_map)
            for k in total_stats:
                total_stats[k] += stats[k]

        return total_stats

    async def _run_section(self, section_name: str, content_map: dict) -> dict:
        stats = {
            "topics": 0, "subtopics": 0, "problems": 0,
            "skipped_topics": 0, "skipped_subtopics": 0, "skipped_problems": 0
        }

        # ── Step 1: Topics ──
        print(f"\n  Step 1: Topics")
        saved_topics = {}
        topics_to_generate = []

        for topic_name, meta in content_map.items():
            slug = _make_slug(topic_name)
            existing = get_topic_by_slug(slug)
            if existing:
                saved_topics[topic_name] = existing
                stats["skipped_topics"] += 1
                print(f"  >> Topic already exists: {topic_name}")
            else:
                topics_to_generate.append((topic_name, meta))

        if topics_to_generate:
            sub_names = [s["name"] for s in meta["subtopics"]]
            topic_tasks = [
                generate_topic(
                    name=name,
                    subtopics=[s["name"] for s in meta["subtopics"]],
                    order=meta["order"],
                    icon=meta["icon"],
                    color=meta["color"],
                    subject=meta["subject"],
                )
                for name, meta in topics_to_generate
            ]
            topic_results = await asyncio.gather(*topic_tasks)
            for topic_data in topic_results:
                saved = save_topic(topic_data)
                saved_topics[topic_data["name"]] = saved
                stats["topics"] += 1
                print(f"  ✓ Saved topic: {topic_data['name']}")

        # ── Step 2: Subtopics ──
        print(f"\n  Step 2: Subtopics")
        saved_subtopics = {}
        subtopics_to_generate = []

        for topic_name, meta in content_map.items():
            topic_id = saved_topics[topic_name]["id"]
            for i, sub_meta in enumerate(meta["subtopics"]):
                sub_name = sub_meta["name"]
                slug = _make_slug(sub_name)
                existing = get_subtopic(topic_id, slug)
                if existing:
                    saved_subtopics[(topic_name, sub_name)] = existing
                    stats["skipped_subtopics"] += 1
                    print(f"  >> [{topic_name}] {sub_name} (exists)")
                else:
                    subtopics_to_generate.append(
                        (topic_name, sub_name, topic_id, i,
                         [s["name"] for s in meta["subtopics"]], meta["subject"])
                    )

        if subtopics_to_generate:
            sub_tasks = [
                generate_subtopic(
                    name=sub_name,
                    topic_name=topic_name,
                    topic_id=topic_id,
                    order_index=order_idx,
                    all_subtopic_names=all_subs,
                    subject=subject,
                )
                for topic_name, sub_name, topic_id, order_idx, all_subs, subject in subtopics_to_generate
            ]
            sub_results = await asyncio.gather(*sub_tasks)
            for (topic_name, sub_name, *_), sub_data in zip(subtopics_to_generate, sub_results):
                saved = save_subtopic(sub_data)
                saved_subtopics[(topic_name, sub_name)] = saved
                stats["subtopics"] += 1
                print(f"  ✓ [{topic_name}] {sub_name}")

        # ── Step 3: Problems ──
        print(f"\n  Step 3: Problems")

        num_batches = PROBLEMS_PER_SUBTOPIC // BATCH_SIZE

        for topic_name, meta in content_map.items():
            print(f"\n  -- {topic_name}")
            for sub_meta in meta["subtopics"]:
                sub_name = sub_meta["name"]
                question_type = sub_meta["question_type"]
                subtopic_id = saved_subtopics[(topic_name, sub_name)]["id"]

                existing_count = get_gmat_problem_count(subtopic_id)
                if existing_count >= PROBLEMS_PER_SUBTOPIC:
                    stats["skipped_problems"] += existing_count
                    print(f"    >> {sub_name}: {existing_count} already exist")
                    continue

                batches_done = existing_count // BATCH_SIZE
                batches_remaining = num_batches - batches_done
                if batches_remaining <= 0:
                    stats["skipped_problems"] += existing_count
                    print(f"    >> {sub_name}: {existing_count} problems already exist")
                    continue

                print(
                    f"    >> {sub_name} [{question_type}] "
                    f"({existing_count} exist, generating {batches_remaining * BATCH_SIZE} more): ",
                    end="", flush=True
                )

                # Spread batches evenly across easy/medium/hard
                difficulties = ["easy", "medium", "hard"]
                batch_tasks = []
                for b in range(batches_done, num_batches):
                    diff = difficulties[b % 3]
                    batch_tasks.append(
                        generate_gmat_problems_batch(
                            question_type=question_type,
                            subtopic_name=sub_name,
                            topic_name=topic_name,
                            subtopic_id=subtopic_id,
                            batch_number=b,
                            difficulty=diff,
                            batch_size=BATCH_SIZE,
                            start_order_index=existing_count + (b - batches_done) * BATCH_SIZE,
                            section=meta["subject"],
                        )
                    )

                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)

                total_saved = 0
                problems_to_save = []
                for result in batch_results:
                    if isinstance(result, Exception):
                        print(f"✗", end="", flush=True)
                    else:
                        # Add DB metadata
                        for p in result:
                            p["topic_slug"] = _make_slug(topic_name)
                            p["subtopic_slug"] = _make_slug(sub_name)
                            p["difficulty_level"] = DIFFICULTY_LEVELS.get(p.get("difficulty", "medium"), 5)
                        problems_to_save.extend(result)
                        print(f"█", end="", flush=True)

                if problems_to_save:
                    save_gmat_problems(problems_to_save)
                    total_saved = len(problems_to_save)

                stats["problems"] += total_saved
                print(f" ({total_saved})")

        return stats
