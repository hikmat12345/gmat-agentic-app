import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const BASE = "http://localhost:3000";
const URL = `${BASE}/learning/critical-reasoning/cr-assumption/micro-lesson`;
const SCREENSHOTS = path.join(__dirname, "screenshots", "micro-lesson-v2");
const AUTH = path.join(__dirname, "auth-state.json");

fs.mkdirSync(SCREENSHOTS, { recursive: true });

async function shot(page: any, name: string) {
  const p = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`📸 ${name}`);
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    slowMo: 100,
    args: ["--window-size=1440,900"],
  });

  const context = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const errors: string[] = [];
  const network500s: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    errors.push(text);
    if (text.includes("micro-lesson") || text.includes("save")) {
      console.log(`[CONSOLE ${msg.type()}] ${text}`);
    }
  });
  page.on("pageerror", (err) => errors.push(`PAGE ERROR: ${err.message}`));
  page.on("response", (res) => {
    if (res.url().includes("micro-lesson")) {
      console.log(`[NET] ${res.status()} ${res.request().method()} ${res.url()}`);
    }
    if (res.status() >= 500) network500s.push(`${res.status()} ${res.url()}`);
  });

  // Navigate to dashboard first to warm up auth
  console.log("Warming up auth...");
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);

  // Navigate to micro-lesson (don't wait for networkidle — SSE keeps connection open)
  console.log("Navigating to micro-lesson...");
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await shot(page, "01-initial");

  const body1 = await page.textContent("body") ?? "";
  console.log(`Body snippet: ${body1.slice(0, 200)}`);

  // Check what phase we're in
  const isSpinner = await page.locator(".animate-spin").isVisible().catch(() => false);
  const isGenerating = body1.includes("Analyzing") || body1.includes("Almost there") || body1.includes("Generating");
  console.log(`Has spinner: ${isSpinner}, isGenerating: ${isGenerating}`);

  // Wait for lesson to fully load (up to 90s for AI generation + streaming)
  console.log("Waiting for lesson to generate and stream (up to 90s)...");
  let lessonLoaded = false;
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    const body = await page.textContent("body") ?? "";

    const stillGenerating = body.includes("Analyzing") || body.includes("Almost there");
    const hasError = body.toLowerCase().includes("error occurred") || body.toLowerCase().includes("unavailable");

    // Check DB status via API to know if lesson was saved
    let dbStatus = "unknown";
    try {
      const r = await page.evaluate(async () => {
        const res = await fetch("/api/learning/critical-reasoning/cr-assumption/micro-lesson");
        return res.json();
      });
      dbStatus = r?.status ?? "unknown";
    } catch {}

    console.log(`[${(i+1)*5}s] stillGenerating=${stillGenerating}, dbStatus=${dbStatus}, hasError=${hasError}, bodyLen=${body.length}`);

    await shot(page, `progress-${(i+1)*5}s`);

    if (dbStatus === "ready") {
      lessonLoaded = true;
      break;
    }
    if (hasError) {
      console.log("ERROR: lesson failed to load");
      break;
    }
  }

  await shot(page, "02-after-wait");

  const bodyFinal = await page.textContent("body") ?? "";
  const hasCanvas = await page.locator("canvas").isVisible().catch(() => false);
  const buttons = await page.locator("button").all();
  const btnTexts = await Promise.all(buttons.slice(0, 10).map(b => b.textContent().catch(() => "")));
  
  console.log(`\n=== Results ===`);
  console.log(`Lesson loaded: ${lessonLoaded}`);
  console.log(`Has canvas: ${hasCanvas}`);
  console.log(`Buttons found: ${btnTexts.filter(Boolean).join(", ")}`);
  console.log(`Body length: ${bodyFinal.length}`);
  console.log(`Network 500s: ${network500s.join(", ") || "none"}`);
  console.log(`Console errors: ${errors.filter(e => !e.includes("hydration") && !e.includes("favicon")).join(", ") || "none"}`);

  await browser.close();
  console.log(`\nScreenshots: ${SCREENSHOTS}`);
})();
