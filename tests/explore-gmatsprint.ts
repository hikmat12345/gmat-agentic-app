import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOTS_DIR = path.join(__dirname, "gmatsprint-screenshots");
// Use a fresh test email for signup
const TEST_EMAIL = "athena.test.explore@mailinator.com";
const TEST_PASSWORD = "TestPass123!";

let shotIdx = 0;
async function shot(page: any, name: string) {
  shotIdx++;
  const p = path.join(SCREENSHOTS_DIR, `${String(shotIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${path.basename(p)}`);
  return p;
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  // Clear old screenshots
  fs.readdirSync(SCREENSHOTS_DIR).forEach(f => fs.unlinkSync(path.join(SCREENSHOTS_DIR, f)));

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    slowMo: 80,
    args: ["--start-maximized"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── 1. Go to login page ────────────────────────────────────────────
  console.log("\n1. Navigating to login...");
  await page.goto("https://www.gmatsprint.com/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await shot(page, "login-page");

  // ── 2. Try to create an account ──────────────────────────────────
  const createLink = page.locator('a:has-text("Create one"), a:has-text("Sign up"), a:has-text("Register")').first();
  if (await createLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log("2. Clicking 'Create one'...");
    await createLink.click();
    await page.waitForTimeout(2000);
    await shot(page, "signup-page");

    // Fill signup form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill("Athena Test");
    }

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(TEST_EMAIL);
    }

    const pwInput = page.locator('input[type="password"]').first();
    if (await pwInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pwInput.fill(TEST_PASSWORD);
    }

    const confirmPw = page.locator('input[type="password"]').nth(1);
    if (await confirmPw.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmPw.fill(TEST_PASSWORD);
    }

    await shot(page, "signup-filled");

    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create"), button:has-text("Register")').first();
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await shot(page, "after-signup");
    }
  } else {
    // Try direct login with created account
    console.log("2. Trying to sign in...");
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(TEST_EMAIL);
    const pwInput = page.locator('input[type="password"]').first();
    await pwInput.fill(TEST_PASSWORD);
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in")').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }

  // ── 3. Check where we are now ────────────────────────────────────
  await page.waitForTimeout(2000);
  const url = page.url();
  console.log(`\n3. URL after auth: ${url}`);
  await shot(page, "post-auth-state");

  // If still on auth page, just navigate to public pages
  const onAuthPage = url.includes("login") || url.includes("sign-up") || url.includes("signup") || url.includes("register");

  if (!onAuthPage) {
    console.log("\n✅ Authenticated! Exploring UI...");
    await exploreApp(page, ctx);
  } else {
    console.log("\n⚠️  Still on auth. Capturing public pages and login UI in detail...");
    await captureAuthUI(page);
  }

  console.log("\nDone! Keeping browser open 10s...");
  await page.waitForTimeout(10000);
  await browser.close();
}

async function captureAuthUI(page: any) {
  // Just screenshot the auth UI in detail — it still reveals their design language
  await page.goto("https://www.gmatsprint.com/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "login-design-full");

  // Scroll to see footer
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(500);
  await shot(page, "login-design-scrolled");

  // Go to landing/home
  await page.goto("https://www.gmatsprint.com/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "landing-hero");

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await shot(page, "landing-features-1");

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await shot(page, "landing-features-2");

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await shot(page, "landing-features-3");

  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await shot(page, "landing-features-4");
}

async function exploreApp(page: any, ctx: any) {
  // Dashboard
  await page.goto("https://www.gmatsprint.com/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "dashboard-top");

  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(800);
  await shot(page, "dashboard-mid");

  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(800);
  await shot(page, "dashboard-bottom");

  await page.mouse.wheel(0, -800);

  // Explore nav links
  const routes = [
    { url: "/study", name: "study-plan" },
    { url: "/practice", name: "practice" },
    { url: "/progress", name: "progress" },
    { url: "/profile", name: "profile" },
    { url: "/settings", name: "settings" },
  ];

  for (const route of routes) {
    try {
      await page.goto(`https://www.gmatsprint.com${route.url}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(1500);
      const pageUrl = page.url();
      if (!pageUrl.includes("login") && !pageUrl.includes("404")) {
        await shot(page, route.name);
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(600);
        await shot(page, `${route.name}-scrolled`);
      }
    } catch {
      // Route might not exist
    }
  }

  // Try clicking nav items
  await page.goto("https://www.gmatsprint.com/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const navItems = await page.locator("nav a, aside a").all();
  const seen = new Set<string>();
  for (const item of navItems.slice(0, 10)) {
    const href = await item.getAttribute("href").catch(() => "");
    const text = (await item.textContent().catch(() => ""))?.trim();
    if (!href || seen.has(href) || href === "/" || href === "#") continue;
    seen.add(href);
    console.log(`   Nav: "${text}" → ${href}`);
    await page.goto(`https://www.gmatsprint.com${href}`, { waitUntil: "networkidle", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    if (!page.url().includes("login")) {
      await shot(page, `nav-${(text || href).replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 30)}`);
    }
  }
}

main().catch(console.error);
