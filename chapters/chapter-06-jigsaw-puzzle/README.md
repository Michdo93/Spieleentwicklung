# Chapter 06b · Jigsaw Puzzle

> Original: `A3GPU206_JigsawPuzzle` (`JigsawPuzzle.as`)
> Live-Demo: [`chapters/chapter-06-jigsaw-puzzle/`](./index.html) auf GitHub Pages

## Worum es geht

48 Puzzleteile (8×6-Raster) aus einem Bild, zufällig auf der Fläche verstreut.
Ziel: alle Teile wieder in der richtigen relativen Anordnung zusammensetzen.
Bereits korrekt verbundene Teile bewegen sich ab dann gemeinsam.

## Was ich übersetzt habe

| ActionScript 3                                              | HTML5 / JavaScript                                     |
|------------------------------------------------------------------|--------------------------------------------------------------|
| `Loader`/`BitmapData.copyPixels()` zum Zerschneiden                | `drawImage()` mit Quell-/Zielrechteck (siehe Chapter 06a)      |
| zwei `Sprite`-Ebenen (`otherPieces`/`selectedPieces`) für Z-Reihenfolge | ein `zOrder`-Array, das aktive Teile ans Ende schiebt          |
| `findLockedPieces()`/`isConnected()`                                | 1:1 derselbe Algorithmus (Distanz-Sortierung + Nachbarschaftstest) |
| `Array.sortOn("dist", Array.DESCENDING)`                            | `Array.prototype.sort((a,b) => b.dist - a.dist)`               |
| `lockPiecesToGrid()` (Runden auf 10px)                              | identisch übernommen                                          |
| `puzzleTogether()` (relative Positionsprüfung)                      | identisch übernommen                                          |

## Was man hier lernt

- Wie man mehrere zusammengehörige Objekte als **eine** Dragging-Gruppe
  behandelt, ohne sie fest zu verketten — die Gruppenzugehörigkeit wird bei
  jedem Klick neu berechnet
- Warum eine kleine Rundungstoleranz (10-Pixel-Raster) ein Puzzle mit der Maus
  überhaupt spielbar macht
- Dass ein Fertigstellungs-Check auf **relativen** statt absoluten Positionen
  basieren kann — das Puzzle hat kein festes Zielfeld

## Dateien

```
chapter-06-jigsaw-puzzle/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           JigsawGame-Klasse
├── assets/
│   └── jigsawimage.jpg  Original-Bild aus dem Buchmaterial
└── README.md          diese Datei
```
