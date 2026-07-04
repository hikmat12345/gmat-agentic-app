/**
 * Verification: login redirect flow — quick 404 check only
 * Run: npx ts-node --project tsconfig.json verify-login-flow.ts
 */

import { chromium } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import * as fs from "fs";
import * as path from "path";

const SS_DIR = path.join(__dirname, "screenshots", "login-flow");
const BASE = "http://localhost:3000";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const TEST_EMAIL = "athena.playwright.test@mailinator.com";

const envFile = path.resolve(__dirname, "../frontend/.env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

fs.mkdirSync(SS_DIR, { recursive: true });
const log = (msg: string) => console.log(msg);

(async () => {
  await clerkSetup();

  const browser = await chromium.launch({ executablePath: CHROME, headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  const errors404: string[] = [];
  const consoleErrors: string[] = [];
  page.on("response", res => {
    if (res.status() === 404 && res.url().includes("localhost:3000")) {
      errors404.push(`404 ${res.url().replace(BASE, "")}`);
    }
  });
  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1500);
  await clerk.signIn({ page, emailAddress: TEST_EMAIL });
  await page.waitForTimeout(1000);

  // Navigate via /api/auth/redirect
  await page.goto(`${BASE}/api/auth/redirect`, { waitUntil: "domcontentloaded", timeout: 25000 });
  await page.waitForTimeout(4000);

  log("\n=== 404 errors on onboarding/plan ===");
  errors404.forEach(e => log("  " + e));
  log("\n=== Console errors ===");
  consoleErrors.forEach(e => log("  " + e.slice(0, 160)));

  await ctx.close();
  await browser.close();
})();
