// Rendert icon.svg naar icon-192.png en icon-512.png met Playwright/Chromium.
// Gebruik: node scripts/make-icons.mjs  (playwright moet vindbaar zijn, bv. NODE_PATH=$(npm root -g))
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // require() volgt NODE_PATH, import niet
import { readFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const svg = readFileSync(root + "icon.svg", "utf8");
const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: `${root}icon-${size}.png` });
  await page.close();
}
await browser.close();
