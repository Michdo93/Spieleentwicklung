# Chapter 06a · Bitmap

> Original: `A3GPU206_Bitmap` (`BitmapExample.as`)
> Live-Demo: [`chapters/chapter-06-bitmap/`](./index.html) auf GitHub Pages

## Worum es geht

Der Grundbaustein für beide Puzzles in diesem Kapitel: ein Bild laden und in
ein Raster aus Einzelteilen zerschneiden, jedes Teil einzeln positionieren.

## Was ich übersetzt habe

| ActionScript 3                                        | HTML5 / JavaScript                     |
|------------------------------------------------------------|--------------------------------------------|
| `Loader` + `URLRequest` + `Event.COMPLETE`                  | `new Image()` + `img.onload`                |
| `BitmapData.copyPixels(src, rect, point)`                   | `ctx.drawImage(img, sx,sy,sw,sh, dx,dy,dw,dh)` — ein Aufruf statt zwei Schritte |

## Was man hier lernt

- Dass Canvas' `drawImage()` mit neun Parametern das AS3-Duo
  "BitmapData anlegen + copyPixels" in einer einzigen Funktion erledigt
- Wie man aus Bildbreite/-höhe und einer Rasterzahl (hier 6×4) die Größe
  jedes einzelnen Teils berechnet — dieselbe Formel taucht in Jigsaw- und
  Sliding-Puzzle wieder auf

## Dateien

```
chapter-06-bitmap/
├── index.html      Lernseite (Erklärung + Demo)
├── chapter.css       minimal
├── game.js           Lade- und Zerschneide-Logik
├── assets/
│   └── testimage.jpg   Original-Bild aus dem Buchmaterial
└── README.md          diese Datei
```
