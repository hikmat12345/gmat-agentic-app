const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://athena-pov.com";

// ─── Shared design tokens ────────────────────────────────────────────────────
const c = {
  navy:    "#0d0f1a",
  navyMid: "#1a1d2e",
  amber:   "#f5a623",
  amberDk: "#d4891a",
  indigo:  "#6366f1",
  white:   "#ffffff",
  offWhite:"#f1f3f9",
  gray1:   "#e5e7eb",
  gray2:   "#9ca3af",
  gray3:   "#6b7280",
  gray4:   "#374151",
  text:    "#111827",
};

function shell(headerHtml: string, bodyHtml: string, footerNote = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Athena GMAT</title>
</head>
<body style="margin:0;padding:0;background:${c.offWhite};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.offWhite};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td style="background:${c.navy};border-radius:16px 16px 0 0;padding:28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:800;color:${c.white};letter-spacing:-0.5px;">
                      ⚡ Athena
                    </span>
                    <span style="margin-left:6px;font-size:12px;font-weight:600;color:${c.amber};text-transform:uppercase;letter-spacing:1px;">
                      GMAT Coach
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:${c.gray2};letter-spacing:0.5px;">GMAT COACH Prep</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- AMBER ACCENT BAR -->
          <tr>
            <td style="background:linear-gradient(90deg,${c.amber} 0%,${c.amberDk} 100%);height:3px;"></td>
          </tr>

          <!-- HERO CONTENT -->
          ${headerHtml}

          <!-- BODY CONTENT -->
          <tr>
            <td style="background:${c.white};padding:0 36px 36px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${c.navyMid};border-radius:0 0 16px 16px;padding:20px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:${c.gray2};line-height:1.6;">
                      ${footerNote || "You're receiving this because you have an Athena account."}
                      &nbsp;·&nbsp;
                      <a href="${appUrl}" style="color:${c.amber};text-decoration:none;">athena-pov.com</a>
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:${c.gray2};">© ${new Date().getFullYear()} Athena</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string) {
  return `<a href="${href}"
    style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${c.indigo} 0%,#4f46e5 100%);color:${c.white};text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;box-shadow:0 4px 14px rgba(99,102,241,0.35);"
  >${label}</a>`;
}

function statPill(value: string, label: string, color: string) {
  return `<td align="center" style="padding:0 8px;">
    <div style="background:${c.offWhite};border-radius:12px;padding:16px 20px;min-width:80px;">
      <p style="margin:0;font-size:24px;font-weight:800;color:${color};">${value}</p>
      <p style="margin:4px 0 0;font-size:11px;font-weight:600;color:${c.gray2};text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
    </div>
  </td>`;
}

// ─── 1. Welcome email ────────────────────────────────────────────────────────
export function welcomeEmailHtml({ displayName }: { displayName: string }) {
  const hero = `
    <tr>
      <td style="background:${c.navy};padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">🎯</p>
        <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${c.white};line-height:1.2;">
          Welcome aboard,<br><span style="color:${c.amber};">${displayName}!</span>
        </h1>
        <p style="margin:0;font-size:15px;color:${c.gray2};line-height:1.6;">Your GMAT journey starts now.</p>
      </td>
    </tr>`;

  const body = `
    <p style="margin:28px 0 20px;font-size:16px;font-weight:600;color:${c.text};">Here's what Athena gives you:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ["🧠", "Adaptive AI Tutor", "Socratic hints that guide you — never just gives the answer."],
        ["📊", "GMAT Scoring (205–805)", "Real-time V / Q / DI scores that update after every session."],
        ["🎯", "Daily Quest", "20 personalized questions targeting your exact weak spots."],
        ["🖥️", "Visual Micro-Lessons", "Interactive whiteboard lessons for every subtopic."],
        ["📅", "Smart Scheduling", "Study at your chosen time — Athena reminds you."],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${c.gray1};">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:22px;width:40px;vertical-align:top;padding-top:2px;">${icon}</td>
                <td style="padding-left:8px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:${c.text};">${title}</p>
                  <p style="margin:2px 0 0;font-size:13px;color:${c.gray3};line-height:1.5;">${desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("")}
    </table>

    <p style="text-align:center;margin:32px 0 0;">
      ${ctaButton("Go to My Dashboard →", `${appUrl}/dashboard`)}
    </p>
    <p style="text-align:center;margin:16px 0 0;font-size:13px;color:${c.gray2};">
      Start with the onboarding quiz — it sets your baseline score in 15 minutes.
    </p>`;

  return {
    subject: `Welcome to Athena, ${displayName}! Your GMAT prep starts now`,
    html: shell(hero, body, "You signed up for Athena GMAT Coach."),
  };
}

