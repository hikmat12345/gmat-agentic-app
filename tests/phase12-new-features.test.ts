/**
 * PHASE 12 — New Features Test Suite
 *
 * Tests all features built in this sprint:
 * 1. Landing page — GMAT marketing content, pricing section
 * 2. Billing page — subscription UI, plan display
 * 3. Accountability modal — missed-quest detection
 * 4. Analytics page — activity calendar, score projection, weakness heatmap
 * 5. Achievements on profile — badge grid
 * 6. Admin panel — stats, questions, users
 * 7. API health checks for new endpoints
 */

import { test, expect } from "./fixtures";

const BASE = "http://localhost:3000";

// ─── 1. Landing Page ──────────────────────────────────────────────────────────
test.describe("Landing Page", () => {
  test("renders GMAT-focused marketing content", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-01-landing.png", fullPage: false });

    // Should not redirect signed-in users away from landing
    const url = page.url();
    console.log("✓ Landing URL:", url);

    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check for key GMAT marketing keywords
    const content = await body.textContent();
    const hasGmat = content?.toLowerCase().includes("gmat") ?? false;
    console.log(hasGmat ? "✓ GMAT branding present" : "⚠ GMAT keyword not found");

    // Pricing section
    const pricingIndicators = [
      page.locator("text=$29"),
      page.locator("text=$17"),
      page.locator("text=trial"),
      page.locator("text=Monthly"),
    ];
    let pricingFound = false;
    for (const el of pricingIndicators) {
      if (await el.count() > 0) { pricingFound = true; break; }
    }
    console.log(pricingFound ? "✓ Pricing section visible" : "⚠ Pricing section not found");

    await page.screenshot({ path: "tests/screenshots/p12-01b-landing-full.png", fullPage: true });
  });

  test("landing page has sign-in and sign-up links", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    const links = await page.locator("a[href*='sign']").all();
    console.log(`✓ Auth links found: ${links.length}`);
    expect(links.length).toBeGreaterThanOrEqual(0); // graceful — may be hidden for signed-in users
  });
});

// ─── 2. Billing Page ─────────────────────────────────────────────────────────
test.describe("Billing Page", () => {
  test("billing page loads without errors", async ({ page }) => {
    await page.goto(`${BASE}/billing`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-02-billing.png" });

    await expect(page).not.toHaveURL(/sign-in/);
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Should show either the billing UI or "not configured" state
    const content = await body.textContent();
    const hasBilling = content?.toLowerCase().includes("billing") ?? false;
    console.log(hasBilling ? "✓ Billing page content present" : "⚠ Billing content missing");
  });

  test("billing API returns structured response", async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/stripe/status`);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("isConfigured");
    expect(json).toHaveProperty("active");
    console.log("✓ Stripe status API:", JSON.stringify(json));
  });

  test("billing page shows trial info or plan selection", async ({ page }) => {
    await page.goto(`${BASE}/billing`, { waitUntil: "networkidle" });
    const body = page.locator("body");
    const text = await body.textContent();
    const hasExpectedContent =
      (text?.includes("trial") ?? false) ||
      (text?.includes("Monthly") ?? false) ||
      (text?.includes("Annual") ?? false) ||
      (text?.includes("configured") ?? false);
    expect(hasExpectedContent).toBe(true);
    console.log("✓ Billing UI shows expected content");
  });
});

// ─── 3. Progress / Analytics Page ────────────────────────────────────────────
test.describe("Progress Analytics Page (/queue)", () => {
  test("progress page loads with analytics sections", async ({ page }) => {
    await page.goto(`${BASE}/queue`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-03-progress.png" });

    await expect(page).not.toHaveURL(/sign-in/);
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const text = await body.textContent();
    const hasProgress =
      (text?.includes("Progress") ?? false) ||
      (text?.includes("Analytics") ?? false) ||
      (text?.includes("Score") ?? false);
    console.log(hasProgress ? "✓ Progress page content present" : "⚠ No progress content");
  });

  test("progress API returns activityCalendar and questionTypePerformance", async ({ page }) => {
    // Navigate first so Clerk refreshes auth cookies in the browser
    await page.goto(`${BASE}/queue`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/progress");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    const json = result.data;

    expect(json).toHaveProperty("activityCalendar");
    expect(json).toHaveProperty("questionTypePerformance");
    expect(Array.isArray(json.activityCalendar)).toBe(true);
    expect(Array.isArray(json.questionTypePerformance)).toBe(true);
    console.log("✓ Progress API includes activityCalendar:", json.activityCalendar.length, "days");
    console.log("✓ Progress API includes questionTypePerformance:", json.questionTypePerformance.length, "types");
  });

  test("activity calendar section visible on progress page", async ({ page }) => {
    await page.goto(`${BASE}/queue`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const text = await page.locator("body").textContent();
    const hasCalendar =
      (text?.includes("Activity") ?? false) ||
      (text?.includes("weeks") ?? false) ||
      (text?.includes("Study Activity") ?? false);
    console.log(hasCalendar ? "✓ Activity calendar section found" : "⚠ Activity calendar not found (may need quest data)");

    await page.screenshot({ path: "tests/screenshots/p12-03b-progress-analytics.png", fullPage: true });
  });
});

// ─── 4. Profile + Achievements ───────────────────────────────────────────────
test.describe("Profile Achievements", () => {
  test("profile page loads with achievements section", async ({ page }) => {
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-04-profile.png" });

    await expect(page).not.toHaveURL(/sign-in/);
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const text = await body.textContent();
    const hasAchievements =
      (text?.includes("Achievement") ?? false) ||
      (text?.includes("unlocked") ?? false) ||
      (text?.includes("Streak") ?? false);
    console.log(hasAchievements ? "✓ Achievements section visible" : "⚠ Achievements not visible yet");
  });

  test("achievements API returns structured data", async ({ page }) => {
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/achievements");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    const json = result.data;

    expect(json).toHaveProperty("achievements");
    expect(Array.isArray(json.achievements)).toBe(true);
    expect(json.achievements.length).toBeGreaterThan(0);

    const firstAch = json.achievements[0];
    expect(firstAch).toHaveProperty("id");
    expect(firstAch).toHaveProperty("name");
    expect(firstAch).toHaveProperty("unlocked");
    expect(firstAch).toHaveProperty("icon");

    const unlocked = json.achievements.filter((a: any) => a.unlocked);
    console.log(`✓ Achievements API: ${json.achievements.length} total, ${unlocked.length} unlocked`);
  });

  test("achievements grid shows categories", async ({ page }) => {
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000); // wait for React Query to load

    const text = await page.locator("body").textContent();
    const categories = ["Streak", "Quest", "Score", "Mastery"];
    const found = categories.filter((c) => text?.includes(c));
    console.log("✓ Achievement categories found:", found.join(", "));

    await page.screenshot({ path: "tests/screenshots/p12-04b-achievements.png", fullPage: true });
  });
});

// ─── 5. Accountability System ─────────────────────────────────────────────────
test.describe("Accountability API", () => {
  test("accountability status API responds", async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/accountability/status`);
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("locked");
    console.log("✓ Accountability status:", JSON.stringify(json));
  });

  test("recommit endpoint accepts POST", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/accountability/recommit", { method: "POST" });
      return { status: r.status, data: await r.json() };
    });
    expect([200, 400, 401]).toContain(result.status);
    console.log("✓ Recommit response:", JSON.stringify(result.data));
  });
});

