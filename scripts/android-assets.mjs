// Zet words.js, img/*.svg en icon.svg om naar wat de Android-app nodig heeft, zodat de web-app de enige
// bron blijft. Zonder afhankelijkheden: de Twemoji-SVG's gebruiken alleen path, circle, ellipse, g met fill
// en rotate(), en dat past één op één op een VectorDrawable. Iets anders tegenkomen = hard stoppen.
// Gebruik: node scripts/android-assets.mjs   (daarna de wijzigingen in android/ committen; CI controleert dat)
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("..", import.meta.url).pathname;
const main = join(root, "android/app/src/main");
const ctx = { self: {} };
vm.runInNewContext(readFileSync(join(root, "words.js"), "utf8"), ctx);
const cats = ctx.self.CATEGORIES;

// Android-resourcenamen: alleen a-z, 0-9 en _. "33-20e3" wordt e_33_20e3.
const resNaam = (code) => "e_" + code.replace(/-/g, "_");

const num = (s) => +(+s).toFixed(3);
function kleur(fill, opacity) {
  let hex = fill.slice(1);
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) throw new Error("onbekende kleur " + fill);
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const a = opacity == null ? "" : Math.round(+opacity * 255).toString(16).padStart(2, "0");
  return ("#" + a + hex).toUpperCase();
}
const attrs = (s) => Object.fromEntries([...s.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
function cirkel(cx, cy, rx, ry) {
  // twee halve bogen; VectorDrawable kent geen circle/ellipse
  return `M${num(cx - rx)},${num(cy)}a${num(rx)},${num(ry)} 0 1,0 ${num(2 * rx)},0a${num(rx)},${num(ry)} 0 1,0 ${num(-2 * rx)},0z`;
}
function draai(t) {
  const m = /^rotate\(([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)\)$/.exec(t);
  if (!m) throw new Error("onbekende transform " + t);
  return `android:rotation="${num(m[1])}" android:pivotX="${num(m[2])}" android:pivotY="${num(m[3])}"`;
}

// De binnenkant van een 36×36-SVG als VectorDrawable-elementen.
function vectorBinnen(svg, naam, inspring = "    ") {
  const uit = [];
  const fills = ["#000"]; // SVG-standaard
  let diepte = 0;
  for (const m of svg.matchAll(/<(\/?)([a-z]+)([^>]*?)(\/?)>/g)) {
    const [, sluit, tag, rest, zelf] = m;
    const a = attrs(rest);
    const pad = inspring + "    ".repeat(diepte);
    if (tag === "svg") continue;
    if (tag === "g") {
      if (sluit) { fills.pop(); diepte--; uit.push(inspring + "    ".repeat(diepte) + "</group>"); continue; }
      const onbekend = Object.keys(a).filter((k) => !["fill", "transform"].includes(k));
      if (onbekend.length) throw new Error(`${naam}: <g ${onbekend}>`);
      fills.push(a.fill ?? fills.at(-1));
      uit.push(pad + "<group" + (a.transform ? " " + draai(a.transform) : "") + ">");
      diepte++;
      continue;
    }
    if (sluit) continue;
    if (!zelf) throw new Error(`${naam}: <${tag}> met inhoud`);
    const onbekend = Object.keys(a).filter((k) => !["fill", "opacity", "transform", "d", "cx", "cy", "r", "rx", "ry"].includes(k));
    if (onbekend.length) throw new Error(`${naam}: <${tag} ${onbekend}>`);
    let d;
    if (tag === "path") d = a.d;
    else if (tag === "circle") d = cirkel(+a.cx, +a.cy, +a.r, +a.r);
    else if (tag === "ellipse") d = cirkel(+a.cx, +a.cy, +a.rx, +a.ry);
    else throw new Error(`${naam}: <${tag}>`);
    const fill = a.fill ?? fills.at(-1);
    if (fill === "none") continue;
    const p = `<path android:fillColor="${kleur(fill, a.opacity)}" android:pathData="${d}" />`;
    uit.push(a.transform ? `${pad}<group ${draai(a.transform)}>\n${pad}    ${p}\n${pad}</group>` : pad + p);
  }
  if (diepte !== 0) throw new Error(naam + ": <g> niet gesloten");
  return uit.join("\n");
}
const vector = (binnen, grootte, viewport) => `<?xml version="1.0" encoding="utf-8"?>
<!-- Gegenereerd door scripts/android-assets.mjs, niet met de hand wijzigen. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${grootte}dp" android:height="${grootte}dp"
    android:viewportWidth="${viewport}" android:viewportHeight="${viewport}">
${binnen}
</vector>
`;

// 1. Plaatjes
const drawable = join(main, "res/drawable");
mkdirSync(drawable, { recursive: true });
for (const f of readdirSync(drawable)) if (f.startsWith("e_")) rmSync(join(drawable, f));
const codes = new Set(cats.flatMap((c) => [c.img, ...c.woorden.map((w) => w[1])]));
for (const code of codes) {
  const svg = readFileSync(join(root, "img", code + ".svg"), "utf8");
  if (!svg.includes('viewBox="0 0 36 36"')) throw new Error(code + ": viewBox is niet 0 0 36 36");
  writeFileSync(join(drawable, resNaam(code) + ".xml"), vector(vectorBinnen(svg, code), 36, 36));
}

// 2. App-icoon: dezelfde emoji en achtergrond als icon.svg. Adaptief (API 26+) is de voorgrond 108×108 met
// de emoji binnen de veilige 66; het oude icoon (API 21-25) is een vierkant met de achtergrond erin.
const icoon = readFileSync(join(root, "icon.svg"), "utf8");
const achtergrond = /<rect[^>]*fill="(#[0-9a-fA-F]+)"/.exec(icoon)[1];
const binnenIcoon = /<g transform="[^"]*">([\s\S]*)<\/g><\/svg>/.exec(icoon)[1];
const emojiIn = (x, s, inspring) => `${inspring}<group android:translateX="${x}" android:translateY="${x}" android:scaleX="${s}" android:scaleY="${s}">
${vectorBinnen(binnenIcoon, "icon.svg", inspring + "    ")}
${inspring}</group>`;
writeFileSync(join(drawable, "ic_launcher_foreground.xml"), vector(emojiIn(30, num(48 / 36), "    "), 108, 108));
mkdirSync(join(main, "res/mipmap-anydpi"), { recursive: true });
writeFileSync(join(main, "res/mipmap-anydpi/ic_launcher.xml"), vector(
  `    <path android:fillColor="${kleur(achtergrond)}" android:pathData="M0,0h108v108h-108z" />\n` + emojiIn(24.6, num(58.8 / 36), "    "), 108, 108));
mkdirSync(join(main, "res/values"), { recursive: true });
writeFileSync(join(main, "res/values/ic_launcher_background.xml"), `<?xml version="1.0" encoding="utf-8"?>
<!-- Gegenereerd door scripts/android-assets.mjs uit icon.svg. -->
<resources>
    <color name="ic_launcher_background">${kleur(achtergrond)}</color>
</resources>
`);

// 3. Woorden, met de resourcenaam van elk plaatje
mkdirSync(join(main, "assets"), { recursive: true });
const json = cats.map((c) => ({
  naam: c.naam, img: resNaam(c.img), kleur: c.kleur, opVolgorde: !!c.opVolgorde,
  woorden: c.woorden.map(([w, img]) => [w, resNaam(img)]),
}));
writeFileSync(join(main, "assets/woorden.json"), JSON.stringify(json, null, 1) + "\n");
console.log(`${cats.length} categorieën, ${codes.size} plaatjes, icoon`);
