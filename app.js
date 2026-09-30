"use strict";
const $ = (id) => document.getElementById(id);
const home = $("home"), kaart = $("kaart"), plaatje = $("plaatje"), woord = $("woord"), geluid = $("geluid");

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
let geluidAan = store.get("geluid") !== "uit";
const toonGeluid = () => { geluid.textContent = geluidAan ? "🔊" : "🔇"; geluid.setAttribute("aria-pressed", String(geluidAan)); };
toonGeluid();
geluid.onclick = () => { geluidAan = !geluidAan; store.set("geluid", geluidAan ? "aan" : "uit"); toonGeluid(); };

// Voorlezen met de Nederlandse stem van het toestel, als die er is.
// Geen Nederlandse stem (terwijl de lijst wel geladen is)? Dan zwijgen: een Engelse stem leert verkeerde klanken.
let stem = null, geenNl = false;
function kiesStem() {
  const stemmen = window.speechSynthesis?.getVoices() ?? [];
  stem = stemmen.find((v) => v.lang?.replace("_", "-") === "nl-NL") ?? stemmen.find((v) => v.lang?.startsWith("nl")) ?? null;
  geenNl = stemmen.length > 0 && !stem;
}
if (window.speechSynthesis) { kiesStem(); speechSynthesis.onvoiceschanged = kiesStem; }
function zeg(tekst) {
  if (!geluidAan || !window.speechSynthesis || geenNl) return;
  // speak() direct na een onnodige cancel() verliest op iOS/Android soms het woord
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(tekst);
  u.lang = "nl-NL"; u.rate = 0.8; u.pitch = 1.1;
  if (stem) u.voice = stem;
  speechSynthesis.speak(u);
}

const schud = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let rij = [], pos = 0, laatste = 0, terugBezig = false;
function toon() {
  const [w, img] = rij[pos];
  plaatje.src = "img/" + img + ".svg";
  woord.textContent = w;
  for (const el of [plaatje, woord]) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
  zeg(w);
}
function volgende() {
  const nu = Date.now();
  if (nu - laatste < 400) return; // wild tikken van kleine handjes niet laten doorrazen
  laatste = nu;
  if (++pos >= rij.length) {
    const vorige = rij[rij.length - 1];
    rij = schud(rij);
    if (rij.length > 1 && rij[0] === vorige) rij.push(rij.shift()); // niet twee keer hetzelfde achter elkaar
    pos = 0;
  }
  toon();
}
function start(cat) {
  if (kaart.classList.contains("on")) return; // twee vingers op twee tegels: maar één keer pushState
  rij = schud(cat.woorden); pos = 0; laatste = Date.now();
  home.classList.remove("on"); kaart.classList.add("on");
  history.pushState({ kaart: true }, "");
  toon();
}
function naarHome() {
  terugBezig = false;
  window.speechSynthesis?.cancel();
  kaart.classList.remove("on"); home.classList.add("on");
}

kaart.addEventListener("click", volgende);
$("terug").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!kaart.classList.contains("on") || terugBezig) return; // history.back() is async: dubbeltik zou de app verlaten
  terugBezig = true;
  history.back();
});
// Ook de terugknop van Android brengt je naar de categorieën. Na een herlaadbeurt op de kaart staat de
// oude state er nog; die wissen we, anders doet de volgende terug-druk zichtbaar niets.
if (history.state?.kaart) history.replaceState(null, "");
window.addEventListener("popstate", (e) => { if (!e.state?.kaart) naarHome(); });
document.addEventListener("keydown", (e) => {
  if (!kaart.classList.contains("on")) return;
  if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); $("terug").click(); }
  else if ([" ", "Enter", "ArrowRight"].includes(e.key)) { e.preventDefault(); volgende(); }
});
document.addEventListener("touchstart", () => {}, { passive: true }); // laat :active werken op iOS
document.addEventListener("contextmenu", (e) => e.preventDefault());

const cats = $("cats");
for (const cat of self.CATEGORIES) {
  const b = document.createElement("button");
  b.className = "cat";
  b.style.background = cat.kleur;
  b.innerHTML = `<img src="img/${cat.img}.svg" alt=""><span>${cat.naam}</span>`;
  b.onclick = () => start(cat);
  cats.append(b);
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