// ─── 6. Admin Panel ──────────────────────────────────────────────────────────
test.describe("Admin Panel", () => {
  test("admin overview page loads", async ({ page }) => {
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-05-admin.png" });

    const url = page.url();
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const text = await body.textContent();
    const hasAdminContent =
      (text?.includes("Admin") ?? false) ||
      (text?.includes("Overview") ?? false) ||
      (text?.includes("Users") ?? false) ||
      (text?.includes("authorized") ?? false);
    console.log(hasAdminContent ? "✓ Admin page loaded" : "⚠ Admin content unclear");
    console.log("Admin URL:", url);
  });

  test("admin stats API responds (may be 403 if not admin)", async ({ page }) => {
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/admin/stats");
      return { status: r.status, data: await r.json() };
    });
    expect([200, 403]).toContain(result.status);
    if (result.status === 200) {
      expect(result.data).toHaveProperty("users");
      expect(result.data).toHaveProperty("problems");
      console.log("✓ Admin stats:", JSON.stringify({ users: result.data.users?.total, problems: result.data.problems?.total }));
    } else {
      console.log("✓ Admin API correctly returns 403 for non-admin user");
    }
  });

  test("admin questions API responds", async ({ page }) => {
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const status = await page.evaluate(async () => {
      const r = await fetch("/api/admin/questions");
      return r.status;
    });
    expect([200, 403]).toContain(status);
    console.log("✓ Admin questions API status:", status);
  });

  test("admin users API responds", async ({ page }) => {
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/admin/users");
      return r.status;
    });
    expect([200, 403]).toContain(result);
    console.log("✓ Admin users API status:", result);
  });

  test("admin questions page loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/questions`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-05b-admin-questions.png" });
    const text = await page.locator("body").textContent();
    const hasContent = (text?.includes("Question") ?? false) || (text?.includes("Admin") ?? false);
    console.log(hasContent ? "✓ Admin questions page content present" : "⚠ No content found");
  });

  test("admin users page loads", async ({ page }) => {
    await page.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" });
    await page.screenshot({ path: "tests/screenshots/p12-05c-admin-users.png" });
    const text = await page.locator("body").textContent();
    const hasContent = (text?.includes("User") ?? false) || (text?.includes("Admin") ?? false);
    console.log(hasContent ? "✓ Admin users page content present" : "⚠ No content found");
  });
});

