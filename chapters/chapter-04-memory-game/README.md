# Chapter 04b · Memory Game

> Original: `A3GPU204_MemoryGame` (`MemoryGame.as`)
> Live-Demo: [`chapters/chapter-04-memory-game/`](./index.html) auf GitHub Pages

## Worum es geht

Ein "Simon"-Klon: fünf farbige Lichter, jedes mit eigenem Ton. Der Computer
spielt eine wachsende Sequenz vor, der Spieler muss sie exakt nachklicken.
Ein Fehler beendet das Spiel.

## Was ich übersetzt habe

| ActionScript 3                                   | HTML5 / JavaScript                                |
|------------------------------------------------------|----------------------------------------------------------|
| `Light`-Bibliothekssymbol (2 Frames: aus/an)          | gezeichnete Kreise, Füllfarbe je nach Zustand              |
| `Timer` mit `currentCount`, der die Sequenz abspielt   | verkettete `setTimeout()`-Aufrufe, jeder plant den nächsten Schritt |
| `Array.shift()` zum Abgleich der Spielerreihenfolge    | identisch — `Array.prototype.shift()` existiert 1:1 in JS |
| externe `note1.mp3` … `note5.mp3` per `URLLoader`       | dieselben Original-Dateien, direkt mit `new Audio()` geladen |

## Was man hier lernt

- Eine zeitversetzte Sequenz abspielen, ohne dabei den Hauptthread zu blockieren
  (verkettete Timeouts statt einer blockierenden Schleife mit "sleep")
- Spielerzustand als einfache Kopie eines Arrays führen und mit `shift()`
  Element für Element abgleichen
- Audio-Feedback pro Spielobjekt (jedes Licht hat "seinen" Ton) als Muster,
  das sich auf viele andere Spieltypen übertragen lässt

## Dateien

```
chapter-04-memory-game/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/HUD-Styles
├── game.js           MemoryGame-Klasse
├── assets/
│   └── note1–5.mp3    Original-Audiodateien aus dem Buchmaterial
└── README.md          diese Datei
```
