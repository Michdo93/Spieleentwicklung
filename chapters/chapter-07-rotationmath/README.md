# Chapter 07a · Rotation Math

> Original: `A3GPU207_RotationMath` (`PointingArrow.as`, `MovingCar.as`)
> Live-Demo: [`chapters/chapter-07-rotationmath/`](./index.html) auf GitHub Pages

## Worum es geht

Die Trigonometrie-Grundlagen für den Rest des Kapitels, in zwei kleinen Demos:

1. **Zeigepfeil** — ein Pfeil dreht sich per `Math.atan2()` immer zum Mauszeiger
2. **Fahrendes Auto** — Pfeiltasten drehen ein Objekt, `Math.cos()`/`Math.sin()`
   berechnen daraus einen Bewegungsvektor "in Blickrichtung"

## Was ich übersetzt habe

| ActionScript 3                              | HTML5 / JavaScript                     |
|--------------------------------------------------|----------------------------------------------|
| `Math.atan2(dy, dx)`                               | identisch — `Math.atan2()` existiert 1:1 in JS |
| `MovieClip.rotation` (Grad) vs. `Math.cos/sin` (Radiant) | dieselbe Situation; einmalige `deg2rad()`-Hilfsfunktion statt mehrfacher Inline-Umrechnung |
| `car.x += dx; car.y += dy;` nach Tastendruck        | identisches Muster, `ctx.rotate()` erwartet ebenfalls Radiant |

## Was man hier lernt

- Die zwei Grundrichtungen der Rotations-Mathematik: Winkel → Vektor
  (`cos`/`sin`) und Vektor → Winkel (`atan2`)
- Dass Grad/Radiant-Verwirrung in AS3 genauso ein Thema ist wie in
  JavaScript — beide Welten brauchen dieselbe Umrechnung
- Die Basis für Air Raid 2, Balloon Pop und Space Rocks, die alle drei auf
  genau dieser Formel aufbauen

## Dateien

```
chapter-07-rotationmath/
├── index.html      Lernseite mit 2 Demo-Tabs
├── chapter.css       Tab-Leiste
├── game.js           beide Demos
└── README.md          diese Datei
```
