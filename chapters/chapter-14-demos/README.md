# Chapter 14a · 3D Demos

> Original: `A3GPU214_Demos` (demo1.fla … demo4.fla, reine Timeline-Skripte)
> Live-Demo: [`chapters/chapter-14-demos/`](./index.html) auf GitHub Pages

## Worum es geht

Die Grundlagen für den Rest des Kapitels: Flash Players eingebaute "native
3D"-Eigenschaften (`z`, `rotationX`, `rotationY`, `rotationZ`) und wie man
ihre Wirkung ohne diese Engine per Hand nachrechnet.

## Was ich übersetzt habe

| ActionScript 3                                | HTML5 / JavaScript                                    |
|--------------------------------------------------|----------------------------------------------------------|
| `square.z = 100` (automatische Perspektive)         | `scale = FOCAL / (FOCAL + z)` — von Hand berechnete Zentralprojektion |
| `square.rotationX = -30`                             | Höhen-Stauchung um `cos(winkel)` angenähert (keine echte Flächendrehung) |
| `square.rotationZ += 1` pro Frame                     | `ctx.rotate()` — echte 2D-Rotation, kein Trick nötig       |
| `Event.ENTER_FRAME`                                    | `requestAnimationFrame`                                  |

## Eine wichtige Einschränkung

Ohne WebGL lässt sich eine echte Flächendrehung im Raum auf einem 2D-Canvas
nicht exakt nachbilden — die `rotationX`/`rotationY`-Demos hier sind bewusste
Näherungen (Stauchung statt echtem perspektivischen Trapez-Verzug). Das
Prinzip wird trotzdem klar sichtbar, und dieselbe Projektionsformel trägt
das gesamte restliche Kapitel (Dungeon 3D, Racing 3D, Target Practice).

## Was man hier lernt

- Die eine Formel, die "Perspektive" in diesem ganzen Kapitel ausmacht:
  `scale = focalLength / (focalLength + z)`
- Der Unterschied zwischen einer Engine, die 3D-Transformationen automatisch
  übernimmt (Flash Player), und der manuellen Nachbildung auf einem
  2D-Zeichenkontext
- Warum Z-Achsen-Rotation der einzige der drei Fälle ist, der ohne
  Näherung exakt funktioniert

## Dateien

```
chapter-14-demos/
├── index.html      Lernseite mit 4 Demo-Tabs
├── chapter.css       Tab-Leiste
├── game.js           project()-Funktion + vier Demos
└── README.md          diese Datei
```
