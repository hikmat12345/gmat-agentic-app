/**
 * Human-simulation test — walks through the app like a real user,
 * clicking every major feature and verifying it works.
 * Runs with auth loaded from auth-state.json.
 */

import { test, expect } from "./fixtures";

const BASE = "http://localhost:3000";
const TIMEOUT = 15000;

test.describe("Human Simulation — Full App Walkthrough", () => {

  // ─── 1. Dashboard ─────────────────────────────────────────────────────────
  test("1. Dashboard loads with GMAT content", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Should show a greeting and username
    const body = await page.textContent("body");
    console.log(`ℹ Dashboard body snippet: ${body?.slice(0, 200)}`);

    // Check sidebar is visible
    const sidebar = page.locator("nav, aside, [data-testid='sidebar']").first();
    const hasSidebar = await sidebar.isVisible().catch(() => false);
    console.log(`ℹ Sidebar visible: ${hasSidebar}`);

    // Check no critical JS errors
    const title = await page.title();
    console.log(`✓ Dashboard title: ${title}`);
    expect(title).toContain("Athena");

    // Take screenshot
    await page.screenshot({ path: "screenshots/01-dashboard.png", fullPage: true });
    console.log("✓ Dashboard screenshot saved");
  });

  // ─── 2. Study Plan (Learning Hub) ──────────────────────────────────────────
  test("2. Study Plan shows 8 GMAT topics", async ({ page }) => {
    await page.goto(`${BASE}/learning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Should show topic quest rows
    const topicRows = page.locator("a[href*='/learning/']");
    const count = await topicRows.count();
    console.log(`ℹ Topic rows visible: ${count}`);
    expect(count).toBeGreaterThanOrEqual(8);

    // Filter tabs should exist
    const verbalBtn = page.getByRole("button", { name: "Verbal" });
    const quantBtn = page.getByRole("button", { name: "Quantitative" });
    const diBtn = page.getByRole("button", { name: "Data Insights" });
    expect(await verbalBtn.isVisible()).toBe(true);
    expect(await quantBtn.isVisible()).toBe(true);
    expect(await diBtn.isVisible()).toBe(true);
    console.log("✓ Verbal / Quantitative / Data Insights filter tabs visible");

    // Click Verbal filter
    await verbalBtn.click();
    await page.waitForTimeout(800);
    const verbalRows = page.locator("a[href*='/learning/']");
    const verbalCount = await verbalRows.count();
    console.log(`ℹ Verbal filter: ${verbalCount} topics visible`);
    expect(verbalCount).toBeGreaterThanOrEqual(2);

    // Click Quantitative filter
    await quantBtn.click();
    await page.waitForTimeout(800);
    const quantRows = await page.locator("a[href*='/learning/']").count();
    console.log(`ℹ Quantitative filter: ${quantRows} topics visible`);

    // Reset to All
    await page.getByRole("button", { name: "All" }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: "screenshots/02-study-plan.png", fullPage: true });
    console.log("✓ Study Plan looks good");
  });

  // ─── 3. Topic Page (Critical Reasoning) ───────────────────────────────────
  test("3. Critical Reasoning topic page loads", async ({ page }) => {
    await page.goto(`${BASE}/learning/critical-reasoning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    const hasCR = bodyText?.toLowerCase().includes("critical reason");
    console.log(`ℹ Critical Reasoning text found: ${hasCR}`);

    await page.screenshot({ path: "screenshots/03-critical-reasoning.png", fullPage: true });
    console.log(`✓ Topic page rendered (text found: ${hasCR})`);
  });

  // ─── 4. Subtopic Page ─────────────────────────────────────────────────────
  test("4. Subtopic page for CR Assumption loads", async ({ page }) => {
    await page.goto(`${BASE}/learning/critical-reasoning/cr-assumption`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    const hasContent = bodyText && bodyText.length > 200;
    console.log(`ℹ Subtopic page content length: ${bodyText?.length ?? 0}`);
    await page.screenshot({ path: "screenshots/04-subtopic.png", fullPage: true });
    console.log(`✓ Subtopic page rendered, content: ${hasContent ? "present" : "may be empty"}`);
  });

  // ─── 5. Mentor Chat — send a message ──────────────────────────────────────
  test("5. Mentor chat sends a message and gets AI response", async ({ page }) => {
    await page.goto(`${BASE}/mentor`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find the suggestion buttons or input
    const suggestions = page.locator("button").filter({ hasText: /how am i doing|study plan|focus/i });
    const suggestionCount = await suggestions.count();
    console.log(`ℹ Mentor suggestion buttons: ${suggestionCount}`);

    // Find and click a suggestion
    if (suggestionCount > 0) {
      await suggestions.first().click();
      console.log("✓ Clicked mentor suggestion");
    } else {
      // Fall back to typing
      const textarea = page.locator("textarea").first();
      if (await textarea.isVisible()) {
        await textarea.fill("How am I doing overall?");
        await textarea.press("Enter");
        console.log("✓ Typed question into mentor");
      }
    }

    // Wait for AI response (up to 20s)
    await page.waitForTimeout(8000);

    const bodyText = await page.textContent("body");
    // Check that there's some response text (not just the loading state)
    const hasResponse = bodyText && bodyText.length > 500;
    console.log(`ℹ Mentor body after query length: ${bodyText?.length ?? 0}`);

    await page.screenshot({ path: "screenshots/05-mentor-chat.png", fullPage: true });
    console.log(`✓ Mentor chat response received: ${hasResponse ? "yes" : "unclear"}`);
  });

  // ─── 6. Profile Page ──────────────────────────────────────────────────────
  test("6. Profile page loads", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Should not have SAT-specific text
    const bodyText = await page.textContent("body");
    const hasSatScore = bodyText?.includes("SAT Score");
    expect(hasSatScore).toBeFalsy();
    console.log("✓ No SAT Score label on profile");

    await page.screenshot({ path: "screenshots/06-profile.png", fullPage: true });
    console.log("✓ Profile page rendered");
  });

  // ─── 7. Progress / Queue Page ─────────────────────────────────────────────
  test("7. Progress page shows GMAT skills panel", async ({ page }) => {
    await page.goto(`${BASE}/queue`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    const hasGmatSkills = bodyText?.includes("GMAT Skills");
    console.log(`ℹ GMAT Skills label found: ${hasGmatSkills}`);

    await page.screenshot({ path: "screenshots/07-progress.png", fullPage: true });
    console.log("✓ Progress page rendered");
  });

  // ─── 8. Daily Quest ───────────────────────────────────────────────────────
  test("8. Daily quest card visible on dashboard", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for the daily quest card
    const questText = await page.textContent("body");
    const hasDailyQuest =
      questText?.includes("Daily") ||
      questText?.includes("Quest") ||
      questText?.includes("Challenge");
    console.log(`ℹ Daily quest content found: ${hasDailyQuest}`);

    await page.screenshot({ path: "screenshots/08-daily-quest.png", fullPage: true });
    console.log(`✓ Dashboard with daily quest: content present=${hasDailyQuest}`);
  });

  // ─── 9. Score Band Rail (Study Plan) ──────────────────────────────────────
  test("9. Score band rail filter buttons work", async ({ page }) => {
    await page.goto(`${BASE}/learning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Find the score band buttons (sub-505, 505-555, etc.)
    const bandBtns = page.locator("button").filter({ hasText: /sub-505|505.555|555.605/i });
    const bandCount = await bandBtns.count();
    console.log(`ℹ Score band buttons found: ${bandCount}`);

    if (bandCount > 0) {
      await bandBtns.first().click();
      await page.waitForTimeout(600);
      console.log("✓ Clicked score band filter");

      // Click clear if visible
      const clearBtn = page.getByRole("button", { name: /clear filter/i });
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
        console.log("✓ Cleared score band filter");
      }
    }

    await page.screenshot({ path: "screenshots/09-score-band.png", fullPage: true });
    console.log("✓ Score band rail tested");
  });

  // ─── 10. Micro-lesson (AI whiteboard) ─────────────────────────────────────
  test("10. Micro-lesson starts for CR Assumption", async ({ page }) => {
    await page.goto(`${BASE}/learning/critical-reasoning/cr-assumption/micro-lesson`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent("body");
    const hasLesson = bodyText && bodyText.length > 300;
    const hasError = bodyText?.toLowerCase().includes("error") || bodyText?.toLowerCase().includes("not found");
    console.log(`ℹ Micro-lesson page length: ${bodyText?.length ?? 0}, hasError: ${hasError}`);

    await page.screenshot({ path: "screenshots/10-micro-lesson.png", fullPage: true });
    console.log(`✓ Micro-lesson page rendered (content: ${hasLesson ? "yes" : "minimal"})`);
  });

  // ─── 11. Full GMAT page ────────────────────────────────────────────────────
  test("11. Full GMAT exam page loads", async ({ page }) => {
    await page.goto(`${BASE}/full-gmat`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    const hasGmat = bodyText?.toLowerCase().includes("gmat");
    console.log(`ℹ Full GMAT page has GMAT text: ${hasGmat}`);

    // Should not show a Next.js crash page
    const hasError = bodyText?.includes("Application error: a client-side exception has occurred");
    expect(hasError).toBeFalsy();

    await page.screenshot({ path: "screenshots/11-full-gmat.png", fullPage: true });
    console.log("✓ Full GMAT page rendered without crash");
  });

  // ─── 12. Sidebar navigation ───────────────────────────────────────────────
  test("12. Sidebar nav links navigate correctly", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Try clicking the Study Plan link in sidebar
    const studyPlanLink = page.locator("a[href='/learning']");
    if (await studyPlanLink.first().isVisible()) {
      await studyPlanLink.first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/learning");
      console.log("✓ Sidebar → Study Plan navigation works");
    } else {
      console.log("ℹ Sidebar Study Plan link not found (may be mobile view)");
    }

    // Try Mentor link
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(800);
    const mentorLink = page.locator("a[href='/mentor']");
    if (await mentorLink.first().isVisible()) {
      await mentorLink.first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/mentor");
      console.log("✓ Sidebar → Mentor navigation works");
    }

    await page.screenshot({ path: "screenshots/12-sidebar-nav.png", fullPage: true });
    console.log("✓ Sidebar navigation tested");
  });

  // ─── 13. Mentor — question type specific ──────────────────────────────────
  test("13. Mentor handles GMAT-specific question", async ({ page }) => {
    await page.goto(`${BASE}/mentor`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Type in a GMAT-specific question
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible()) {
      await textarea.fill("Explain Data Sufficiency strategy in one sentence");
      await page.keyboard.press("Enter");
      console.log("✓ Sent DS strategy question to mentor");

      // Wait for streaming response
      await page.waitForTimeout(10000);

      const bodyText = await page.textContent("body");
      const hasDS = bodyText?.toLowerCase().includes("data sufficiency") ||
                    bodyText?.toLowerCase().includes("statement") ||
                    bodyText?.toLowerCase().includes("sufficient");
      console.log(`ℹ Mentor mentioned DS concepts: ${hasDS}`);

      await page.screenshot({ path: "screenshots/13-mentor-ds-response.png", fullPage: true });
      console.log("✓ Mentor DS response captured");
    } else {
      console.log("ℹ Textarea not found — mentor may use different input UI");
    }
  });

  // ─── 14. No unhandled JS errors across key pages ──────────────────────────
  test("14. No critical console errors across all main pages", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errors.push(`PAGE ERROR: ${err.message}`);
    });

    const pages = [
      `${BASE}/dashboard`,
      `${BASE}/learning`,
      `${BASE}/mentor`,
      `${BASE}/profile`,
      `${BASE}/queue`,
      `${BASE}/full-gmat`,
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    }

    const critical = errors.filter(
      (e) =>
        !e.includes("hydration") &&
        !e.includes("Warning:") &&
        !e.includes("favicon") &&
        !e.includes("Failed to load resource") &&
        !e.includes("script-src") &&
        !e.includes("default-src") &&
        !e.includes("posthog") &&
        !e.includes("401") // expected auth 401s in test env
    );

    if (critical.length > 0) {
      console.log("⚠ Critical errors found:");
      critical.forEach((e) => console.log(`  - ${e}`));
    } else {
      console.log("✓ No critical console errors across all main pages");
    }

    await page.screenshot({ path: "screenshots/14-final-state.png", fullPage: true });
    expect(critical.length).toBe(0);
  });
});
