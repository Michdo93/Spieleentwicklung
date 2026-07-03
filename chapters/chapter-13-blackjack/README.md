# Chapter 13b · Blackjack

> Original: `A3GPU213_Blackjack` (`Blackjack.as`)
> Live-Demo: [`chapters/chapter-13-blackjack/`](./index.html) auf GitHub Pages

## Worum es geht

Vollständiges Blackjack: 6-Deck-Schuh (312 Karten), Einsätze $5–25, verdeckte
erste Dealer-Karte, Hit/Stay, Dealer-KI (zieht bis Handwert 17), Ass zählt 1
oder 11 je nachdem was nicht zum Überkaufen führt.

## Was ich übersetzt habe

| ActionScript 3                                       | HTML5 / JavaScript                                    |
|---------------------------------------------------------|--------------------------------------------------------------|
| Karten als kurze Strings (`"h1"`, `"s13"`)                 | identisch übernommen — nur das Zeichnen ist anders            |
| `Cards`-Bibliothekssymbol mit 52 Frames + `"back"`           | HTML-Element mit Rang/Symbol pro Karte, eigene "Kartenrückseite" per CSS-Muster |
| `createDeck()` — 6 Decks mischen                            | identisch übernommen                                          |
| `Timer(1000)` + Ereignis-Liste fürs Austeilen                 | `setInterval()` + dieselbe Ereignis-Liste (`timedEventsList`)   |
| `handValue()` — Ass zählt 1 oder 11                           | identisch übernommen                                          |
| `checkForBlackjack()`, `dealerMove()`, `decideWinner()`         | identisch übernommen                                          |

## Was man hier lernt

- Kartenwerte als einfache Strings zu kodieren, statt komplexe Objekte zu
  bauen — genug Information (Farbe + Zahl), leicht zu parsen
  (`substr`/`substring`)
- Eine "Ereignis-Warteschlange, im Takt abgearbeitet"-Technik für
  zeitversetzte Spielabläufe (Karte für Karte austeilen) — dasselbe Muster
  wie bei der Sequenz-Wiedergabe im Memory-Game aus Kapitel 04
- Die klassische Ass-1-oder-11-Regel als kompakte Zwei-Zeilen-Logik

## Dateien

```
chapter-13-blackjack/
├── index.html      Lernseite (Erklärung + spielbares Blackjack)
├── chapter.css       Kartentisch- und Kartendesign
├── game.js           BlackjackGame-Klasse
└── README.md          diese Datei
```
