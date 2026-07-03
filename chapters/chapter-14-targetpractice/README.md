# Chapter 14d · Target Practice

> Original: `A3GPU214_TargetPractice` (`TargetPractice.as`)
> Live-Demo: [`chapters/chapter-14-targetpractice/`](./index.html) auf GitHub Pages

## Worum es geht

Eine Kanone seitlich verschieben und den Winkel einstellen, eine Kugel mit
echter Schwerkraft durch den 3D-Raum abfeuern, ein zufällig platziertes
Ziel treffen.

## Was ich übersetzt habe

| ActionScript 3                                        | HTML5 / JavaScript                                    |
|----------------------------------------------------------------|---------------------------------------------------------------|
| `ball.z`/`ball.y` (Flash native 3D-Properties)                    | `project(x,y,z)` aus Chapter 14a — Kamera bleibt fest, nur der Ball bewegt sich |
| `dy += .1` pro Frame (Schwerkraft)                                | `ball.dy += 0.1 * (dt*60)` — zeitbasiert auf 60fps-Äquivalent skaliert |
| Kanonenringe (`5*i*sin/cos(angle)`)                                 | identische Formel übernommen                                  |
| `Math.sqrt(Math.pow(dx,2)+Math.pow(dz,2))` für Trefferprüfung        | `Math.hypot(dx, dz)`                                          |

## Was man hier lernt

- Dieselbe Projektionsfunktion funktioniert unabhängig davon, ob sich die
  Kamera bewegt (Dungeon 3D, Racing 3D) oder ein einzelnes Objekt in einer
  stehenden Szene (hier der Ball) — "Weltpunkt rein, Bildschirmpunkt raus"
  kennt keinen Unterschied
- Wurfparabel-Physik in drei statt zwei Dimensionen — im Kern dieselbe
  Formel wie bei Balloon Pop (Kapitel 07), nur mit einer zusätzlichen Achse
- Wie man pro-Frame-Deltas aus einem AS3-Original zeitbasiert überträgt,
  ohne die Spielbalance zu verändern (`dt * 60` als Skalierungsfaktor)

## Dateien

```
chapter-14-targetpractice/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       minimal
├── game.js           TargetPractice-Klasse, Projektion, Flugbahnphysik
└── README.md          diese Datei
```

## Steuerung

`←`/`→` Kanone verschieben, `↑`/`↓` Winkel ändern, `Leertaste` feuert.
