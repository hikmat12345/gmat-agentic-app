"""
Full GMAT problem bank seeder — generates problems for every GMAT subtopic
tagged with source='full_gmat'.

GMAT Focus Edition sections:
  Verbal (23 Qs): Critical Reasoning, Reading Comprehension
  Quantitative (21 Qs): Problem Solving
  Data Insights (20 Qs): DS, MSR, TA, GI, TPA

Usage:
    cd backend/agents && python -m cli.main seed-full-gmat-bank
    cd backend/agents && python -m cli.main seed-full-gmat-bank --section all --count 50
"""

import asyncio
import math
import time

from app.pre_generation.gmat_problem_generator import (
    generate_gmat_problems_batch,
    BATCH_SIZE,
    DIFFICULTY_LEVELS,
)
from app.pre_generation.gmat_content_workflow import (
    GMAT_VERBAL_MAP,
    GMAT_QUANTITATIVE_MAP,
    GMAT_DATA_INSIGHTS_MAP,
    GMAT_SECTION_MAPS,
    _make_slug,
)
from app.utils.db import get_topic_by_slug, get_subtopic
from app.utils.gmat_db import (
    get_full_gmat_problem_count,
    save_full_gmat_problems,
)

# Target problems per subtopic
PROBLEMS_PER_SUBTOPIC = 50

# Concurrency controls
SUBTOPIC_CONCURRENCY = 2   # GMAT problems are larger — lower concurrency
BATCH_CONCURRENCY = 4


def _resolve_subtopics(section_map: dict, count: int, force: bool) -> tuple[list[dict], int]:
    items = []
    skipped = 0

    for topic_name, meta in section_map.items():
        topic_slug = _make_slug(topic_name)
        topic_row = get_topic_by_slug(topic_slug)
        if topic_row is None:
            print(f"  !! topic '{topic_slug}' not in DB — run generate-gmat-content first")
            skipped += len(meta["subtopics"])
            continue

        for sub_meta in meta["subtopics"]:
            sub_name = sub_meta["name"]
            sub_slug = _make_slug(sub_name)
            subtopic_row = get_subtopic(topic_row["id"], sub_slug)
            if subtopic_row is None:
                print(f"  !! subtopic '{sub_slug}' not in DB — skipping")
                skipped += 1
                continue

            subtopic_id = subtopic_row["id"]
            existing = get_full_gmat_problem_count(subtopic_id)

            if existing >= count and not force:
                print(f"  >> {topic_name} / {sub_name} ({existing} already exist)")
                skipped += 1
                continue

            items.append({
                "topic_name": topic_name,
                "sub_name": sub_name,
                "question_type": sub_meta["question_type"],
                "subject": meta["subject"],
                "subtopic_id": subtopic_id,
                "topic_slug": topic_row["slug"],
                "subtopic_slug": subtopic_row["slug"],
                "existing": existing,
            })

    return items, skipped


async def _seed_subtopic(item: dict, count: int) -> int:
    per_difficulty = count // 3
    remainders = count % 3
    buckets = {
        "easy": per_difficulty + (1 if remainders > 0 else 0),
        "medium": per_difficulty + (1 if remainders > 1 else 0),
        "hard": per_difficulty,
    }

    sem = asyncio.Semaphore(BATCH_CONCURRENCY)

    async def run_batch(difficulty: str, batch_num: int, batch_size: int, order_start: int) -> list[dict]:
        async with sem:
            return await generate_gmat_problems_batch(
                question_type=item["question_type"],
                subtopic_name=item["sub_name"],
                topic_name=item["topic_name"],
                subtopic_id=item["subtopic_id"],
                batch_number=batch_num,
                difficulty=difficulty,
                batch_size=batch_size,
                start_order_index=order_start,
                section=item["subject"],
            )

    tasks: list[asyncio.Task] = []
    global_offset = 0

    for difficulty, bucket_count in buckets.items():
        num_batches = math.ceil(bucket_count / BATCH_SIZE)
        diff_offset = global_offset
        for batch_num in range(num_batches):
            already = batch_num * BATCH_SIZE
            remaining = bucket_count - already
            this_batch = min(BATCH_SIZE, remaining)
            tasks.append(asyncio.create_task(
                run_batch(difficulty, batch_num, this_batch, diff_offset + already)
            ))
        global_offset += bucket_count

    results = await asyncio.gather(*tasks, return_exceptions=True)

    all_problems: list[dict] = []
    for result in results:
        if isinstance(result, Exception):
            print(f"    !! batch failed: {result}", flush=True)
        else:
            all_problems.extend(result)

    # Add metadata
    for p in all_problems:
        p["subtopic_id"] = item["subtopic_id"]
        p["topic_slug"] = item["topic_slug"]
        p["subtopic_slug"] = item["subtopic_slug"]
        p["difficulty_level"] = DIFFICULTY_LEVELS.get(p.get("difficulty", "medium"), 5)

    save_full_gmat_problems(all_problems)
    return len(all_problems)


async def seed_full_gmat_bank(
    section: str = "all",
    count: int = PROBLEMS_PER_SUBTOPIC,
    force: bool = False,
    parallelism: int = SUBTOPIC_CONCURRENCY,
) -> dict:
    section_maps = (
        list(GMAT_SECTION_MAPS.items())
        if section == "all"
        else [(section, GMAT_SECTION_MAPS[section])]
    )

    all_items = []
    total_skipped = 0
    stats = {"seeded": 0, "skipped": 0, "failed": 0, "combinations": 0}

    for section_name, section_map in section_maps:
        print(f"  Resolving subtopics for {section_name}...", flush=True)
        items, skipped = _resolve_subtopics(section_map, count, force)
        all_items.extend(items)
        total_skipped += skipped

    stats["skipped"] = total_skipped
    stats["combinations"] = len(all_items) + total_skipped

    if not all_items:
        return stats

    sem = asyncio.Semaphore(parallelism)

    async def seed_one(item: dict) -> int:
        async with sem:
            id_short = item["subtopic_id"][:8]
            print(
                f"  > {item['topic_name']} / {item['sub_name']} "
                f"[{item['question_type']}] [{id_short}...] — seeding {count}...",
                flush=True
            )
            t0 = time.time()
            n = await _seed_subtopic(item, count)
            elapsed = int(time.time() - t0)
            print(f"  + {item['sub_name']} — {n} in {elapsed}s", flush=True)
            return n

    task_list = [asyncio.create_task(seed_one(item)) for item in all_items]
    results = await asyncio.gather(*task_list, return_exceptions=True)

    for item, result in zip(all_items, results):
        if isinstance(result, Exception):
            print(f"  !! {item['sub_name']}: {result}")
            stats["failed"] += 1
        else:
            stats["seeded"] += result

    return stats