// ─── 2. Session reminder ─────────────────────────────────────────────────────
export function sessionReminderHtml({
  displayName,
  startTime,
  streakDays = 0,
  todayTopic = "",
}: {
  displayName: string;
  startTime: string;
  streakDays?: number;
  todayTopic?: string;
}) {
  const hero = `
    <tr>
      <td style="background:${c.navy};padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">⏰</p>
        <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${c.white};line-height:1.2;">
          Study time,&nbsp;<span style="color:${c.amber};">${displayName}!</span>
        </h1>
        <p style="margin:0;font-size:16px;color:${c.gray2};">
          Your session starts at <strong style="color:${c.white};">${startTime}</strong>
        </p>
      </td>
    </tr>`;

  const body = `
    ${streakDays > 0 ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 24px;">
        <tr>
          ${statPill(`🔥 ${streakDays}`, "Day Streak", c.amber)}
          ${todayTopic ? statPill("📖", "Topic Today", c.indigo) : ""}
        </tr>
      </table>` : `<div style="height:28px;"></div>`}

    ${todayTopic ? `
      <div style="background:${c.offWhite};border-left:4px solid ${c.amber};border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${c.gray2};">Today's Focus</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:${c.text};">${todayTopic}</p>
      </div>` : ""}

    <p style="font-size:15px;color:${c.gray4};line-height:1.7;margin:0 0 28px;">
      Consistency is what separates GMAT achievers from the rest. Your 20-question quest is ready — each one calibrated to your exact level.
    </p>

    <p style="text-align:center;margin:0;">
      ${ctaButton("Start My Session →", `${appUrl}/quest`)}
    </p>
    <p style="text-align:center;margin:16px 0 0;font-size:13px;color:${c.gray2};">
      Takes only 20–30 minutes. Your score improves every session.
    </p>`;

  return {
    subject: `⏰ Study time, ${displayName} — your GMAT session starts at ${startTime}`,
    html: shell(hero, body, "You're receiving this because you have a study reminder set."),
  };
}

// ─── 3. Mentor booking (to mentor inbox) ────────────────────────────────────
export function mentorBookingHtml({
  studentName,
  studentEmail,
  day,
  time,
  meetLink,
}: {
  studentName: string;
  studentEmail: string;
  day: string;
  time: string;
  meetLink?: string;
}) {
  const hero = `
    <tr>
      <td style="background:${c.navy};padding:32px 36px 36px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${c.amber};">New Booking Request</p>
        <h1 style="margin:0;font-size:24px;font-weight:800;color:${c.white};line-height:1.3;">
          ${studentName} wants to book a session
        </h1>
      </td>
    </tr>`;

  const rows: [string, string][] = [
    ["👤 Student", studentName],
    ["📧 Email", `<a href="mailto:${studentEmail}" style="color:${c.indigo};text-decoration:none;">${studentEmail}</a>`],
    ["📅 Day", `<strong>${day}</strong>`],
    ["🕐 Time", `<strong style="color:${c.amber};font-size:16px;">${time}</strong>`],
  ];
  if (meetLink) {
    rows.push(["📹 Meet Link", `<a href="${meetLink}" style="color:${c.indigo};text-decoration:none;font-weight:600;">${meetLink}</a>`]);
  }

  const body = `
    <div style="height:28px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${c.gray1};border-radius:12px;overflow:hidden;margin-bottom:28px;">
      ${rows.map(([label, value], i) => `
        <tr style="background:${i % 2 === 0 ? c.white : c.offWhite};">
          <td style="padding:14px 20px;font-size:13px;color:${c.gray2};font-weight:600;width:140px;white-space:nowrap;">${label}</td>
          <td style="padding:14px 20px;font-size:14px;color:${c.text};">${value}</td>
        </tr>`).join("")}
    </table>

    ${meetLink ? `
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${meetLink}"
        style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#1a73e8;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(26,115,232,0.35);"
      >
        <span style="font-size:18px;">📹</span> Join Google Meet
      </a>
      <p style="margin:10px 0 0;font-size:12px;color:${c.gray2};">Send this link to the student when confirming.</p>
    </div>` : ""}

    <div style="background:${c.offWhite};border-radius:10px;padding:18px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;color:${c.gray3};line-height:1.6;">
        💡 <strong>Reply directly to this email</strong> to confirm the session. The reply-to is already set to the student's address.
      </p>
    </div>

    <p style="text-align:center;margin:0;">
      <a href="mailto:${studentEmail}?subject=Re: Your Athena session on ${day} at ${time}${meetLink ? `&body=Hi ${studentName},%0A%0AYour session is confirmed for ${day} at ${time}.%0A%0AJoin via Google Meet: ${meetLink}%0A%0ASee you then!` : ""}"
        style="display:inline-block;padding:14px 32px;background:${c.navy};color:${c.white};text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;border:2px solid ${c.amber};"
      >Reply to ${studentName} →</a>
    </p>`;

  return {
    subject: `📅 Booking: ${studentName} — ${day} at ${time}`,
    html: shell(hero, body, "Sent via Athena GMAT Coach booking system."),
  };
}

// ─── 4. Friend invitation (sent to the invited person) ───────────────────────
export function friendInviteHtml({
  inviterName,
  inviterScore = 0,
}: {
  inviterName: string;
  inviterScore?: number;
}) {
  const hero = `
    <tr>
      <td style="background:${c.navy};padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">🏆</p>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:${c.white};line-height:1.2;">
          <span style="color:${c.amber};">${inviterName}</span> challenged you on Athena
        </h1>
        <p style="margin:0;font-size:14px;color:${c.gray2};">Beat their GMAT score. Join the leaderboard.</p>
      </td>
    </tr>`;

  const body = `
    ${inviterScore > 0 ? `
      <div style="text-align:center;margin:28px 0 24px;">
        <div style="display:inline-block;background:${c.offWhite};border-radius:16px;padding:20px 32px;">
          <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${c.gray2};">${inviterName}'s Score</p>
          <p style="margin:6px 0 0;font-size:40px;font-weight:900;color:${c.amber};">${inviterScore}</p>
          <p style="margin:2px 0 0;font-size:12px;color:${c.gray2};">Can you beat it?</p>
        </div>
      </div>` : `<div style="height:28px;"></div>`}

    <p style="font-size:15px;color:${c.gray4};line-height:1.7;margin:0 0 20px;">
      Athena is an GMAT COACH GMAT coach that adapts to you — tracking your Verbal, Quantitative, and Data Insights scores in real time.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["🎯", "Personalized daily quests", "20 questions calibrated to your level"],
        ["🤖", "AI tutor on every question", "Gets Socratic when you're stuck"],
        ["📈", "Real GMAT score (205–805)", "Updates after every session"],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${c.gray1};">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:20px;width:36px;vertical-align:middle;">${icon}</td>
                <td style="padding-left:10px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:${c.text};">${title}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:${c.gray3};">${desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("")}
    </table>

    <p style="text-align:center;margin:0;">
      ${ctaButton("Accept the Challenge →", `${appUrl}/sign-up`)}
    </p>
    <p style="text-align:center;margin:16px 0 0;font-size:13px;color:${c.gray2};">
      Free to start · No credit card required
    </p>`;

  return {
    subject: `${inviterName} challenged you to beat their GMAT score on Athena`,
    html: shell(hero, body, `You were invited by ${inviterName}.`),
  };
}

// ─── 5. Subscription confirmation ────────────────────────────────────────────
export function subscriptionConfirmedHtml({
  displayName,
  plan,
  renewsAt,
}: {
  displayName: string;
  plan: "monthly" | "annual";
  renewsAt: string;
}) {
  const price = plan === "annual" ? "$199 / year" : "$29 / month";
  const hero = `
    <tr>
      <td style="background:${c.navy};padding:36px 36px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:42px;">✅</p>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:${c.white};line-height:1.2;">
          You're on <span style="color:${c.amber};">Athena Premium</span>
        </h1>
        <p style="margin:0;font-size:14px;color:${c.gray2};">Full access unlocked, ${displayName}.</p>
      </td>
    </tr>`;

  const body = `
    <div style="background:${c.offWhite};border-radius:12px;padding:20px 24px;margin:28px 0 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${[
          ["Plan", plan === "annual" ? "Annual (Best Value)" : "Monthly"],
          ["Price", price],
          ["Next renewal", renewsAt],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:8px 0;font-size:13px;color:${c.gray2};font-weight:600;width:130px;">${label}</td>
            <td style="padding:8px 0;font-size:14px;font-weight:700;color:${c.text};">${value}</td>
          </tr>`).join("")}
      </table>
    </div>

    <p style="font-size:14px;font-weight:700;color:${c.text};margin:0 0 12px;">Everything now unlocked:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["⚡", "Daily Quest", "20 adaptive GMAT questions every day"],
        ["🤖", "AI Mentor", "Unlimited personal coaching sessions"],
        ["🖥️", "Micro-Lessons", "Visual whiteboard lessons for every topic"],
        ["📝", "Full Practice Tests", "Timed GMAT Focus Edition simulations"],
        ["📊", "Advanced Analytics", "Weakness heatmap + improvement projection"],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid ${c.gray1};">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:18px;width:32px;">${icon}</td>
                <td style="padding-left:8px;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:${c.text};">${title}</p>
                  <p style="margin:1px 0 0;font-size:12px;color:${c.gray3};">${desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("")}
    </table>

    <p style="text-align:center;margin:0;">
      ${ctaButton("Start Your First Quest →", `${appUrl}/quest`)}
    </p>`;

  return {
    subject: `You're on Athena Premium — welcome, ${displayName}!`,
    html: shell(hero, body, "Receipt for your Athena Premium subscription."),
  };
}
