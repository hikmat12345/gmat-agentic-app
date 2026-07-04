/**
 * Playwright fixtures using storageState (cookies + localStorage from auth-state.json).
 * Run setup-auth.ts once to capture the session, then all tests reuse it.
 */

import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const AUTH_FILE = path.join(__dirname, "auth-state.json");
const BASE = "http://localhost:3000";

export type AuthoFixtures = {
  context: BrowserContext;
  page: Page;
};

export const test = base.extend<AuthoFixtures>({
  context: async ({}, use) => {
    const hasAuth = fs.existsSync(AUTH_FILE);

    if (!hasAuth) {
      console.warn(
        "\n⚠ auth-state.json not found.\n" +
        "  Run: cd tests && npx ts-node setup-auth.ts\n" +
        "  Sign in when the browser opens, then press ENTER.\n"
      );
    }

    const browser = await chromium.launch({
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      headless: false,
      slowMo: 150,
      args: ["--start-maximized"],
    });

    const contextOptions: Parameters<typeof browser.newContext>[0] = {
      viewport: { width: 1400, height: 900 },
    };

    if (hasAuth) {
      contextOptions.storageState = AUTH_FILE;
    }

    const context = await browser.newContext(contextOptions);
    await use(context);
    await context.close();
    await browser.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from "@playwright/test";
