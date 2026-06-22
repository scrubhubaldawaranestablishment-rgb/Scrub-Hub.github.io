import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:5173";

async function capture(locale, output) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate((lang) => {
    localStorage.setItem("nossco-preferred-locale", lang);
  }, locale);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
}

await capture("en", "/opt/cursor/artifacts/preview-nossco-nexxus-en.png");
await capture("ar", "/opt/cursor/artifacts/preview-nossco-nexxus-ar.png");
console.log("Preview screenshots saved");
