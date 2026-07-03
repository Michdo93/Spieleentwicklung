# Chapter 06c · Sliding Puzzle

> Original: `A3GPU206_SlidingPuzzle` (`SlidingPuzzle.as`)
> Live-Demo: [`chapters/chapter-06-sliding-puzzle/`](./index.html) auf GitHub Pages

## Worum es geht

Das klassische 15-Puzzle-Prinzip, hier mit 4×3-Raster (11 Bildteile + ein
Leerfeld). Ein Teil neben dem Leerfeld anklicken, um es mit einer kurzen
Gleitanimation hineinzuschieben, bis das Bild wieder vollständig ist.

## Was ich übersetzt habe

| ActionScript 3                                     | HTML5 / JavaScript                                    |
|---------------------------------------------------------|-------------------------------------------------------------|
| `shufflePuzzlePieces()` — 200 gültige Zufallszüge         | identisch übernommen: Mischen nur über erlaubte Züge, garantiert Lösbarkeit |
| `validMove()`                                              | identisch übernommen (vier Positionsvergleiche)               |
| `Timer(slideTime/slideSteps, slideSteps)` für die Animation | `requestAnimationFrame` + zeitbasierter Fortschritt (`t = (now-start)/slideTime`) |
| `BitmapData.copyPixels()` pro Teil                          | `drawImage()` mit Quell-/Zielrechteck                        |

## Was man hier lernt

- Wie man ein Puzzle **garantiert lösbar** mischt, indem man es rückwärts
  aus dem Zielzustand über gültige Züge aufbaut, statt zufällig zu verteilen
- Den Unterschied zwischen tick-basierter Animation (fester Timer, feste
  Schrittzahl) und zeitbasierter Animation (`requestAnimationFrame` mit
  Fortschrittsberechnung) — Letzteres bleibt bei schwankender Bildrate exakt
  gleich schnell
- Eine sehr kompakte Zustandsprüfung für "welche Züge sind gerade gültig"

## Dateien

```
chapter-06-sliding-puzzle/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           SlidingPuzzle-Klasse
├── assets/
│   └── slidingimage.jpg  Original-Bild aus dem Buchmaterial
└── README.md          diese Datei
```
