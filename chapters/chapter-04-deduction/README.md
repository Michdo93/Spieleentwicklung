# Chapter 04a · Deduction

> Original: `A3GPU204_Deduction` (`Deduction.as`)
> Live-Demo: [`chapters/chapter-04-deduction/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Mastermind-Klon: Der Computer wählt eine geheime Kombination aus 5 Farben,
der Spieler hat 10 Versuche, sie zu erraten. Nach jeder Reihe gibt es Feedback:
wie viele Stifte sind an der richtigen Stelle, wie viele haben die richtige
Farbe an der falschen Stelle.

## Was ich übersetzt habe

| ActionScript 3                                  | HTML5 / JavaScript                                |
|----------------------------------------------------|--------------------------------------------------------|
| `Peg`-Bibliothekssymbol mit Frame pro Farbe          | gezeichnete Kreise, Farbe aus einem Array               |
| `DoneButton`-Symbol + `MouseEvent.CLICK`             | Rechteck-Koordinatentest bei Klick auf die feste Button-Position |
| `calculateProgress()`                                | 1:1 derselbe Zähl-Algorithmus (Farb-Häufigkeiten, Minimum bilden) |
| `MovieClip(root).gotoAndStop("gameover")`            | `state`/`finished`-Flag + DOM-Overlay                    |

## Was man hier lernt

- Ein reines Logikspiel ganz ohne Zeit-/Frame-Schleife — nur Event-getriebene UI
- Den klassischen "richtige Farbe, falsche Stelle"-Zählalgorithmus (taucht in
  Wortspielen/Rätselspielen öfter wieder auf)
- Klickbare UI-Elemente auf dem Canvas per Koordinatentest simulieren, ganz
  ohne DOM-Buttons

## Dateien

```
chapter-04-deduction/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/Legenden-Styles
├── game.js           DeductionGame-Klasse
└── README.md          diese Datei
```
