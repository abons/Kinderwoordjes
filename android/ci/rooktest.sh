#!/usr/bin/env bash
# Rooktest op de emulator in GitHub Actions: installeren, starten, lang indrukken op een tegel en op de
# kaart, terug, en nog eens terug op het beginscherm (de app moet dan open blijven). Schermafdrukken komen
# in shots/; de workflow zet die op de branch ci-schermafdrukken.
set -euo pipefail
APK="$1"
PKG=com.hrbons.kinderwoordjes

mkdir -p shots
shot() { adb exec-out screencap -p > "shots/$1.png"; }
ui() { adb shell uiautomator dump /sdcard/ui.xml >/dev/null && adb shell cat /sdcard/ui.xml; }
# midden van het element met deze content-desc of tekst
midden() {
  ui | perl -ne 'while (/<node [^>]*?(?:content-desc|text)="(?i:\Q'"$1"'\E)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g) { print int(($1+$3)/2), " ", int(($2+$4)/2), "\n"; exit }'
}
woord() { ui | perl -ne 'while (/<node [^>]*?text="([^"]+)"[^>]*?class="android.widget.TextView"/g) { print "$1\n"; exit }'; }
vooraan() { adb shell dumpsys activity activities | grep -E "topResumedActivity|mResumedActivity" | head -1; }
moetVooraan() { vooraan | grep -q "$PKG" || { echo "FOUT: app staat niet meer vooraan na $1"; vooraan; exit 1; }; }
houd() { adb shell input swipe "$1" "$2" "$1" "$2" 1500; sleep 1.5; }

adb install -r "$APK"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity"
sleep 4
shot 1-home
# Android meldt de eerste keer schermvullend "Viewing full screen"; op een echt toestel tik je dat één keer weg.
if read -r X Y < <(midden "Got it"); then echo "melding schermvullend weggetikt"; adb shell input tap "$X" "$Y"; sleep 1.5; shot 1b-home; fi
echo "--- schermindeling ---"; ui | sed 's/<node /\n<node /g' | grep -o '<node [^>]*' | sed -E 's/ (checkable|checked|clickable|enabled|focusable|focused|scrollable|long-clickable|password|selected|resource-id|index)="[^"]*"//g' | head -60; echo "---"

read -r X Y < <(midden Dieren) || { echo "FOUT: tegel Dieren niet gevonden"; exit 1; }
echo "tegel Dieren op $X,$Y: 1,5 s ingedrukt"
houd "$X" "$Y"
shot 2-kaart
EERSTE=$(woord); echo "woord: $EERSTE"
[ -n "$EERSTE" ] || { echo "FOUT: geen kaart na lang indrukken"; exit 1; }

# Twee keer lang op de kaart: één keer voorlezen (als er een Nederlandse stem is) en één keer verder
houd 540 1500
houd 540 1500
TWEEDE=$(woord); echo "woord: $TWEEDE"
[ "$EERSTE" != "$TWEEDE" ] || { echo "FOUT: kaart ging niet verder na lang indrukken"; exit 1; }
shot 3-verder

adb shell input keyevent KEYCODE_BACK; sleep 1.5
moetVooraan "terug op de kaart"
midden Dieren >/dev/null && [ -n "$(midden Dieren)" ] || { echo "FOUT: terug op de kaart gaf geen beginscherm"; exit 1; }
adb shell input keyevent KEYCODE_BACK; sleep 1.5
moetVooraan "terug op het beginscherm"
adb shell input keyevent KEYCODE_BACK; sleep 1.5
moetVooraan "nog eens terug op het beginscherm"
shot 4-home-na-terug

# draaien: geen crash en nog steeds het beginscherm
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1; sleep 2
shot 5-liggend
adb shell settings put system user_rotation 0; sleep 1
moetVooraan "draaien"

if adb logcat -d | grep -E "FATAL EXCEPTION|ANR in $PKG"; then echo "FOUT: crash"; adb logcat -d | grep -A30 "FATAL EXCEPTION" | head -60; exit 1; fi
echo "ROOKTEST GOED"
