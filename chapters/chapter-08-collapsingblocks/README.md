# Chapter 08b · Collapsing Blocks

> Original: `A3GPU208_CollapsingBlocks` (`CollapsingBlocks.as`)
> Live-Demo: [`chapters/chapter-08-collapsingblocks/`](./index.html) auf GitHub Pages

## Worum es geht

Das "SameGame"-Prinzip: ein Raster aus farbigen Blöcken, per Klick auf einen
Block werden alle direkt verbundenen Blöcke derselben Farbe gesucht (Flood
Fill). Ab zwei Treffern verschwinden sie, darüberliegende Blöcke fallen nach,
leere Spalten rutschen zusammen.

## Was ich übersetzt habe

| ActionScript 3                                      | HTML5 / JavaScript                                    |
|------------------------------------------------------------|------------------------------------------------------------|
| `testBlock()` — rekursive Flood-Fill-Suche                    | 1:1 derselbe Algorithmus, mit `visited`-Set statt Typ-Mutation |
| `blocks[col][row].type = 0` als "besucht"-Markierung           | `visited.add(col+","+row)` — kein Seiteneffekt auf Spieldaten |
| feste Pixel-Schritte pro Frame (`moveStep = 4`)                 | zeitbasierte Bewegung (`moveSpeed * dt`)                    |
| `affectAbove()` / `checkForEmptyColumns()`                      | identisch übernommen                                       |
| `new PointBurst(this, pointsScored, mouseX, mouseY)`             | wiederverwendete Mini-Version aus Chapter 08a                |

## Was man hier lernt

- Flood Fill als generelles Werkzeug (Fülleimer, Minesweeper, Rätselspiele) —
  nicht nur für dieses eine Spiel
- Warum ein separates "besucht"-Set robuster ist als eine Markierung direkt
  in den Spieldaten, die bei einem Fehlversuch wieder zurückgesetzt werden muss
- Zwei-Phasen-Nachrutschen: erst Blöcke fallen lassen, dann (wenn alles ruht)
  leere Spalten zusammenschieben

## Dateien

```
chapter-08-collapsingblocks/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           CollapsingBlocksGame-Klasse + Mini-PointBurst
└── README.md          diese Datei
```
