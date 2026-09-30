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
// spraakKapot: er is wel speechSynthesis, maar er komt niets uit (geen stemmen, fout). Dan gaat één tik verder,
// anders kost elk woord een dode tik.
let spraakKapot = false;
const kanPraten = () => geluidAan && !!window.speechSynthesis && !geenNl && !spraakKapot;
const stil = () => { if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) speechSynthesis.cancel(); };
function zeg(tekst) {
  if (!kanPraten()) return;
  stil(); // alleen als er iets loopt: speak() direct na een onnodige cancel() verliest op iOS/Android soms het woord
  const u = new SpeechSynthesisUtterance(tekst);
  u.lang = "nl-NL"; u.rate = 0.8; u.pitch = 1.1;
  if (stem) u.voice = stem;
  const wacht = setTimeout(() => { spraakKapot = true; }, 1500);
  u.onstart = () => clearTimeout(wacht);
  u.onerror = (e) => { clearTimeout(wacht); if (e.error !== "interrupted" && e.error !== "canceled") spraakKapot = true; };
  speechSynthesis.speak(u);
}

const schud = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let huidig = null, rij = [], pos = 0, laatste = 0, terugBezig = false, gezegd = false;
function toon() {
  const [w, img] = rij[pos];
  plaatje.src = "img/" + img + ".svg";
  woord.textContent = w;
  animeer("pop");
  gezegd = false;
}
function animeer(naam) {
  for (const el of [plaatje, woord]) { el.classList.remove("pop", "zeg"); void el.offsetWidth; el.classList.add(naam); }
}
// Wild tikken van kleine handjes niet laten doorrazen.
function tikMag() {
  const nu = Date.now();
  if (nu - laatste < 300) return false;
  laatste = nu;
  return true;
}
// Eerst kijken: de eerste tik zegt het woord, de tweede gaat verder. Zonder geluid gaat één tik verder.
function tik() {
  if (!tikMag()) return;
  // Wiebel bij het voorlezen: ook als het toestel op stil staat, ziet het kind dat de tik aankwam.
  if (kanPraten() && !gezegd) { gezegd = true; animeer("zeg"); zeg(rij[pos][0]); }
  else volgende();
}
function volgende() {
  stil(); // niet het oude woord horen bij het nieuwe plaatje
  if (++pos >= rij.length) {
    pos = 0;
    if (huidig.opVolgorde) return toon();
    const vorige = rij[rij.length - 1];
    rij = schud(rij);
    if (rij.length > 1 && rij[0] === vorige) rij.push(rij.shift()); // niet twee keer hetzelfde achter elkaar
    pos = 0;
  }
  toon();
}
function start(cat) {
  if (kaart.classList.contains("on")) return; // twee vingers op twee tegels: maar één keer pushState
  huidig = cat; rij = cat.opVolgorde ? cat.woorden : schud(cat.woorden); pos = 0; laatste = Date.now();
  home.classList.remove("on"); kaart.classList.add("on");
  history.pushState({ kaart: true }, "");
  toon();
}
function naarHome() {
  terugBezig = false;
  window.speechSynthesis?.cancel();
  kaart.classList.remove("on"); home.classList.add("on");
}

// pointerup in plaats van click: een peuter drukt lang, schuift een beetje of legt er twee vingers op, en dan
// vuurt click niet (de browser ziet een sleep, lange druk of pinch). Met touch-action:none op de kaart komt
// pointerup altijd door, en het telt (anders dan pointerdown) als gebruikersgebaar, nodig voor spraak op iOS.
kaart.addEventListener("pointerup", (e) => {
  if (e.button > 0 || e.target.closest("#terug")) return;
  tik();
});
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
  if (!kaart.classList.contains("on") || e.repeat) return; // ingedrukt houden raast niet door de woorden
  if (e.target === $("terug") && (e.key === " " || e.key === "Enter")) return; // laat de knop zelf naar huis gaan
  if (e.key === "Escape" || e.key === "Backspace") { e.preventDefault(); $("terug").click(); }
  else if ([" ", "Enter"].includes(e.key)) { e.preventDefault(); tik(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); if (tikMag()) volgende(); }
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

// Installeren als app: Chrome/Edge geven een eigen prompt (beforeinstallprompt), iOS niet, daar leggen we het uit.
const installeer = $("installeer");
const alsApp = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let installPrompt = null;
if (!alsApp && iOS) installeer.hidden = false;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; installeer.hidden = false; });
window.addEventListener("appinstalled", () => { installeer.hidden = true; installPrompt = null; });
// In-app browsers (WhatsApp, Instagram, Facebook, Gmail…) kunnen niet op het beginscherm zetten: eerst naar Safari.
const inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|GSA\/|Snapchat|LinkedInApp/.test(navigator.userAgent);
installeer.onclick = async () => {
  if (installPrompt) {
    // prompt() mag maar één keer per event, en Chrome vuurt pas bij een volgende paginalading een nieuwe
    const p = installPrompt;
    installPrompt = null;
    installeer.hidden = true;
    p.prompt();
    await p.userChoice.catch(() => {});
  } else if (iOS) {
    alert(inApp
      ? "Open deze pagina eerst in Safari. Tik daar op Delen (vierkantje met pijltje) en kies \"Zet op beginscherm\"."
      : "Zet Woordjes op je beginscherm: tik op Delen (vierkantje met pijltje, soms onder •••) en kies \"Zet op beginscherm\".");
  }
};

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
