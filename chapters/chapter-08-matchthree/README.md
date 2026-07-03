# Chapter 08c · Match Three

> Original: `A3GPU208_MatchThree` (`MatchThree.as`)
> Live-Demo: [`chapters/chapter-08-matchthree/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Bejeweled-Klon: zwei angrenzende Teile tauschen, um Dreier-Reihen (oder
länger) zu bilden. Treffer verschwinden, der Rest fällt nach, neue Teile
kommen von oben — mit automatischen Kettenreaktionen.

## Was ich übersetzt habe

| ActionScript 3                                          | HTML5 / JavaScript                                    |
|----------------------------------------------------------------|---------------------------------------------------------------|
| `makeSwap()` — tauschen, prüfen, ggf. zurücktauschen              | identisch übernommen                                          |
| `setUpGrid()` — würfeln bis gültiges Startraster gefunden          | identisch übernommen (mit Sicherheitslimit von 200 Versuchen)   |
| `lookForMatches()`/`getMatchHoriz()`/`getMatchVert()`               | identisch übernommen                                          |
| `lookForPossibles()`/`matchPattern()`                                | identisch übernommen, inkl. der geometrischen Musterlisten      |
| feste Pixel-Schritte pro Frame                                       | zeitbasierte Bewegung (`moveSpeed * dt`)                       |
| `PointBurst` pro Treffer                                              | eigene Mini-Version (siehe Chapter 08a)                        |

## Was man hier lernt

- Das "ausprobieren, dann ggf. rückgängig machen"-Muster als Alternative zu
  einer separaten Vorab-Prüffunktion — oft einfacher zu schreiben und zu warten
- Wie man garantiert, dass ein zufällig erzeugtes Raster spielbar ist
  (regenerieren, bis Kriterien erfüllt sind), statt nachträglich zu reparieren
- Geometrische Musteranalyse als schnellere Alternative zu "jeden möglichen
  Zug tatsächlich simulieren"
- Wie Kettenreaktionen "kostenlos" aus einer wiederholten Prüfschleife im
  Game-Loop entstehen, ganz ohne eigene Rekursion dafür

## Dateien

```
chapter-08-matchthree/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-Styles
├── game.js           MatchThreeGame-Klasse + Mini-PointBurst
└── README.md          diese Datei
```
