# Chapter 09b · Text Examples

> Original: `A3GPU209_TextExamples` (`StringExamples`-Frameskript, `TextFly.as`)
> Live-Demo: [`chapters/chapter-09-textexamples/`](./index.html) auf GitHub Pages

## Worum es geht

Zwei kleine, unabhängige Demos:

1. **String-Methoden** — ein direkter Vergleich, welche AS3-String-Funktionen
   wie in JavaScript aussehen
2. **TextFly** — Buchstaben fliegen von einer Startposition zu ihrer
   Endposition, während sie sich drehen und aufskalieren (typische
   Titelbildschirm-Animation)

## Was ich übersetzt habe

| ActionScript 3                                 | HTML5 / JavaScript                              |
|-------------------------------------------------------|--------------------------------------------------------|
| `charAt`, `indexOf`, `lastIndexOf`, `slice`, `split`, `join`, `replace` mit Regex | identisch — Teil des ECMAScript-Standards, den beide Sprachen teilen |
| `substr(start, length)`                                  | funktioniert noch, aber als "legacy" markiert — `substring(start, end)` ist die moderne Wahl |
| `Timer(stepTime, numSteps)` für die Flug-Animation         | `setTimeout()`-Kette mit Schrittzähler                    |
| lineare Interpolation für Position/Skalierung/Rotation      | identische Formel: `start*(1-p) + end*p`                  |

## Was man hier lernt

- Wie viel gemeinsame Basis AS3 und JavaScript bei String-Verarbeitung haben
  (beide bauen auf ECMAScript auf) — copy-paste-nahe Portierung möglich
- Lineare Interpolation als universelles Werkzeug für Animationen: dieselbe
  Formel funktioniert für Position, Skalierung, Rotation, Alpha — überall,
  wo ein Wert "von A nach B" wandern soll

## Dateien

```
chapter-09-textexamples/
├── index.html      Lernseite mit 2 Demo-Tabs
├── chapter.css       Tab-Leiste, Ausgabe-Panel
├── game.js           beide Demos
└── README.md          diese Datei
```
