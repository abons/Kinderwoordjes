# Kinderwoordjes

Een PWA voor peuters (±3 jaar) om eerste Nederlandse woordjes te leren. Kies een categorie, je ziet
een groot plaatje met het woord eronder (en het toestel leest het voor). Tik ergens op het scherm
voor het volgende woord. Eén knop (het huisje) brengt je terug naar de categorieën, net als de
terugknop van Android.

Net zo licht als de zusterapps: gewone HTML + JavaScript, **geen framework, geen build-stap en geen
runtime-afhankelijkheden**. Na het eerste bezoek werkt alles offline, want de service worker zet de
hele app en alle plaatjes in de cache. Installeren als app kan via "Toevoegen aan startscherm".

## Bestanden

- `index.html`: de opmaak en de styling (inline).
- `app.js`: de schermen, de volgorde (geschud, zonder hetzelfde woord twee keer achter elkaar), het
  voorlezen (Web Speech API, `nl-NL`, met een aan/uit-knop op het beginscherm) en een korte
  tik-drempel zodat wild tikken niet door de woorden raast.
- `words.js`: alle categorieën en woorden. `sw.js` leest dit bestand ook in, om alle plaatjes
  vooraf te cachen.
- `sw.js`: een cache-first service worker. ⚠️ **Verhoog `VERSION` bij elke wijziging**, anders
  houden terugkerende bezoekers de oude versie.
- `img/`: de gebruikte plaatjes (SVG), `icon.svg` / `icon-*.png`: de app-iconen.
- `scripts/copy-emoji.mjs`: kopieert de plaatjes die `words.js` noemt uit het npm-pakket
  `@twemoji/svg` (`npm pack @twemoji/svg && tar xzf twemoji-svg-*.tgz && node scripts/copy-emoji.mjs package`).
- `scripts/make-icons.mjs`: rendert `icon.svg` naar PNG (`NODE_PATH=$(npm root -g) node scripts/make-icons.mjs`).

## Lokaal draaien

`python3 -m http.server` in deze map en open <http://localhost:8000>. Een service worker werkt
alleen via `localhost` of https.

## Publiceren

Het is een statische site, dus GitHub Pages (Settings → Pages → branch, map `/`) is genoeg.

## Woorden toevoegen

Voeg in `words.js` een `["woord", "codepoint"]` toe. Het codepoint is de Twemoji-bestandsnaam,
bv. `1f415` voor 🐕. Draai daarna `scripts/copy-emoji.mjs` en verhoog `VERSION` in `sw.js`.

## Bronvermelding

De plaatjes zijn [Twemoji](https://github.com/jdecked/twemoji), © Twitter, Inc. en andere
bijdragers, onder de licentie [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
