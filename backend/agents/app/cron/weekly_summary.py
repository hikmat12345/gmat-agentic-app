"""
Weekly summary email cron — runs every Sunday at midnight UTC.
Sends each user a performance digest for the past 7 days.
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone

import resend

from app.utils.db import client

logger = logging.getLogger(__name__)

APP_URL = os.environ.get("APP_URL", "https://athena-pov.com")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "Athena <noreply@athena.com>")

INTERVAL_SECONDS = 24 * 60 * 60  # check daily, only send on Sunday


def _send_email(to: str, subject: str, html: str) -> None:
    resend.api_key = os.environ.get("RESEND_API_KEY", "")
    resend.Emails.send({"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html})


def _score_delta_color(delta: int) -> str:
    if delta > 0:
        return "#16a34a"
    if delta < 0:
        return "#dc2626"
    return "#6b7280"


def _weekly_summary_html(
    display_name: str,
    quests_done: int,
    questions_answered: int,
    accuracy_pct: int,
    current_score: int | None,
    score_delta: int,
    streak: int,
    top_weakness: str | None,
) -> tuple[str, str]:
    subject = f"Your GMAT Weekly Report — {quests_done} quest{'s' if quests_done != 1 else ''} completed"

    delta_str = ""
    if score_delta > 0:
        delta_str = f'<span style="color:#16a34a;font-weight:600;">+{score_delta}</span>'
    elif score_delta < 0:
        delta_str = f'<span style="color:#dc2626;font-weight:600;">{score_delta}</span>'

    score_section = ""
    if current_score:
        score_section = f"""
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#f9fafb;border-radius:10px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Current GMAT Score</p>
              <p style="margin:0;font-size:42px;font-weight:700;color:#111827;">{current_score}</p>
              {f'<p style="margin:4px 0 0;font-size:14px;color:#6b7280;">This week: {delta_str}</p>' if delta_str else ''}
            </div>
          </td>
        </tr>"""

    weakness_section = ""
    if top_weakness:
        weakness_section = f"""
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:16px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#92400e;">Focus Area This Week</p>
              <p style="margin:0;font-size:15px;color:#78350f;">{top_weakness}</p>
            </div>
          </td>
        </tr>"""

    no_activity = quests_done == 0
    activity_msg = (
        "No quests this week — get back on track to keep your GMAT prep moving!"
        if no_activity
        else f"You completed <strong>{quests_done} quest{'s' if quests_done != 1 else ''}</strong> and answered <strong>{questions_answered} questions</strong> with <strong>{accuracy_pct}% accuracy</strong>."
    )

    html = f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;">Weekly Report</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">Hi {display_name}!</h1>
          </td>
        </tr>
        <!-- Score -->
        {score_section}
        <!-- Stats grid -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                  <p style="margin:0 0 2px;font-size:24px;font-weight:700;color:#6366f1;">{quests_done}</p>
                  <p style="margin:0;font-size:12px;color:#6b7280;">Quests Done</p>
                </td>
                <td style="width:4%;"></td>
                <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                  <p style="margin:0 0 2px;font-size:24px;font-weight:700;color:#6366f1;">{accuracy_pct}%</p>
                  <p style="margin:0;font-size:12px;color:#6b7280;">Accuracy</p>
                </td>
                <td style="width:4%;"></td>
                <td style="width:33%;text-align:center;padding:12px 8px;background:#f9fafb;border-radius:10px;">
                  <p style="margin:0 0 2px;font-size:24px;font-weight:700;color:#f59e0b;">{streak}</p>
                  <p style="margin:0;font-size:12px;color:#6b7280;">Day Streak</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Summary text -->
        <tr>
          <td style="padding:0 32px 24px;font-size:15px;color:#374151;line-height:1.6;">
            <p style="margin:0;">{activity_msg}</p>
          </td>
        </tr>
        <!-- Weakness -->
        {weakness_section}
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="{APP_URL}/dashboard" style="display:inline-block;padding:13px 32px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:9px;font-size:16px;font-weight:600;">
              {"Get Back on Track" if no_activity else "Continue Studying"}
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">You're receiving this because you have a scheduled study plan on Athena.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    return subject, html


def _collect_user_stats(db, user_id: str, since: str) -> dict:
    """Collect past-week stats for a single user."""
    sessions_resp = db.table("sessions").select("id, score, total_questions, created_at").eq("user_id", user_id).eq("status", "completed").gte("created_at", since).execute()
    sessions = sessions_resp.data or []

    quests_done = len(sessions)
    total_q = sum(s.get("total_questions") or 0 for s in sessions)
    total_correct = sum(int((s.get("score") or 0) * (s.get("total_questions") or 0) / 100) for s in sessions)
    accuracy = round(total_correct / total_q * 100) if total_q else 0

    # Streak from user record
    user_resp = db.table("users").select("streak, skill_score, current_composite, display_name, email").eq("id", user_id).maybe_single().execute()
    user = user_resp.data or {}

    # Score delta: compare current_composite to score a week ago
    current_score = user.get("current_composite") or user.get("skill_score")
    # Approximate delta from quiz sessions this week
    score_delta = 0

    # Find top weakness (subtopic with lowest accuracy)
    answers_resp = db.table("quiz_answers").select("is_correct, session_id").in_("session_id", [s["id"] for s in sessions]).execute() if sessions else None
    top_weakness = None
    if sessions:
        # Find which subtopic had most wrong answers
        subtopic_errors: dict[str, int] = {}
        for s in sessions:
            if s.get("subtopic_id"):
                answers = [a for a in (answers_resp.data or []) if a["session_id"] == s["id"]]
                wrong = sum(1 for a in answers if not a["is_correct"])
                subtopic_errors[s.get("subtopic_id", "")] = subtopic_errors.get(s.get("subtopic_id", ""), 0) + wrong
        if subtopic_errors:
            worst_id = max(subtopic_errors, key=lambda k: subtopic_errors[k])
            st_resp = db.table("subtopics").select("name").eq("id", worst_id).maybe_single().execute()
            if st_resp.data:
                top_weakness = st_resp.data.get("name")

    return {
        "display_name": user.get("display_name") or "there",
        "email": user.get("email"),
        "quests_done": quests_done,
        "questions_answered": total_q,
        "accuracy_pct": accuracy,
        "current_score": current_score,
        "score_delta": score_delta,
        "streak": user.get("streak") or 0,
        "top_weakness": top_weakness,
    }


def _run_weekly_summary() -> dict:
    """Send weekly summary emails to all active users."""
    now = datetime.now(timezone.utc)
    # Only run on Sundays (weekday 6)
    if now.weekday() != 6:
        return {"skipped": True, "reason": "Not Sunday"}

    since = (now - timedelta(days=7)).isoformat()
    db = client()

    # Get all users who have a schedule (active users)
    schedules_resp = db.table("schedules").select("user_id").execute()
    user_ids = list({s["user_id"] for s in (schedules_resp.data or [])})

    if not user_ids:
        return {"sent": 0, "errors": 0}

    sent = 0
    errors = 0
    for user_id in user_ids:
        try:
            stats = _collect_user_stats(db, user_id, since)
            if not stats.get("email"):
                continue
            subject, html = _weekly_summary_html(
                display_name=stats["display_name"],
                quests_done=stats["quests_done"],
                questions_answered=stats["questions_answered"],
                accuracy_pct=stats["accuracy_pct"],
                current_score=stats["current_score"],
                score_delta=stats["score_delta"],
                streak=stats["streak"],
                top_weakness=stats["top_weakness"],
            )
            _send_email(stats["email"], subject, html)
            sent += 1
        except Exception as e:
            logger.error(f"Weekly summary error for user {user_id}: {e}")
            errors += 1

    return {"sent": sent, "errors": errors}


async def weekly_summary_loop() -> None:
    """Check once per day; sends emails on Sunday."""
    while True:
        try:
            result = _run_weekly_summary()
            logger.info(f"Weekly summary cron: {result}")
        except Exception as e:
            logger.error(f"Weekly summary cron error: {e}")
        await asyncio.sleep(INTERVAL_SECONDS)
