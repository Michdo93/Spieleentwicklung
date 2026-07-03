# Chapter 14b · Dungeon 3D

> Original: `A3GPU214_Dungeon3D` (`Dungeon3D.as`)
> Live-Demo: [`chapters/chapter-14-dungeon3d/`](./index.html) auf GitHub Pages

## Worum es geht

Ein waschechter First-Person-Walker: frei drehen, vor/zurück laufen, Münzen
einsammeln, Blöcken ausweichen. Das Original nutzt dafür Flash Players
eingebaute 3D-Engine vollständig.

## Was ich übersetzt habe

| ActionScript 3                                              | HTML5 / JavaScript                                        |
|----------------------------------------------------------------------|--------------------------------------------------------------------|
| `viewSprite`/`worldSprite` + `rotationY`, automatische Perspektive     | eigene `project(x,y,z,camera)`-Funktion (Kamera-Transformation + Zentralprojektion aus Chapter 14a) |
| `Square`-Objekte → vier `addWall()`-Aufrufe pro Block                    | `wallQuad()` für jede der vier Kanten eines Blocks                   |
| `movePlayer()` — Rechteck-Push-Back-Kollision                            | identisch übernommen (dasselbe Muster wie `TopDownGame.moveCar()` aus Kapitel 12) |
| `zSort()` per `transform.getRelativeMatrix3D()`                          | Sortierung nach berechneter Kamera-Tiefe (`depth`)                   |
| Münzen: `rotationX=-90` (aufrecht zum Spieler) + `rotationZ`-Spin          | Billboard-Ellipse, Breite pulsiert mit `cos(spin)` als Dreh-Andeutung |

## Was man hier lernt

- Wie man eine Kamera-Transformation (Position + Blickwinkel) von Hand
  rechnet, wenn keine 3D-Engine die Projektion automatisch übernimmt
- Dass "Square"-Hindernisse im Original keine Räume, sondern solide Blöcke
  sind — dieselbe Rechteck-Kollision wie in einem Top-Down-Spiel, nur aus
  der Ich-Perspektive gezeichnet
- Painter's Algorithm (nach Tiefe sortiert zeichnen) als einfache
  Verdeckungslösung ohne echten Tiefenpuffer

## Dateien

```
chapter-14-dungeon3d/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           Dungeon3D-Klasse, Projektion, Kollision
└── README.md          diese Datei
```

## Steuerung

`←`/`→` drehen, `↑`/`↓` laufen.
