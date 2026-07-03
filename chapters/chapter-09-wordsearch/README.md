# Chapter 09c · Word Search

> Original: `A3GPU209_WordSearch` (`WordSearch.as`)
> Live-Demo: [`chapters/chapter-09-wordsearch/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Buchstabenraster (12×12), Wörter per Ziehen markieren — waagerecht,
senkrecht oder diagonal, vorwärts oder rückwärts gelesen.

## Was ich übersetzt habe

| ActionScript 3                                       | HTML5 / JavaScript                                    |
|--------------------------------------------------------------|---------------------------------------------------------------|
| `placeLetters()` — bis zu 2000 Platzierungsversuche             | identisch übernommen (Limit auf 2000 erhöht für 8 statt 9 Wörter) |
| `continue repeatLoop;` (benanntes `continue`)                    | `fits`-Flag + `break` in der inneren Schleife, `continue` außen |
| `isValidRange()` — Reihe/Spalte/45°-Diagonale                     | identisch übernommen                                          |
| einzelne `Sprite`-Objekte mit eigenen Mouse-Events pro Buchstabe   | ein gemeinsamer `mousedown`/`mousemove`/`mouseup` auf dem Canvas, Zelle per Koordinatenumrechnung |
| `checkWord()` — auch rückwärts gelesen                             | identisch übernommen                                          |

## Was man hier lernt

- Ein "Versuch-und-Verwerfen"-Platzierungsalgorithmus als robuste Methode,
  um zufällige Inhalte in feste Constraints zu zwingen (ähnliches Prinzip
  wie beim Match-Three-Startraster aus Kapitel 08)
- Wie sich viele einzelne interaktive Objekte (ein Klick-Handler pro
  Buchstabenfeld im Original) im Web oft eleganter als **ein** Eingabe-Handler
  mit Koordinatenumrechnung abbilden lassen
- Geometrische Richtungsprüfung (Reihe/Spalte/Diagonale) als wiederverwendbares
  Muster für Rätsel- und Brettspiele

## Dateien

```
chapter-09-wordsearch/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           WordSearchGame-Klasse
└── README.md          diese Datei
```