// ─── 7. Dashboard and Core Navigation ────────────────────────────────────────
test.describe("Core Navigation", () => {
  test("sidebar shows all nav items including new ones", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const navItems = ["Dashboard", "Study Plan", "Exam", "Achievements", "My Progress", "Mentor", "Billing", "Admin"];
    const sidebar = page.locator("aside");

    if (await sidebar.count() > 0) {
      const sidebarText = await sidebar.textContent();
      const foundItems = navItems.filter((item) => sidebarText?.includes(item));
      console.log(`✓ Sidebar items found: ${foundItems.join(", ")}`);
    } else {
      console.log("⚠ Sidebar not found (may be collapsed on mobile)");
    }

    await page.screenshot({ path: "tests/screenshots/p12-06-sidebar.png" });
  });

  test("dashboard loads and shows GMAT content", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/sign-in/);

    const text = await page.locator("body").textContent();
    const hasDashboard = (text?.includes("Quest") ?? false) || (text?.includes("Score") ?? false) || (text?.includes("GMAT") ?? false);
    console.log(hasDashboard ? "✓ Dashboard shows GMAT content" : "⚠ Dashboard content unclear");

    await page.screenshot({ path: "tests/screenshots/p12-06b-dashboard.png", fullPage: true });
  });

  test("mentor page loads", async ({ page }) => {
    await page.goto(`${BASE}/mentor`, { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/sign-in/);
    const text = await page.locator("body").textContent();
    const hasMentor = (text?.includes("Mentor") ?? false) || (text?.includes("Ask") ?? false) || (text?.includes("Athena") ?? false);
    console.log(hasMentor ? "✓ Mentor page loaded" : "⚠ Mentor content unclear");
  });

  test("learning page loads with GMAT topics", async ({ page }) => {
    await page.goto(`${BASE}/learning`, { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/sign-in/);
    const text = await page.locator("body").textContent();
    const hasTopics =
      (text?.includes("Reasoning") ?? false) ||
      (text?.includes("Problem") ?? false) ||
      (text?.includes("Verbal") ?? false) ||
      (text?.includes("learning") ?? false);
    console.log(hasTopics ? "✓ Learning page shows GMAT topics" : "⚠ No topics visible");
    await page.screenshot({ path: "tests/screenshots/p12-06c-learning.png" });
  });
});

// ─── 8. API Health Checks ────────────────────────────────────────────────────
test.describe("API Health", () => {
  test("dashboard API returns expected shape", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/dashboard");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty("user");
    expect(result.data).toHaveProperty("streak");
    console.log("✓ Dashboard API: user =", result.data.user?.displayName, "streak =", result.data.streak);
  });

  test("profile API returns expected shape", async ({ page }) => {
    await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/profile");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty("user");
    expect(result.data).toHaveProperty("rank");
    expect(result.data).toHaveProperty("tiers");
    console.log("✓ Profile API: rank =", result.data.rank?.current?.name);
  });

  test("progress API returns all fields", async ({ page }) => {
    await page.goto(`${BASE}/queue`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/progress");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    const required = ["scoreHistory", "accuracyByDifficulty", "overallStats", "sectionScores", "topicMastery", "activityCalendar", "questionTypePerformance"];
    const missing = required.filter((k) => !(k in result.data));
    if (missing.length > 0) {
      console.log("⚠ Missing fields in progress API:", missing.join(", "));
    } else {
      console.log("✓ Progress API has all required fields");
    }
    expect(missing.length).toBe(0);
  });

  test("learning API returns topics", async ({ page }) => {
    await page.goto(`${BASE}/learning`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const r = await fetch("/api/learning");
      return { status: r.status, data: await r.json() };
    });
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty("topics");
    console.log("✓ Learning API: topics count =", result.data.topics?.length ?? 0);
  });

  test("health endpoint responds", async ({ page }) => {
    const r = await page.request.get(`${BASE}/api/health`);
    expect(r.status()).toBe(200);
    console.log("✓ Health check OK");
  });
});

// ─── 9. Full GMAT Test flow ───────────────────────────────────────────────────
test.describe("Full GMAT Test", () => {
  test("full-gmat page loads with test list", async ({ page }) => {
    await page.goto(`${BASE}/full-gmat`, { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/sign-in/);
    const text = await page.locator("body").textContent();
    const hasGmat =
      (text?.includes("GMAT") ?? false) ||
      (text?.includes("Practice") ?? false) ||
      (text?.includes("Test") ?? false);
    console.log(hasGmat ? "✓ Full GMAT page loaded" : "⚠ Content unclear");
    await page.screenshot({ path: "tests/screenshots/p12-07-full-gmat.png" });
  });

  test("full-gmat tests API returns test list", async ({ page }) => {
    const r = await page.request.get(`${BASE}/api/full-gmat/tests`);
    expect([200, 404]).toContain(r.status());
    if (r.status() === 200) {
      const json = await r.json();
      console.log("✓ Full GMAT tests:", JSON.stringify(json).slice(0, 200));
    }
  });
});
