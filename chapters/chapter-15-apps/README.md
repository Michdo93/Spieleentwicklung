# Chapter 15 · Apps

> Original: `A3GPU215_Apps` (`MarbleMaze.as`, `iSlidingPuzzle.as`, `-app.xml`-Manifeste, App-Icons)
> Live-Demo: [`chapters/chapter-15-apps/`](./index.html) auf GitHub Pages

## Worum es geht

Das letzte Buchkapitel: aus einer Spiele-Demo eine installierbare App
machen. Zwei Original-Projekte:

- **iSlidingPuzzle** — inhaltlich identisch mit [Chapter 06 · Sliding
  Puzzle](../chapter-06-sliding-puzzle/), hier ging es nur ums Verpacken
  (App-Icons, `-app.xml`-Manifest, Touch statt Maus) — deshalb nicht separat
  neu implementiert.
- **MarbleMaze** — das inhaltlich neue Spiel dieses Kapitels, und das
  einzige, das einen Sensor braucht, den es auf dem Desktop nicht gibt.
  Wird hier vollständig portiert.

## Was ich übersetzt habe

| ActionScript 3 / Adobe AIR                                 | HTML5 / JavaScript / Web                                  |
|--------------------------------------------------------------------|--------------------------------------------------------------------|
| `Accelerometer.isSupported` + Fallback auf Pfeiltasten                | `DeviceOrientationEvent` (mit `matchMedia("(pointer:coarse)")`-Prüfung) + Pfeiltasten-Fallback |
| `AccelerometerEvent.UPDATE` → `accelerationX/Y`                        | `deviceorientation`-Event → `event.gamma`/`event.beta`               |
| `moveMarble()` — Rechteck-Push-Back gegen Wände/Spielfeldrand            | 1:1 identisch übernommen (dasselbe Muster wie Kapitel 12/14)         |
| `MarbleMaze-app.xml` (AIR-Manifest: Name, Icons, Berechtigungen)          | `manifest.json` (PWA-Manifest: Name, Icons, Anzeigemodus) — Beispiel in `assets/manifest-example.json` |
| App-Icons in mehreren Größen (29/57/512px)                                | PWA-Icon-Set (typischerweise 192px/512px)                            |

## iOS-Besonderheit: Sensor-Berechtigung

Anders als AIR verlangt iOS seit Version 13 eine explizite Nutzerfreigabe
für Bewegungssensoren (`DeviceOrientationEvent.requestPermission()`),
auslösbar nur durch eine echte Nutzeraktion. Deshalb gibt es auf iOS einen
zusätzlichen "Neigen aktivieren"-Button, den das Original nicht brauchte.

## Was man hier lernt

- Das "Sensor mit Fallback"-Muster überträgt sich unverändert vom
  AIR-Ökosystem auf den Browser — nur die konkrete API ändert sich
- Die direkte Entsprechung zwischen AIR-App-Verpackung (`-app.xml` + Icons)
  und Web-App-Verpackung (`manifest.json` + Icons) — beide verfolgen dasselbe
  Ziel: dem Betriebssystem sagen, wie die App installiert aussehen soll
- Dass nicht jedes Kapitel neue Spiellogik braucht — manchmal ist die
  eigentliche Lektion das Drumherum (Verpackung, Plattform-Anpassung)

## Dateien

```
chapter-15-apps/
├── index.html      Lernseite (Erklärung + spielbares Marble Maze)
├── chapter.css       Overlay-Styles
├── game.js           MarbleMaze-Klasse, Sensor-/Tastatur-Eingabe
├── assets/
│   └── manifest-example.json   Beispiel-PWA-Manifest (Lernzweck)
└── README.md          diese Datei
```

## Steuerung

Pfeiltasten (Desktop) oder Gerät neigen (Mobilgerät, nach Freigabe auf iOS).
