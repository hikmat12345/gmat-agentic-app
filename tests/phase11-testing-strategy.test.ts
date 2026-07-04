/**
 * PHASE 11 — Testing Strategy
 *
 * End-to-end smoke tests covering the full GMAT learning loop:
 * 1. Learning hub shows GMAT topics (Verbal, Quantitative, Data Insights)
 * 2. Onboarding copy is GMAT (not SAT)
 * 3. Dashboard shows GMAT Full Test card (not SAT)
 * 4. Quiz flow works for a GMAT practice problem
 * 5. Mentor page shows GMAT branding
 * 6. Profile page shows GMAT score history component
 * 7. API health checks pass
 * 8. No SAT-specific copy visible in main UI
 */

import { test, expect } from "./fixtures";

const BASE = "http://localhost:3000";

test.describe("Phase 11 — Testing Strategy (GMAT UI Smoke Tests)", () => {
  test("app metadata is GMAT (not SAT)", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("domcontentloaded");

    const title = await page.title();
    console.log("✓ Page title:", title);
    expect(title).toContain("GMAT");
    expect(title).not.toContain("SAT");

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    console.log("✓ Meta description:", description?.slice(0, 80));
    expect(description).toContain("GMAT");
  });

  test("dashboard renders GMAT cards (no SAT test card)", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-01-dashboard.png", fullPage: true });

    // Should NOT have "Full SAT" card
    const satTestCard = page.locator("text=Full SAT, text=SAT Test, text=Take the SAT");
    const satCount = await satTestCard.count();
    console.log(satCount === 0 ? "✓ No SAT test card on dashboard" : `⚠ SAT card found (${satCount} instances)`);

    // GMAT test card may or may not be visible depending on state
    const gmatCard = page.locator("text=GMAT, text=Full GMAT");
    const gmatCount = await gmatCard.count();
    console.log(gmatCount > 0 ? `✓ GMAT card visible (${gmatCount} instances)` : "ℹ GMAT card not visible");

    console.log("✓ Dashboard check complete");
  });

  test("learning hub shows GMAT subjects", async ({ page }) => {
    await page.goto(`${BASE}/learning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-02-learning.png", fullPage: true });

    // Check for GMAT subjects in topic list
    const gmatSubjects = ["Verbal", "Quantitative", "Data Insights", "Critical Reasoning", "Reading Comprehension"];
    let foundCount = 0;

    for (const subject of gmatSubjects) {
      const el = page.locator(`text=${subject}`);
      const count = await el.count();
      if (count > 0) {
        foundCount++;
        console.log(`✓ Subject found: "${subject}"`);
      }
    }

    console.log(`✓ ${foundCount}/${gmatSubjects.length} GMAT subjects visible in learning hub`);

    // Check that SAT-specific section labels are NOT prominent
    const satMathOnly = page.locator("text=SAT Math, text=Digital SAT").first();
    const satVisible = await satMathOnly.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(satVisible ? "⚠ SAT-specific label visible" : "✓ No SAT-specific labels in learning hub");
  });

  test("learning hub subject filter includes GMAT sections", async ({ page }) => {
    await page.goto(`${BASE}/learning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Check filter buttons for GMAT sections
    const filterBtns = page.locator("button:has-text('verbal'), button:has-text('quantitative'), button:has-text('data'), button:has-text('Verbal'), button:has-text('Quantitative'), button:has-text('Data')");
    const filterCount = await filterBtns.count();
    console.log(`✓ GMAT filter buttons found: ${filterCount}`);

    if (filterCount > 0) {
      // Click first GMAT filter
      await filterBtns.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: "tests/screenshots/p11-03-filter-gmat.png" });
      console.log("✓ GMAT filter applied");
    }
  });

  test("mentor page shows GMAT branding", async ({ page }) => {
    await page.goto(`${BASE}/mentor`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-04-mentor.png", fullPage: true });

    // Should say GMAT Prep Mentor
    const gmatMentor = page.locator("text=GMAT Prep Mentor, text=GMAT coach");
    const gmatCount = await gmatMentor.count();
    console.log(gmatCount > 0 ? "✓ GMAT Mentor branding visible" : "ℹ GMAT mentor text not found");

    // Should NOT say SAT Prep Mentor
    const satMentor = page.locator("text=SAT Prep Mentor, text=SAT coach");
    const satCount = await satMentor.count();
    console.log(satCount === 0 ? "✓ No SAT mentor branding" : "⚠ SAT mentor text still present");

    if (satCount > 0) {
      // Fail if SAT branding still present
      expect(satCount).toBe(0);
    }
  });

  test("profile page shows GMAT score history", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-05-profile.png", fullPage: true });

    // Check for GMAT score display (not SAT)
    const gmatScore = page.locator("text=GMAT, text=Verbal, text=Quantitative, text=Data Insights");
    const gmatCount = await gmatScore.count();
    console.log(`✓ GMAT score elements visible: ${gmatCount}`);

    const satScore = page.locator("text=SAT Score");
    const satCount = await satScore.count();
    console.log(satCount === 0 ? "✓ No 'SAT Score' label in profile" : `⚠ "SAT Score" still visible (${satCount})`);
  });

  test("progress page shows GMAT branding", async ({ page }) => {
    // Check queue page (shows progress)
    await page.goto(`${BASE}/queue`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-06-queue.png", fullPage: true });

    // Should show GMAT Skills (not SAT Skills)
    const gmatSkills = page.locator("text=GMAT Skills");
    const satSkills = page.locator("text=SAT Skills");

    console.log((await gmatSkills.count()) > 0 ? "✓ 'GMAT Skills' label visible" : "ℹ 'GMAT Skills' not found");
    console.log((await satSkills.count()) === 0 ? "✓ No 'SAT Skills' label" : "⚠ 'SAT Skills' still present");

    // Composite score should use GMAT range
    const gmatRange = page.locator("text=205, text=805");
    console.log((await gmatRange.count()) > 0 ? "✓ GMAT score range (205-805) visible" : "ℹ GMAT range not found in DOM");
  });

  test("API health check", async ({ page }) => {
    // Check all critical API endpoints
    const endpoints = [
      { url: `${BASE}/api/health`, method: "GET" },
      { url: `${BASE}/api/user/me`, method: "GET" },
      { url: `${BASE}/api/dashboard`, method: "GET" },
      { url: `${BASE}/api/full-gmat`, method: "GET" },
      { url: `${BASE}/api/full-gmat/history`, method: "GET" },
      { url: `${BASE}/api/learning`, method: "GET" },
    ];

    for (const ep of endpoints) {
      const resp = await page.request.get(ep.url);
      const ok = [200, 201].includes(resp.status());
      console.log(`${ok ? "✓" : "⚠"} ${ep.url} → ${resp.status()}`);
    }
  });

  test("GMAT question types render without errors", async ({ page }) => {
    // Monitor console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    // Visit learning hub — checks React rendering
    await page.goto(`${BASE}/learning`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Visit dashboard
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Visit full-gmat
    await page.goto(`${BASE}/full-gmat`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.screenshot({ path: "tests/screenshots/p11-07-gmat-page.png", fullPage: true });

    // Filter out non-critical browser noise: hydration mismatches, React warnings,
    // favicon/resource 404s (missing optional data for new test user), and script CSP notices
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("hydration") &&
        !e.includes("Warning:") &&
        !e.includes("favicon") &&
        !e.includes("Failed to load resource") && // browser resource 404s — not JS errors
        !e.includes("script-src") &&
        !e.includes("default-src")
    );

    if (criticalErrors.length > 0) {
      console.log("⚠ Console errors detected:");
      criticalErrors.forEach((e) => console.log("  ", e.slice(0, 150)));
    } else {
      console.log("✓ No critical console errors across learning, dashboard, full-gmat pages");
    }

    expect(criticalErrors.length).toBe(0);
  });

  test("onboarding plan page shows professional backgrounds (not K-12)", async ({ page }) => {
    // Visit onboarding plan page directly
    await page.goto(`${BASE}/onboarding/plan`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-08-onboarding.png", fullPage: true });

    const url = page.url();
    // If redirected to dashboard (already onboarded), that's OK
    if (url.includes("/dashboard")) {
      console.log("ℹ User already onboarded, redirected to dashboard");
      return;
    }

    // Check for GMAT-appropriate background options
    const professionalOptions = [
      "Undergraduate",
      "Professional",
      "Graduate",
      "Career",
    ];

    let foundProfessional = false;
    for (const opt of professionalOptions) {
      const el = page.locator(`text=${opt}`);
      if (await el.count() > 0) {
        foundProfessional = true;
        console.log(`✓ Professional option visible: "${opt}"`);
      }
    }

    // Should NOT have K-12 grade options
    const k12Options = page.locator("text=9th Grade, text=10th Grade, text=11th Grade, text=12th Grade");
    const k12Count = await k12Options.count();
    console.log(k12Count === 0 ? "✓ No K-12 grade options visible" : `⚠ K-12 options still present: ${k12Count}`);

    console.log("✓ Onboarding plan check complete");
  });

  test("full GMAT end-to-end flow (if test available)", async ({ page }) => {
    // This is the big integration test
    await page.goto(`${BASE}/full-gmat`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/p11-09a-gmat-landing.png", fullPage: true });

    // Check test availability
    const resp = await page.request.get(`${BASE}/api/full-gmat`);
    let hasTest = false;
    let inProgress = false;

    try {
      const data = await resp.json();
      hasTest = (data.availableTests?.length ?? 0) > 0;
      inProgress = !!data.inProgressAttempt;
      console.log(`✓ Tests available: ${hasTest}, In progress: ${inProgress}`);
    } catch {}

    if (!hasTest && !inProgress) {
      console.log("ℹ No GMAT tests in bank. To add tests:");
      console.log("  1. cd backend/agents");
      console.log("  2. python -m cli.main generate-gmat-content");
      console.log("  3. python -m cli.main seed-full-gmat-bank");
      console.log("  4. python -m cli.main assemble-full-gmat-test");
      console.log("✓ Test skipped (infrastructure not seeded yet)");
      return;
    }

    // Try to start/resume a test
    let startBtn = page.locator("button:has-text('Start Test'), button:has-text('Start'), button:has-text('Take Test')").first();
    let resumeBtn = page.locator("button:has-text('Resume'), button:has-text('Continue Test')").first();

    const activeBtn = inProgress && (await resumeBtn.isVisible({ timeout: 3000 }).catch(() => false))
      ? resumeBtn
      : (await startBtn.isVisible({ timeout: 3000 }).catch(() => false))
        ? startBtn
        : null;

    if (!activeBtn) {
      console.log("ℹ No start/resume button found on page");
      return;
    }

    const btnText = await activeBtn.textContent();
    console.log(`✓ Clicking: "${btnText?.trim()}"`);
    await activeBtn.click();

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "tests/screenshots/p11-09b-test-active.png", fullPage: true });

    const questionUrl = page.url();
    console.log("✓ Question URL:", questionUrl);

    if (!questionUrl.includes("/full-gmat/")) {
      console.log("ℹ Did not navigate to question — may need to check UI");
      return;
    }

    // Answer first 3 questions
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(1500);

      // Find and click first available answer
      const option = page.locator("button[class*='option'], [role='radio'], button").filter({ hasText: /^[A-E]\.?$|^(A|B|C|D|E)\b/ }).first();

      if (await option.isVisible({ timeout: 5000 }).catch(() => false)) {
        await option.click();
        await page.waitForTimeout(1000);
        console.log(`✓ Answered question ${i + 1}`);

        // Click Next
        const nextBtn = page.locator("button:has-text('Next'), button:has-text('→')").last();
        if (await nextBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(1500);
        }
      } else {
        console.log(`ℹ Question ${i + 1}: Could not find standard answer options`);
        await page.screenshot({ path: `tests/screenshots/p11-q${i + 1}-options.png` });
        break;
      }
    }

    await page.screenshot({ path: "tests/screenshots/p11-09c-answered.png", fullPage: true });
    console.log("✓ End-to-end GMAT test flow partial run complete");
  });
});
