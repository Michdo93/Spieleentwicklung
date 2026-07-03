# Chapter 09a · Hangman

> Original: `A3GPU209_Hangman` (`Hangman.as`)
> Live-Demo: [`chapters/chapter-09-hangman/`](./index.html) auf GitHub Pages

## Worum es geht

Der Klassiker: Buchstaben raten, bevor die Galgenzeichnung fertig ist.
Bemerkenswert wenig Code für ein komplettes Spiel — der gesamte Zustand
besteht aus zwei Strings.

## Was ich übersetzt habe

| ActionScript 3                                   | HTML5 / JavaScript                              |
|--------------------------------------------------------|--------------------------------------------------------|
| `phrase.replace(/[A-Za-z]/g, "_")`                        | identisch — Regex-`replace()` funktioniert 1:1 in JS      |
| `shown.substr(0,i) + phrase.substr(i,1) + shown.substr(i+1)` | `substring()` statt `substr()` (moderner, gleiche Wirkung) |
| `character.gotoAndStop(numWrong+1)` (Bibliothekssymbol)    | Liste von Zeichenfunktionen, eine pro Fehlversuch, auf Canvas |
| `stage.addEventListener(KeyboardEvent.KEY_UP, pressKey)`    | `window.addEventListener('keyup', ...)`                  |

## Was man hier lernt

- Wie viel Spiellogik sich manchmal in reiner String-Verarbeitung abbilden
  lässt, ganz ohne Arrays oder Grids
- Dass AS3s String-API (`replace`, `substr`/`substring`, reguläre Ausdrücke)
  nahezu 1:1 der JavaScript-String-API entspricht
- Eine gestufte Zeichnung (ein Element pro Spielereignis) als einfache
  Alternative zu einem Bibliothekssymbol mit mehreren Frames

## Dateien

```
chapter-09-hangman/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/Text-Styles
├── game.js           HangmanGame-Klasse, gestufte Galgen-Zeichnung
└── README.md          diese Datei
```
