# Chapter 13c · Video Poker

> Original: `A3GPU213_VideoPoker` (`VideoPoker.as`)
> Live-Demo: [`chapters/chapter-13-videopoker/`](./index.html) auf GitHub Pages

## Worum es geht

Klassisches 5-Karten-Draw-Poker: 5 Karten erhalten, beliebig viele abwerfen
und neu ziehen, dann automatische Handbewertung mit Auszahlung nach
Standard-Video-Poker-Tabelle (Jacks-or-Better-Variante).

## Was ich übersetzt habe

| ActionScript 3                                     | HTML5 / JavaScript                                    |
|-------------------------------------------------------|--------------------------------------------------------------|
| `handValue()` — komplette Poker-Handanalyse              | nahezu 1:1 übernommen (reine Array-/Zahlenverarbeitung)         |
| `winnings()` — Auszahlungstabelle                         | identisch übernommen (als Lookup-Objekt statt `if`-Kette)        |
| `compareHands()` als Sortierfunktion                       | `Array.prototype.sort()` mit äquivalenter Vergleichsfunktion     |
| Karte umdrehen zum Markieren (`gotoAndStop(2)`)             | CSS-Klasse `marked` (Transparenz + "DISCARD"-Label)              |
| `Timer(250)` + Ereignis-Liste fürs Austeilen/Ziehen          | `setInterval()` mit derselben Ereignis-Liste                    |

## Was man hier lernt

- Wie sich reine Datenverarbeitungs-Logik (hier: Poker-Handbewertung) fast
  ohne Änderung von AS3 nach JavaScript übertragen lässt — der Unterschied
  zwischen "spielspezifischer Analysecode" und "Flash-API-Code" wird hier
  besonders deutlich
- Sortieren einer *Kopie* der Daten für die Analyse, ohne die Original-
  Reihenfolge (und damit die Anzeige) zu verändern
- Wiederverwendung der Timed-Event-Queue-Technik aus Chapter 13b in einem
  neuen Kontext (Karten ziehen statt austeilen)

## Dateien

```
chapter-13-videopoker/
├── index.html      Lernseite (Erklärung + spielbares Video Poker)
├── chapter.css       Kartentisch-, Karten- und Auszahlungstabellen-Styles
├── game.js           VideoPokerGame-Klasse
└── README.md          diese Datei
```
