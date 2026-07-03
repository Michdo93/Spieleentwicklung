# Chapter 12a · Racing Game

> Original: `A3GPU212_RacingGame` (`Racing.as`)
> Live-Demo: [`chapters/chapter-12-racinggame/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Top-Down-Rennspiel: lenken, beschleunigen, auf der Straße bleiben (abseits
wird man langsamer), eine volle Runde über drei Wegpunkte fahren, dann zurück
zur Startlinie. Zeitmessung inklusive.

## Was ich übersetzt habe

| ActionScript 3                                         | HTML5 / JavaScript                                     |
|----------------------------------------------------------------|------------------------------------------------------------|
| `road.hitTestPoint(x, y, true)` gegen eine gezeichnete Straßengrafik | `ctx.isPointInPath(roadPath, x, y, "evenodd")` gegen einen selbst gebauten `Path2D` |
| `side.hitTestPoint(...)` für die Seitenstreifen-Toleranz         | zweiter, etwas breiterer `Path2D` (`sidePath`)                |
| Beschleunigung/Lenkung (`accel`, `decel`, `turnSpeed`, `maxSpeed`) | 1:1 identisch übernommen, inklusive aller Konstanten          |
| `checkFinishLine()` — `car.y &lt; finish.y`                        | Abstandstest zum Startpunkt (an die Donut-Streckenform angepasst, siehe unten) |
| `DriveSound`/`OffroadSound`/`SideSound` (Bibliothekssounds)        | synthetischer Motorton per Web Audio API, Frequenz/Wellenform an Geschwindigkeit/Untergrund gekoppelt |
| `ReadysetSound`/`GoSound` (Countdown)                               | kurze `beep()`-Töne                                          |

## Warum die Ziellinien-Logik angepasst wurde

Das Original prüft die Ziellinie simpel mit `car.y < finish.y` — das setzt
voraus, dass die Ziellinie eine bestimmte Ausrichtung hat (waagerecht, am
oberen Streckenende). Da die Original-Streckengrafik nicht als wiederverwendbare
Daten vorlag, wurde hier eine eigene Ringstrecke ("Donut" aus äußerer und
innerer abgerundeter Fläche) gebaut. Für eine Ringstrecke ist ein
Abstandstest zum Startpunkt die passendere Entsprechung — funktional
dasselbe Ziel (eine komplette Runde), nur an die andere Geometrie angepasst.

## Was man hier lernt

- Wie man einen pixelgenauen `hitTestPoint()`-Test durch einen
  Vektorpfad-Test (`isPointInPath()`) ersetzt, wenn man die Streckenform
  selbst kennt (statt sie aus einer Bitmap auszulesen)
- Die `evenodd`-Füllregel als Werkzeug, um aus zwei verschachtelten Formen
  eine "Donut"-Fläche zu bauen
- Wie sich Motorsound ohne Audiodateien rein synthetisch erzeugen lässt
  (Oszillator-Frequenz an Geschwindigkeit gekoppelt, Wellenform an Untergrund)

## Dateien

```
chapter-12-racinggame/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/Countdown-Styles
├── game.js           RacingGame-Klasse, Streckenpfade, Sound-Synthese
└── README.md          diese Datei
```

## Steuerung

`↑`/`↓` Gas/Bremse, `←`/`→` lenken.
