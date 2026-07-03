# Chapter 03 · Matching Game

> Original: `A3GPU203_MatchingGame` (finale Fassung: `MatchingGameObject10.as` + `Card10.as`)
> Live-Demo: [`chapters/chapter-03-matching-game/`](./index.html) auf GitHub Pages

## Worum es geht

Klassisches Memory/Concentration: 36 Karten (6×6), 18 Paare, aufdecken und merken.
Punkte für Treffer, Abzug für Fehlversuche, Zeitmessung.

Das Buch baut dieses Spiel in **zehn aufeinander aufbauenden Versionen** auf
(`MatchingGame1` bis `MatchingGame10`), jede fügt ein neues Konzept hinzu
(Klick-Erkennung, Flip-Animation, Sound, Highscore, Timer …). Portiert wurde
direkt die fertige Version 10 — der Lernwert der Zwischenschritte steckt in der
Erklärung auf der Kapitelseite.

## Was ich übersetzt habe

| ActionScript 3                                        | HTML5 / JavaScript                                    |
|----------------------------------------------------------|-----------------------------------------------------------|
| `Card10.startFlip()` mit 10-Schritt-`scaleX`-Animation    | `Card.update(dt)` mit zeitbasiertem `Math.cos()`-Verlauf für dieselbe Flip-Optik |
| Kartenbilder als Bibliotheksframes                        | 18 generierte Symbol/Farb-Kombinationen (6 Formen × 3 Farben) |
| `flash.utils.Timer` fürs Zurückdrehen bei Fehlversuch      | `setTimeout()`                                             |
| `Sound`-Objekte aus `.aiff`-Dateien                        | dieselben Original-Dateien, nach `.mp3` konvertiert (Browser spielen AIFF unzuverlässig ab) |
| `MovieClip(root).gotoAndStop("gameover")`                  | `state`-Variable (`intro`/`playing`/`gameover`) + DOM-Overlay |

## Was man hier lernt

- Wie man eine mehrstufige Animation (Kartendrehung) zeitbasiert statt
  frame-gezählt umsetzt — dasselbe Muster wie bei der Bewegung in Kapitel 05,
  nur auf eine visuelle Transformation angewendet
- Eine kleine Zustandsmaschine für "erste Karte / zweite Karte / vergleichen"
- Wie man Rasterpositionen aus einem 2D-Index berechnet (`x*spacing+offset`)
- Array-Shuffle-Technik wiederverwendet aus Kapitel 02, hier für die
  Kartenverteilung

## Dateien

```
chapter-03-matching-game/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/HUD-Styles
├── game.js           Card- und MatchingGame-Klassen
├── assets/
│   ├── FirstCardSound.mp3   Original-Audio, aus .aiff konvertiert
│   ├── MissSound.mp3
│   └── MatchSound.mp3
└── README.md          diese Datei
```
