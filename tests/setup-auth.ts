/**
 * Auth setup using clerk.signIn({ page, emailAddress }) from @clerk/testing.
 * This internally: 1) creates a sign-in token via backend API, 2) uses ticket
 * strategy in page context, 3) waits for window.Clerk?.user !== null.
 * The ticket strategy bypasses needs_client_trust entirely.
 */

import { chromium } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import * as fs from "fs";
import * as path from "path";

const envFile = path.resolve(__dirname, "../frontend/.env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

const AUTH_FILE  = path.join(__dirname, "auth-state.json");
const SS_DIR     = path.join(__dirname, "screenshots");
const BASE       = "http://localhost:3000";
const CHROME_EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const TEST_EMAIL = "athena.playwright.test@mailinator.com";

fs.mkdirSync(SS_DIR, { recursive: true });

(async () => {
  console.log("\n🚀 Clerk Auth Setup — emailAddress ticket strategy");
  console.log(`   Key: ${process.env.CLERK_SECRET_KEY?.slice(0, 20)}...`);
  console.log(`   Email: ${TEST_EMAIL}\n`);

  // clerkSetup fetches the testing token from backend and sets CLERK_FAPI + CLERK_TESTING_TOKEN
  await clerkSetup();
  console.log("✓ clerkSetup done, CLERK_FAPI:", process.env.CLERK_FAPI);

  const browser = await chromium.launch({
    executablePath: CHROME_EXE,
    headless: false,
    slowMo: 100,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page    = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("[BROWSER ERR]", msg.text().slice(0, 150));
  });

  // Step 1: Navigate to the landing page — loads ClerkProvider and Clerk JS SDK
  console.log("→ Loading app (waits for Clerk SDK)...");
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SS_DIR, "01-landing.png") });

  // Step 2: clerk.signIn with emailAddress:
  //   - internally calls setupClerkTestingToken on the context
  //   - looks up user by email via backend API
  //   - creates a sign-in token (ticket) via Clerk backend API
  //   - calls signIn.create({ strategy: "ticket", ticket }) in page context
  //   - waits for window.Clerk?.user !== null
  console.log("→ Signing in via clerk.signIn({ emailAddress })...");
  try {
    await clerk.signIn({ page, emailAddress: TEST_EMAIL });
    console.log("✓ clerk.signIn completed");
  } catch (e: any) {
    console.error("✗ clerk.signIn failed:", e.message?.slice(0, 300));
    await page.screenshot({ path: path.join(SS_DIR, "02-signin-error.png") });
    await browser.close();
    process.exit(1);
  }

  // Step 3: Check cookies immediately after sign-in (before navigating)
  await page.waitForTimeout(2000);
  const cookiesAfterSignIn = await context.cookies(["http://localhost:3000"]);
  const uatAfterSignIn = cookiesAfterSignIn.find((c) => c.name === "__client_uat");
  console.log(`  __client_uat after signIn: ${uatAfterSignIn?.value ?? "none"}`);

  await page.screenshot({ path: path.join(SS_DIR, "02-after-signin.png") });

  // Step 4: Navigate to dashboard to trigger Clerk middleware handshake
  console.log("→ Navigating to dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SS_DIR, "03-dashboard.png") });
  console.log("  Final URL:", page.url());

  // Step 5: Save storage state
  const state = await context.storageState();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));

  const localCookies = state.cookies.filter(
    (c: any) => c.domain === "localhost" || c.domain === "127.0.0.1"
  );
  const uat = localCookies.find((c: any) => c.name === "__client_uat");
  const session = localCookies.find((c: any) => c.name === "__session");
  const isAuthed = uat && uat.value !== "0";

  console.log("\n=== Cookies on localhost ===");
  for (const c of localCookies) {
    console.log(`  ${c.name} = ${c.value.slice(0, 60)}`);
  }
  console.log(`\n${isAuthed ? "✅" : "⚠"} client_uat: ${uat?.value ?? "none"}`);
  console.log(`   __session:  ${session?.value?.slice(0, 40) ?? "none"}`);

  if (isAuthed) {
    console.log("\n🎯 Auth saved! Run:\n   npx playwright test --config=playwright.config.ts\n");
  } else {
    console.log("\n⚠ Not authenticated — check screenshots/\n");
  }

  await browser.close();
  process.exit(0);
})();
