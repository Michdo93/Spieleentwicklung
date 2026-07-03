# Chapter 13a · Higher or Lower

> Original: `A3GPU213_HigherOrLower` (`HighLow.as`)
> Live-Demo: [`chapters/chapter-13-higherorlower/`](./index.html) auf GitHub Pages

## Worum es geht

Der einfachste Einstieg in Kartenspiele: höher oder niedriger raten, sechs
Karten am Stück richtig liegen gewinnt.

## Was ich übersetzt habe

| ActionScript 3                                  | HTML5 / JavaScript                          |
|--------------------------------------------------------|------------------------------------------------|
| `numCards = 20`, jede Karte eine Zufallszahl 1–20         | identisch übernommen — kein echtes Kartendeck    |
| `Cards`-Bibliothekssymbol mit 20 Frames                    | HTML-`<div>` pro Karte, Zahl als Text            |
| `checkCard()`                                               | identisch übernommen                            |

## Was man hier lernt

- Dass nicht jedes "Kartenspiel" ein vollständiges 52-Karten-Deck braucht —
  manchmal reicht eine einfache Zufallszahl mit Vergleichslogik
- Der ideale erste Schritt vor den komplexeren Kartenspielen in diesem
  Kapitel (Blackjack, Video Poker), die ein echtes Deck mit Farben brauchen

## Dateien

```
chapter-13-higherorlower/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Karten-/Overlay-Styles
├── game.js           HighLowGame-Klasse
└── README.md          diese Datei
```
