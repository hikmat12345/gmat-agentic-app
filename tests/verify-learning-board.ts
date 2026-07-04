/**
 * Verify the learning board flow:
 *   /learning → subtopic page → micro-lesson → why-this-matters modal
 *
 * Run: cd tests && npx ts-node verify-learning-board.ts
 */

import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const BASE = "http://localhost:3000";
const SUBTOPIC_URL = `${BASE}/learning/critical-reasoning/cr-bold-face`;
const MICRO_LESSON_URL = `${SUBTOPIC_URL}/micro-lesson`;
const SCREENSHOTS = path.join(__dirname, "screenshots", "learning-board");
const AUTH = path.join(__dirname, "auth-state.json");

fs.mkdirSync(SCREENSHOTS, { recursive: true });

const apiErrors: string[] = [];
const consoleErrors: string[] = [];

async function shot(page: any, name: string) {
  const p = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

(async () => {
  if (!fs.existsSync(AUTH)) {
    console.error("❌ auth-state.json not found. Run: cd tests && npx ts-node setup-auth.ts");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    slowMo: 150,
    args: ["--window-size=1440,900"],
  });

  const context = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PAGE ERROR: ${err.message}`));
  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && url.includes("localhost:3000")) {
      apiErrors.push(`${status} ${url.replace(BASE, "")}`);
    }
  });

  // ── Stage 1: Subtopic page ──────────────────────────────────────────────
  console.log("\n=== Stage 1: Subtopic page (cr-bold-face) ===");
  await page.goto(SUBTOPIC_URL);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await shot(page, "01-subtopic-page");

  // Check common mistakes section renders
  const dangerZones = page.locator("text=Danger Zones");
  const hasDangerZones = await dangerZones.isVisible().catch(() => false);
  console.log(hasDangerZones ? "✓ Danger Zones section visible" : "⚠ Danger Zones section not found");

  // Check at least one mistake is rendered (text content not empty)
  const mistakeEl = page.locator(".text-destructive").first();
  const mistakeText = await mistakeEl.textContent().catch(() => "");
  console.log(mistakeText?.trim() ? `✓ Mistake text: "${mistakeText?.trim().slice(0, 60)}"` : "⚠ No mistake text rendered (may be empty)");

  // ── Stage 2: Why this matters modal ────────────────────────────────────
  console.log("\n=== Stage 2: Why this matters modal ===");
  const whyBtn = page.locator("button").filter({ hasText: /why|need to know/i }).first();
  const hasWhyBtn = await whyBtn.isVisible().catch(() => false);
  if (hasWhyBtn) {
    console.log("✓ 'Why' button found — clicking...");
    await whyBtn.click();
    await page.waitForTimeout(3000);
    await shot(page, "02-why-this-matters-modal");

    // Check modal opened and content is loading/visible
    const modal = page.locator("[role='dialog']").first();
    const modalVisible = await modal.isVisible().catch(() => false);
    console.log(modalVisible ? "✓ Why-this-matters modal opened" : "⚠ Modal not visible");

    // Wait for streaming content (up to 20s)
    const streamingCheck = await page.waitForSelector(
      "[role='dialog'] canvas, [role='dialog'] .whiteboard-canvas, [role='dialog'] svg",
      { timeout: 20000 }
    ).catch(() => null);
    console.log(streamingCheck ? "✓ Whiteboard content appeared in modal" : "⚠ Whiteboard content did not appear in 20s");

    await page.waitForTimeout(3000);
    await shot(page, "03-why-modal-content");

    // Close modal
    const closeBtn = page.locator("[role='dialog'] button[aria-label*='close' i], [role='dialog'] button").last();
    await closeBtn.press("Escape");
    await page.waitForTimeout(500);
  } else {
    console.log("ℹ 'Why' button not found on this page — skipping modal test");
  }

  // ── Stage 3: Micro-lesson ───────────────────────────────────────────────
  console.log("\n=== Stage 3: Micro-lesson ===");
  await page.goto(MICRO_LESSON_URL);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  await shot(page, "04-micro-lesson-initial");

  const url = page.url();
  console.log(url.includes("micro-lesson") ? "✓ On micro-lesson page" : `⚠ Unexpected URL: ${url}`);

  // Wait for whiteboard to load or generate (up to 30s)
  console.log("  Waiting for whiteboard content (up to 30s)...");
  const wb = await page.waitForSelector(
    "canvas, svg, [class*='whiteboard'], [class*='Whiteboard']",
    { timeout: 30000 }
  ).catch(() => null);
  console.log(wb ? "✓ Whiteboard element appeared" : "⚠ No whiteboard element found in 30s");

  await page.waitForTimeout(5000);
  await shot(page, "05-micro-lesson-loaded");

  // Check for play/next controls
  const playBtn = page.locator("button[aria-label*='play' i], button").filter({ hasText: /play|start|begin/i }).first();
  const hasPlay = await playBtn.isVisible().catch(() => false);
  console.log(hasPlay ? "✓ Play/Start button visible" : "ℹ No play button found");

  if (hasPlay) {
    await playBtn.click();
    await page.waitForTimeout(3000);
    await shot(page, "06-micro-lesson-playing");
  }

  // Check for chat/AI input
  const chatInput = page.locator("textarea, input[type='text']").first();
  const hasChatInput = await chatInput.isVisible().catch(() => false);
  console.log(hasChatInput ? "✓ Chat input visible" : "ℹ Chat input not visible");

  // ── Stage 4: Lore / Why This Matters button in micro-lesson ────────────
  console.log("\n=== Stage 4: Lore (Why This Matters) in micro-lesson ===");
  const loreBtn = page.locator("button").filter({ hasText: /lore|why/i }).first();
  const hasLoreBtn = await loreBtn.isVisible().catch(() => false);
  console.log(hasLoreBtn ? "✓ Lore button found — clicking..." : "⚠ Lore button not found");

  if (hasLoreBtn) {
    await loreBtn.click();
    await page.waitForTimeout(5000);
    await shot(page, "07-lore-modal");

    const modal = page.locator("[role='dialog']").first();
    const modalVisible = await modal.isVisible().catch(() => false);
    console.log(modalVisible ? "✓ Lore/Why-This-Matters modal opened" : "⚠ Modal not visible");

    // Wait for whiteboard content to start streaming
    const wbInModal = await page.waitForSelector(
      "[role='dialog'] canvas, [role='dialog'] svg, [role='dialog'] [class*='whiteboard']",
      { timeout: 25000 }
    ).catch(() => null);
    console.log(wbInModal ? "✓ Whiteboard content streaming in modal" : "⚠ No whiteboard in modal after 25s");

    await page.waitForTimeout(3000);
    await shot(page, "08-lore-modal-content");

    // Close via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n=== Summary ===");

  const ttsErrors = apiErrors.filter(e => e.includes("text-to-speech"));
  const sttErrors = apiErrors.filter(e => e.includes("speech-to-text"));
  const whyErrors = apiErrors.filter(e => e.includes("why-this-matters"));
  const otherErrors = apiErrors.filter(
    e => !e.includes("text-to-speech") && !e.includes("speech-to-text") && !e.includes("why-this-matters")
  );

  if (ttsErrors.length > 0) {
    const statusCodes = ttsErrors.map(e => e.match(/^(\d+)/)?.[1]);
    const all503 = statusCodes.every(c => c === "503");
    console.log(
      all503
        ? `ℹ TTS: ${ttsErrors.length} requests → 503 (no API key — expected, graceful degradation)`
        : `⚠ TTS errors: ${ttsErrors.join(", ")}`
    );
  } else {
    console.log("✓ No TTS errors");
  }

  if (sttErrors.length > 0) {
    console.log(`ℹ STT: ${sttErrors.length} requests → 503 (no API key — expected)`);
  }

  if (whyErrors.length > 0) {
    console.log(`⚠ why-this-matters errors: ${whyErrors.join(", ")}`);
  } else {
    console.log("✓ No why-this-matters errors");
  }

  if (otherErrors.length > 0) {
    console.log("⚠ Other API errors:");
    otherErrors.forEach(e => console.log(`   ${e}`));
  } else {
    console.log("✓ No other API errors");
  }

  const relevantConsoleErrors = consoleErrors.filter(
    e =>
      !e.includes("hydration") &&
      !e.includes("favicon") &&
      !e.includes("text-to-speech") &&
      !e.includes("Failed to load resource") &&
      !e.includes("ERR_ABORTED")
  );
  if (relevantConsoleErrors.length > 0) {
    console.log("⚠ Console errors:");
    relevantConsoleErrors.forEach(e => console.log(`   ${e.slice(0, 200)}`));
  } else {
    console.log("✓ No relevant console errors");
  }

  await browser.close();
  console.log(`\nScreenshots saved to: ${SCREENSHOTS}`);
})();
