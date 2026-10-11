# Todo

Alleen wat nog open is; de geschiedenis staat in git.

## Android-app

- [ ] **Vaste sleutel voor de APK maken en als secrets instellen.** Zonder sleutel maakt CI geen
  release (de stap `release` faalt bewust), want met een wisselende debugsleutel installeert een
  update niet over de vorige heen. Stappen: README → *Android-app (APK)* → *Ondertekenen*. Kort:
  1. `keytool -genkeypair -v -keystore woordjes.jks -alias woordjes -keyalg RSA -keysize 2048 -validity 10000`
     en de sleutel goed bewaren (kwijt = de app nooit meer kunnen bijwerken).
  2. GitHub → Settings → Secrets and variables → Actions: `ANDROID_KEYSTORE_BASE64`,
     `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`woordjes`), `ANDROID_KEY_PASSWORD`.
- [ ] **Daarna branch `ccr-0bebe42e-y28r1y` samenvoegen in `Main`** (de Android-app staat nog
  alleen daar; CI is groen op Android 6, 10 en 14). De eerste release komt dan op
  <https://github.com/abons/Kinderwoordjes/releases/latest/download/kinderwoordjes.apk>.
- [ ] Op een echte telefoon proberen, vooral het voorlezen met de Nederlandse stem (de emulators in
  CI hebben die niet) en de melding "Volledig scherm" die je de eerste keer wegtikt.

## Voorlezen

- [ ] **Geluid viel een keer weg, web én Android tegelijk** (2026-10-11). Icoon stond op 🔊, woord
  ging gewoon verder zonder stem. Opgelost door het toestel te herstarten en andere apps te sluiten,
  dus vermoedelijk een vastgelopen spraakdienst en geen codefout (Android sinds 2026-10-01
  ongewijzigd, web-merge `5e5df2d` raakt het voorlezen niet). Alleen oppakken als het terugkomt:
  dan kijken of de apps zich kunnen herstellen (Android: `spraakKapot` → `startStem()` bij elke
  tik i.p.v. per categorie; web: `resume()`-regel in `zeg()` verdacht).
