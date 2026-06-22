import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL || "http://127.0.0.1:5173";

async function capture(locale, output) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  if (locale === "ar") {
    await page.evaluate(() => {
      localStorage.setItem("nossco-preferred-locale", "ar");
    });
    await page.reload({ waitUntil: "networkidle" });
  } else {
    await page.evaluate(() => {
      localStorage.setItem("nossco-preferred-locale", "en");
    });
    await page.reload({ waitUntil: "networkidle" });
  }

  await page.screenshot({ path: output, fullPage: true });
  await browser.close();
}

await capture("en", "/opt/cursor/artifacts/nossco-login-en.png");
await capture("ar", "/opt/cursor/artifacts/nossco-login-ar.png");

console.log("Screenshots saved");
