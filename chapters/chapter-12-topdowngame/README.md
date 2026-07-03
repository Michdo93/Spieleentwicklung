# Chapter 12b · Top-Down Game

> Original: `A3GPU212_TopDownGame` (`TopDownDrive.as`)
> Live-Demo: [`chapters/chapter-12-topdowngame/`](./index.html) auf GitHub Pages

## Worum es geht

Ein offenes Fahr-Sammelspiel: frei über eine große Karte fahren, Müll
einsammeln (bis zu 10 Stück gleichzeitig), zur farblich passenden Tonne
bringen, dabei Hindernisse umfahren.

## Was ich übersetzt habe

| ActionScript 3                                          | HTML5 / JavaScript                                    |
|------------------------------------------------------------------|--------------------------------------------------------------|
| `moveCar()` — Rechteck-Push-Back-Kollision gegen Blöcke und Kartenrand | 1:1 identisch übernommen, inklusive aller Fallunterscheidungen |
| `placeTrash()` — Zufallsplatzierung, die Hindernisse meidet          | identisches "Versuch-und-Verwerfen"-Muster                     |
| `findBlocks()` — Timeline nach `Block`-Symbolen durchsuchen           | entfällt — Hindernisse werden direkt als Datenstruktur definiert (`buildBlocks()`) |
| `checkCollisions()` — Aufsammeln/Abliefern per Abstandstest            | identisch übernommen (`Point.distance()` → `Math.hypot()`)     |
| `HornSound`/`GotOneSound`/`FullSound`/`DumpSound`                        | synthetische Beeps per Web Audio API                          |

## Karte: eigenes Layout, gleiche Mechanik

Die Original-Hindernisse (`Block`-Instanzen) und Mülltonnen standen fest auf
der Flash-Zeitleiste. Für die Portierung wurde ein eigenes, etwas kleiner
skaliertes Kartenlayout gebaut (6 Hindernisse, 3 Mülltonnen, 60 statt 100
Müllobjekte) — mit exakt derselben Kollisions- und Sammel-Logik wie im
Original.

## Was man hier lernt

- Kollisions-"Push-Back" statt hartem Stopp: Bewegung wird nur so weit
  reduziert, wie zur Vermeidung der Überlappung nötig ist — fühlt sich
  spielbarer an
- Wiederverwendung des "Versuch-und-Verwerfen"-Platzierungsmusters aus
  früheren Kapiteln in einem neuen Kontext (Objekte auf einer offenen Karte
  statt auf einem festen Raster)
- Wie sich ein einfaches Liefer-/Sammelspiel-Ziel (Kapazität, Ablieferpunkte,
  Gesamtscore) mit sehr wenig zusätzlichem Code um eine bestehende
  Bewegungs-Engine herum bauen lässt

## Dateien

```
chapter-12-topdowngame/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       HUD-/Overlay-Styles
├── game.js           TopDownGame-Klasse, Kartenlayout, Sound-Synthese
└── README.md          diese Datei
```

## Steuerung

`↑` vorwärts, `←`/`→` drehen.
