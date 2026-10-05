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
