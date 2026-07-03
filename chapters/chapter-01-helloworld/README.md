# Chapter 01 · Hello World

> Original: `A3GPU201_HelloWorld` (HelloWorld1–3, DebugExample, TooEarlyExample)
> Live-Demo: [`chapters/chapter-01-helloworld/`](./index.html) auf GitHub Pages

## Worum es geht

Der Einstieg ins Buch behandelt vier Dinge, die durch fast jedes weitere Kapitel
mitgeschleppt werden:

1. Ein Objekt "auf die Bühne" bringen
2. Text anzeigen
3. Mit `trace()` (bzw. `console.log()`) debuggen
4. Verstehen, **wann** welcher Code im Objekt-Lebenszyklus läuft

## Was ich übersetzt habe

| ActionScript 3                         | HTML5 / JavaScript                          |
|-----------------------------------------|----------------------------------------------|
| `trace(...)`                            | `console.log(...)` + eigenes Output-Panel im UI |
| `TextField` + `addChild()`              | `ctx.fillText()` auf `<canvas>`               |
| Flash-Ausgabefenster                    | `<div id="output">` im DOM, live befüllt      |
| Zeitleisten-Frames (`gotoAndStop`)      | entfällt — es gibt keine Timeline mehr; Zustand wird explizit in JS-Variablen gehalten |
| "zu früh zugegriffen"-Fehler (Frame-Objekt existiert noch nicht) | dieselbe Fehlerklasse existiert im Web: Zugriff auf DOM-Elemente vor `DOMContentLoaded` oder auf Daten vor Abschluss eines `fetch()` |

`HelloWorld2.fla` wurde im Original komplett ohne Code erstellt (Text direkt mit dem
Flash-Werkzeug auf die Bühne gezeichnet) und ist deshalb hier ausgelassen — es gibt
keinen Code zu portieren, nur eine IDE-Interaktion.

## Was man hier lernt

- Der Unterschied zwischen **etwas passiert unsichtbar im Hintergrund** (nur `trace`)
  und **etwas ist sichtbar auf der Bühne** (TextField/Canvas-Zeichnung)
- Warum Debug-Ausgaben mit Position/Reihenfolge (`DebugExample`) oft schneller zum Ziel
  führen als ein Schritt-für-Schritt-Debugger, gerade am Anfang
- Die "zu früh initialisiert"-Falle, die in AS3 wie in JS aus demselben Grund passiert:
  Code läuft, bevor das referenzierte Objekt existiert

## Dateien

```
chapter-01-helloworld/
├── index.html     Lernseite (Erklärung + eingebettete, interaktive Demo)
├── chapter.css     kleine Ergänzungen zum globalen Stylesheet
├── game.js         alle vier Mini-Demos als reines Canvas/JS
└── README.md        diese Datei
```

## Selbst ausprobieren

Einfach `index.html` lokal im Browser öffnen (kein Build-Schritt, kein Server nötig) oder
über GitHub Pages aufrufen. Die vier Buttons über dem Canvas wechseln zwischen den
Demos aus dem Originalkapitel.
