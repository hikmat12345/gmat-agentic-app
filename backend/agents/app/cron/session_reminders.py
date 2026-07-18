"""
Background cron that sends session reminder emails ~1-2 hours before
each user's scheduled study session. Runs every 30 minutes.
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import resend

from app.utils.db import client

logger = logging.getLogger(__name__)

INTERVAL_SECONDS = 30 * 60  # 30 minutes

APP_URL = os.environ.get("APP_URL", "https://athena-pov.com")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "Athena <noreply@athena.com>")


def _shell(header_html: str, body_html: str, footer_note: str = "") -> str:
    year = datetime.now(timezone.utc).year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f3f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- HEADER BAR -->
        <tr>
          <td style="background:#0d0f1a;border-radius:16px 16px 0 0;padding:28px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-size:22px;font-weight:800;color:#ffffff;">⚡ Athena</span>
                    <span style="margin-left:6px;font-size:12px;font-weight:600;color:#f5a623;text-transform:uppercase;letter-spacing:1px;">GMAT Coach</span></td>
                <td align="right"><span style="font-size:11px;color:#9ca3af;">GMAT COACH Prep</span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="background:linear-gradient(90deg,#f5a623 0%,#d4891a 100%);height:3px;"></td></tr>

        <!-- HERO -->
        {header_html}

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:0 36px 36px;">{body_html}</td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1d2e;border-radius:0 0 16px 16px;padding:20px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><p style="margin:0;font-size:11px;color:#9ca3af;">{footer_note or "You&#39;re receiving this because you have an Athena account."} &middot; <a href="{APP_URL}" style="color:#f5a623;text-decoration:none;">athena-pov.com</a></p></td>
                <td align="right"><p style="margin:0;font-size:11px;color:#9ca3af;">&copy; {year} Athena</p></td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _welcome_html(display_name: str) -> tuple[str, str]:
    subject = f"Welcome to Athena, {display_name}! Your GMAT prep starts now"
    hero = f"""
    <tr>
      <td style="background:#0d0f1a;padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">🎯</p>
        <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
          Welcome aboard,<br><span style="color:#f5a623;">{display_name}!</span>
        </h1>
        <p style="margin:0;font-size:15px;color:#9ca3af;">Your GMAT journey starts now.</p>
      </td>
    </tr>"""
    body = f"""
    <p style="margin:28px 0 20px;font-size:16px;font-weight:600;color:#111827;">Here&#39;s what Athena gives you:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:22px;width:40px;vertical-align:top;padding-top:2px;">🧠</td>
          <td style="padding-left:8px;"><p style="margin:0;font-size:14px;font-weight:700;color:#111827;">Adaptive AI Tutor</p><p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Socratic hints that guide you — never just gives the answer.</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:22px;width:40px;vertical-align:top;padding-top:2px;">📊</td>
          <td style="padding-left:8px;"><p style="margin:0;font-size:14px;font-weight:700;color:#111827;">GMAT Scoring (205–805)</p><p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Real-time V / Q / DI scores that update after every session.</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:22px;width:40px;vertical-align:top;padding-top:2px;">🎯</td>
          <td style="padding-left:8px;"><p style="margin:0;font-size:14px;font-weight:700;color:#111827;">Daily Quest</p><p style="margin:2px 0 0;font-size:13px;color:#6b7280;">20 personalized questions targeting your exact weak spots.</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:22px;width:40px;vertical-align:top;padding-top:2px;">📅</td>
          <td style="padding-left:8px;"><p style="margin:0;font-size:14px;font-weight:700;color:#111827;">Smart Scheduling</p><p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Study at your chosen time — Athena reminds you automatically.</p></td>
        </tr></table>
      </td></tr>
    </table>
    <p style="text-align:center;margin:32px 0 0;">
      <a href="{APP_URL}/dashboard" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(99,102,241,0.35);">Go to My Dashboard &rarr;</a>
    </p>
    <p style="text-align:center;margin:16px 0 0;font-size:13px;color:#9ca3af;">
      Start with the onboarding quiz &mdash; it sets your baseline score in 15 minutes.
    </p>"""
    return subject, _shell(hero, body, "You signed up for Athena GMAT Coach.")


def _reminder_html(display_name: str, start_time: str) -> tuple[str, str]:
    subject = f"⏰ Study time, {display_name} — your GMAT session starts at {start_time}"
    hero = f"""
    <tr>
      <td style="background:#0d0f1a;padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">⏰</p>
        <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">
          Study time,&nbsp;<span style="color:#f5a623;">{display_name}!</span>
        </h1>
        <p style="margin:0;font-size:16px;color:#9ca3af;">
          Your session starts at <strong style="color:#ffffff;">{start_time}</strong>
        </p>
      </td>
    </tr>"""
    body = f"""
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:28px 0;">
      Consistency is what separates GMAT achievers from the rest. Your 20-question daily quest is ready &mdash;
      each question calibrated to your exact skill level across Verbal, Quantitative, and Data Insights.
    </p>
    <div style="background:#f1f3f9;border-left:4px solid #f5a623;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
        🔥 <strong>Keep your streak alive.</strong> Missing a session resets your daily momentum &mdash; even 20 minutes today makes a measurable difference.
      </p>
    </div>
    <p style="text-align:center;margin:0;">
      <a href="{APP_URL}/quest" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(99,102,241,0.35);">Start My Session &rarr;</a>
    </p>
    <p style="text-align:center;margin:16px 0 0;font-size:13px;color:#9ca3af;">
      Takes only 20&ndash;30 minutes. Your score improves every session.
    </p>"""
    return subject, _shell(hero, body, "You&#39;re receiving this because you have a study reminder set.")


def _get_session_datetime(date_str: str, time_str: str, tz_name: str) -> datetime | None:
    """Combine date (YYYY-MM-DD) + time (HH:MM) in a timezone into a UTC-aware datetime."""
    try:
        tz = ZoneInfo(tz_name)
        year, month, day = map(int, date_str.split("-"))
        hour, minute = map(int, time_str.split(":"))
        local_dt = datetime(year, month, day, hour, minute, tzinfo=tz)
        return local_dt.astimezone(timezone.utc)
    except Exception:
        return None


def _format_time(date_str: str, time_str: str, tz_name: str) -> str:
    """Format time for display, e.g. '2:30 PM'."""
    try:
        tz = ZoneInfo(tz_name)
        year, month, day = map(int, date_str.split("-"))
        hour, minute = map(int, time_str.split(":"))
        local_dt = datetime(year, month, day, hour, minute, tzinfo=tz)
        return local_dt.strftime("%-I:%M %p")
    except Exception:
        return time_str


def _send_email(to: str, subject: str, html: str) -> None:
    resend.api_key = os.environ.get("RESEND_API_KEY", "")
    resend.Emails.send({
        "from": EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    })


def _run_reminders() -> dict:
    """Check for upcoming sessions and send reminder emails. Returns stats."""
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    tomorrow = now + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    db = client()
    resp = (
        db.table("sessions")
        .select("id, scheduled_date, schedule_id, user_id")
        .in_("scheduled_date", [today_str, tomorrow_str])
        .eq("status", "planned")
        .is_("reminder_sent_at", "null")
        .execute()
    )

    sessions = resp.data or []
    if not sessions:
        return {"sent": 0, "errors": 0}

    # Gather unique user and schedule IDs
    user_ids = list({s["user_id"] for s in sessions})
    schedule_ids = list({s["schedule_id"] for s in sessions})

    # Batch fetch users and schedules
    users_resp = db.table("users").select("id, email, display_name, timezone").in_("id", user_ids).execute()
    users_map = {u["id"]: u for u in (users_resp.data or [])}

    schedules_resp = db.table("schedules").select("id, start_time").in_("id", schedule_ids).execute()
    schedules_map = {s["id"]: s for s in (schedules_resp.data or [])}

    sent = 0
    errors = 0

    for session in sessions:
        user = users_map.get(session["user_id"])
        schedule = schedules_map.get(session["schedule_id"])
        if not user or not schedule:
            continue

        tz_name = user.get("timezone", "America/New_York")
        session_dt = _get_session_datetime(session["scheduled_date"], schedule["start_time"], tz_name)
        if not session_dt:
            continue

        diff_hours = (session_dt - now).total_seconds() / 3600
        if diff_hours < 1 or diff_hours > 2:
            continue

        display_time = _format_time(session["scheduled_date"], schedule["start_time"], tz_name)
        display_name = user.get("display_name") or "there"
        subject, html = _reminder_html(display_name, display_time)

        try:
            _send_email(user["email"], subject, html)
            db.table("sessions").update(
                {"reminder_sent_at": datetime.now(timezone.utc).isoformat()}
            ).eq("id", session["id"]).execute()
            sent += 1
        except Exception as e:
            logger.error(f"Failed to send reminder for session {session['id']}: {e}")
            errors += 1

    return {"sent": sent, "errors": errors}


async def session_reminder_loop() -> None:
    """Run the reminder check every 30 minutes."""
    while True:
        try:
            result = _run_reminders()
            if result["sent"] or result["errors"]:
                logger.info(f"Session reminders: {result}")
        except Exception as e:
            logger.error(f"Session reminder cron error: {e}")
        await asyncio.sleep(INTERVAL_SECONDS)
