// Kopieert de gebruikte Twemoji-SVG's (npm-pakket @twemoji/svg, CC-BY 4.0) naar img/.
// Gebruik: npm pack @twemoji/svg && tar xzf twemoji-svg-*.tgz && node scripts/copy-emoji.mjs package
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const src = process.argv[2];
if (!src) throw new Error("pad naar uitgepakt @twemoji/svg-pakket ontbreekt");
const root = new URL("..", import.meta.url).pathname;
const ctx = { self: {} };
vm.runInNewContext(readFileSync(join(root, "words.js"), "utf8"), ctx);
const codes = new Set(ctx.self.CATEGORIES.flatMap((c) => [c.img, ...c.woorden.map((w) => w[1])]));
const out = join(root, "img");
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) rmSync(join(out, f));
const missing = [];
for (const code of codes) {
  const from = join(src, code + ".svg");
  if (existsSync(from)) copyFileSync(from, join(out, code + ".svg"));
  else missing.push(code);
}
if (missing.length) { console.error("ontbreekt:", missing.join(" ")); process.exit(1); }
console.log(codes.size, "plaatjes gekopieerd");
