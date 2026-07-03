# Chapter 07b · Air Raid 2

> Original: `A3GPU207_AirRaid2` (`AirRaid2.as`, `AAGun.as`, `Bullet.as`, `Airplane.as`)
> Live-Demo: [`chapters/chapter-07-airraid2/`](./index.html) auf GitHub Pages

## Worum es geht

Dieselbe Flak-Kanone wie in [Chapter 05](../chapter-05-airraid/), aber mit
rotierender statt seitlich fahrender Kanone — die erste praktische Anwendung
der Trigonometrie aus [Chapter 07a](../chapter-07-rotationmath/).

## Was sich gegenüber Chapter 05 ändert

| Bereich  | Chapter 05 (Air Raid)          | Chapter 07 (Air Raid 2)                    |
|----------|----------------------------------|------------------------------------------------|
| Kanone   | bewegt `x` seitlich                | dreht `rotation` (−170° bis −20°)                |
| Kugel    | feste Geschwindigkeit `dy = -300`  | `dx/dy` aus `cos(rot)`/`sin(rot)` × Geschwindigkeit |
| Startpunkt Kugel | an `aagun.x/y`             | 35px in Feuerrichtung vor der Kanonenspitze verschoben |
| Flugzeuge, Kollision, Punktestand | unverändert | unverändert (1:1 aus Chapter 05 übernommen) |

## Was man hier lernt

- Wie klein die Änderung sein kann, wenn man von "Bewegung entlang einer
  Achse" zu "Bewegung in eine beliebige Richtung" wechselt — nur die
  Positions-/Geschwindigkeitsberechnung ändert sich, die restliche
  Spielarchitektur bleibt stehen
- Warum ein Projektil nicht exakt am Rotationszentrum, sondern einen festen
  Versatz in Blickrichtung entfernt starten sollte (sonst erscheint es "im"
  Geschützrohr statt davor)

## Dateien

```
chapter-07-airraid2/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       HUD-/Overlay-Styles (identisch zu Chapter 05)
├── game.js           AAGun/Airplane/Bullet/AirRaid2Game-Klassen
└── README.md          diese Datei
```
