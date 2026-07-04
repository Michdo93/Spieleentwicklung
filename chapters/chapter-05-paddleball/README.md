# Chapter 05c · Paddle Ball

> Original: `A3GPU205_PaddleBall` (`PaddleBall.as`)
> Live-Demo: [`chapters/chapter-05-paddleball/`](./index.html) auf GitHub Pages

## Worum es geht

Trotz des Namens ein waschechter Breakout-Klon: Maus steuert das Paddle,
Ball zerstört eine 8×5-Ziegelwand, prallt von Wänden und dem Paddle mit
variablem Winkel ab. 3 Bälle, dann ist Schluss.

## Was ich übersetzt habe

| ActionScript 3                                        | HTML5 / JavaScript                                    |
|----------------------------------------------------------------|---------------------------------------------------------------|
| `ballDX = (newBallX-paddle.x)*paddleCurve` — variabler Abprallwinkel | identisch übernommen                                          |
| Alte vs. neue Ball-Position (`oldBallRect`/`newBallRect`) zur Trefferrichtungs-Erkennung | identisch übernommen                                          |
| `getTimer()`-Differenz in Millisekunden                          | `dt` in Sekunden, `ballSpeed`/`paddleCurve` entsprechend umskaliert |
| Rechteck-Kollision gegen Wände/Paddle/Ziegel                       | identisch übernommen (dasselbe AABB-Muster wie im ganzen Repo)  |

## Was man hier lernt

- Einen natürlich wirkenden variablen Abprallwinkel mit einer einzigen
  Formel (Abstand zum Paddle-Mittelpunkt × Konstante)
- Warum die Kollisionsrichtung (Seite vs. oben/unten) einen Vergleich der
  Position *vor* und *nach* der Bewegung braucht, nicht nur der aktuellen
  Position
- Wieder dasselbe AABB-Kollisionsmuster wie in fast jedem anderen Kapitel —
  diesmal an drei verschiedenen Objekttypen gleichzeitig (Wände, Paddle,
  Ziegel)

## Dateien

```
chapter-05-paddleball/
├── index.html      Lernseite (Erklärung + spielbares Breakout)
├── chapter.css       Overlay-Styles
├── game.js           PaddleBallGame-Klasse
└── README.md          diese Datei
```

## Steuerung

Maus bewegt das Paddle, Klick startet den Ball.
