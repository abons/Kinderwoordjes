/* Cache-first service worker: de hele app plus alle plaatjes gaan bij installatie in de cache, dus alles
 * werkt offline. Verhoog VERSION bij elke wijziging, anders houden terugkerende bezoekers de oude versie. */
const VERSION = "v10";
importScripts("words.js");
const IMGS = [...new Set(self.CATEGORIES.flatMap((c) => [c.img, ...c.woorden.map((w) => w[1])]))].map((c) => `img/${c}.svg`);
const SHELL = ["./", "index.html", "app.js", "words.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", ...IMGS];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  // cache: "reload" gaat langs de HTTP-cache, anders kan een oude versie in de nieuwe cache belanden
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit ?? fetch(e.request).then((resp) => {
      if (resp.ok) { const copy = resp.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return resp;
    }).catch((err) => (e.request.mode === "navigate" ? caches.match("./") : Promise.reject(err))))
  );
});
