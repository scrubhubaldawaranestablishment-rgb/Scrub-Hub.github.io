import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto("https://portal.nosscogroup.com/login", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/opt/cursor/artifacts/live-login-en.png", fullPage: true });
  console.log("EN:", (await page.locator("body").innerText()).slice(0, 600));

  const toggle = page.locator("button").filter({ hasText: /العربية/ });
  if (await toggle.count()) {
    await toggle.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/opt/cursor/artifacts/live-login-ar.png", fullPage: true });
    console.log("AR:", (await page.locator("body").innerText()).slice(0, 600));
    console.log("dir:", await page.evaluate(() => document.documentElement.dir));
  } else {
    console.log("No language toggle found");
  }
} finally {
  await browser.close();
}
