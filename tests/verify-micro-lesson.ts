/**
 * One-shot Playwright script: navigate to micro-lesson like a human,
 * screenshot every stage. Run with:
 *   npx ts-node verify-micro-lesson.ts
 */

import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const BASE = "http://localhost:3000";
const URL = `${BASE}/learning/critical-reasoning/cr-assumption/micro-lesson`;
const SCREENSHOTS = path.join(__dirname, "screenshots", "micro-lesson-verify");
const AUTH = path.join(__dirname, "auth-state.json");

fs.mkdirSync(SCREENSHOTS, { recursive: true });

async function shot(page: any, name: string) {
  const p = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`📸 ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    slowMo: 200,
    args: ["--window-size=1440,900"],
  });

  const context = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PAGE ERROR: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 500) networkErrors.push(`${res.status()} ${res.url()}`);
  });

  console.log("\n=== Stage 1: Navigate to micro-lesson ===");
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  console.log("Going to micro-lesson URL...");
  await page.goto(URL);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await shot(page, "01-initial-load");

  const title = await page.title();
  const bodySnippet = (await page.textContent("body") ?? "").slice(0, 300);
  console.log(`Title: ${title}`);
  console.log(`Body snippet: ${bodySnippet}`);

  console.log("\n=== Stage 2: Wait for streaming lesson (up to 30s) ===");
  // Check for a "loading" or "generating" indicator
  const loadingSelectors = [
    "[data-testid='loading']",
    ".animate-pulse",
    "text=Generating",
    "text=Loading",
    "text=Thinking",
  ];
  for (const sel of loadingSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      console.log(`ℹ Loading state found: ${sel}`);
      break;
    }
  }
  await shot(page, "02-loading-state");

  // Wait for content to stream in
  await page.waitForTimeout(8000);
  await shot(page, "03-after-8s");

  // Wait more if still loading
  await page.waitForTimeout(10000);
  await shot(page, "04-after-18s");

  const bodyAfter = (await page.textContent("body") ?? "");
  console.log(`Body length after 18s: ${bodyAfter.length}`);

  console.log("\n=== Stage 3: Look for interactive elements ===");
  // Check for whiteboard canvas
  const canvas = page.locator("canvas").first();
  const hasCanvas = await canvas.isVisible().catch(() => false);
  console.log(`Canvas visible: ${hasCanvas}`);

  // Check for Next/Continue button
  const nextBtn = page.locator("button").filter({ hasText: /next|continue|proceed|start|begin|play/i }).first();
  const hasNext = await nextBtn.isVisible().catch(() => false);
  console.log(`Next/Continue button: ${hasNext}`);
  if (hasNext) {
    const btnText = await nextBtn.textContent();
    console.log(`Button text: "${btnText}"`);
  }

  // Check for progress dots or step indicators
  const steps = page.locator("[data-step], .step-indicator, [role='progressbar']");
  const stepCount = await steps.count();
  console.log(`Step indicators: ${stepCount}`);

  await shot(page, "05-lesson-loaded");

  // Try clicking next if available
  if (hasNext) {
    console.log("\n=== Stage 4: Click through lesson ===");
    await nextBtn.click();
    await page.waitForTimeout(2000);
    await shot(page, "06-after-next-click");

    // Click again
    const nextBtn2 = page.locator("button").filter({ hasText: /next|continue|proceed/i }).first();
    if (await nextBtn2.isVisible().catch(() => false)) {
      await nextBtn2.click();
      await page.waitForTimeout(2000);
      await shot(page, "07-after-second-next");
    }
  }

  // Try play button (whiteboard player)
  const playBtn = page.locator("button[aria-label*='play' i], button").filter({ hasText: /play/i }).first();
  if (await playBtn.isVisible().catch(() => false)) {
    console.log("Found play button, clicking...");
    await playBtn.click();
    await page.waitForTimeout(3000);
    await shot(page, "08-after-play");
  }

  console.log("\n=== Stage 5: Check for any errors on page ===");
  const errorTexts = [
    "not found",
    "404",
    "error occurred",
    "failed to load",
    "something went wrong",
  ];
  for (const errText of errorTexts) {
    if (bodyAfter.toLowerCase().includes(errText)) {
      console.log(`⚠ Error text found on page: "${errText}"`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Console errors (${consoleErrors.length}):`);
  consoleErrors
    .filter(e => !e.includes("hydration") && !e.includes("favicon") && !e.includes("Failed to load resource"))
    .forEach(e => console.log(`  ⚠ ${e}`));
  console.log(`Network 500s (${networkErrors.length}):`);
  networkErrors.forEach(e => console.log(`  ⚠ ${e}`));

  await page.waitForTimeout(2000);
  await shot(page, "09-final-state");

  await browser.close();
  console.log(`\nAll screenshots saved to: ${SCREENSHOTS}`);
})();
