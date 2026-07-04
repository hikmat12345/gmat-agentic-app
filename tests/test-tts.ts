import { chromium } from "playwright";
import * as path from "path";

const BASE = "http://localhost:3000";
const AUTH = path.join(__dirname, "auth-state.json");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    slowMo: 100,
    args: ["--window-size=1440,900", "--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
    permissions: [],
  });

  const page = await context.newPage();

  const speechEvents: string[] = [];
  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("tts") || t.includes("speech") || t.includes("narrat") || t.includes("ElevenLabs")) {
      console.log(`[CONSOLE] ${t}`);
    }
  });
  page.on("response", (res) => {
    if (res.url().includes("text-to-speech") || res.url().includes("micro-lesson")) {
      console.log(`[NET] ${res.status()} ${res.request().method()} ${res.url().split("/").slice(-3).join("/")}`);
    }
  });

  console.log("Navigating to micro-lesson (lesson already cached)...");
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);

  await page.goto(`${BASE}/learning/critical-reasoning/cr-assumption/micro-lesson`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3000);

  // Check if speech is happening — look for the mute button
  const muteBtn = page.locator("button[title='Mute narration']");
  const hasMuteBtn = await muteBtn.isVisible().catch(() => false);
  console.log(`Mute button visible: ${hasMuteBtn}`);

  // Check if SpeechSynthesis is being used
  const isSpeaking = await page.evaluate(() => window.speechSynthesis?.speaking);
  console.log(`speechSynthesis.speaking: ${isSpeaking}`);

  await page.screenshot({ path: "screenshots/tts-test.png", fullPage: false });
  console.log("Screenshot saved.");

  // Wait a few seconds to observe speaking
  await page.waitForTimeout(5000);

  const isSpeaking2 = await page.evaluate(() => window.speechSynthesis?.speaking);
  console.log(`speechSynthesis.speaking (after 5s): ${isSpeaking2}`);

  // Test mute button
  if (hasMuteBtn) {
    await muteBtn.click();
    console.log("Clicked mute button.");
    const isMuted = await page.locator("button[title='Unmute narration']").isVisible().catch(() => false);
    console.log(`Unmute button now visible (muted): ${isMuted}`);
    await page.waitForTimeout(1000);
    const stillSpeaking = await page.evaluate(() => window.speechSynthesis?.speaking);
    console.log(`speechSynthesis.speaking after mute: ${stillSpeaking}`);
  }

  await page.screenshot({ path: "screenshots/tts-muted.png", fullPage: false });
  await browser.close();
})();
