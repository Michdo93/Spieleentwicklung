# Chapter 07d · Space Rocks

> Original: `A3GPU207_SpaceRocks` (`SpaceRocks.as`)
> Live-Demo: [`chapters/chapter-07-spacerocks/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Asteroids-Klon — das aufwendigste Spiel in Kapitel 07 und die
Zusammenfassung aller Trigonometrie-Bausteine aus diesem Kapitel: Rotation,
Schub in Blickrichtung, Geschoss-Richtung, dazu Bildschirm-Wrapping, ein
Schildsystem, Leben und Level mit steigender Geschwindigkeit.

## Was ich übersetzt habe

| ActionScript 3                                        | HTML5 / JavaScript                                     |
|--------------------------------------------------------------|-----------------------------------------------------------------|
| `shipMoveX += cos(rot)*thrustPower` (pro Frame)                | `shipMoveX += cos(rot)*thrustPower*dt` (zeitbasiert)              |
| vier einzelne Grenzfall-Prüfungen fürs Wrapping                 | eine gemeinsame `wrap(v, max)`-Hilfsfunktion                      |
| `Rock_Big`/`Rock_Medium`/`Rock_Small`-Bibliothekssymbole          | ein `newRock(x,y,type)` mit zufällig gezackter Polygonform          |
| `Point.distance()` für Kollision                                 | `Math.hypot(dx, dy)`                                              |
| `Timer` für Schild-Dauer und Levelpause                          | `setTimeout()`                                                    |
| Schiff-Explosion als `gotoAndPlay("explode")`-Animation           | expandierender, ausblendender Kreis (`explodeT`)                   |

## Was man hier lernt

- Trägheitsbasierte Bewegung ("Schub" statt "direkte Geschwindigkeit") als
  eigenständiges Bewegungsmuster, klar abgegrenzt von der direkten Bewegung
  aus Chapter 07a
- Bildschirm-Wrapping als wiederverwendbare Hilfsfunktion statt Kopieren von
  vier Grenzfällen pro Objekttyp
- Eine rekursive Objektaufteilung (großer Felsen → zwei mittlere → vier kleine)
- Wie sich mehrere Timer-/Zustands-Mechaniken (Schild-Dauer, Respawn-Verzögerung,
  Levelpause) mit `setTimeout()` genauso sauber abbilden lassen wie mit
  AS3-`Timer`-Objekten

## Dateien

```
chapter-07-spacerocks/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       HUD-/Overlay-Styles
├── game.js           SpaceRocksGame-Klasse (Schiff, Felsen, Geschosse, Schild)
└── README.md          diese Datei
```
