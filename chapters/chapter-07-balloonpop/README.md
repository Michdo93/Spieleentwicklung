# Chapter 07c · Balloon Pop

> Original: `A3GPU207_BalloonPop` (`BalloonPop.as`)
> Live-Demo: [`chapters/chapter-07-balloonpop/`](./index.html) auf GitHub Pages

## Worum es geht

Eine drehbare Kanone abfeuern; die Kugel fliegt nicht geradeaus, sondern folgt
einer Parabelbahn durch Schwerkraft. Drei Level mit wachsender Ballonzahl.

## Was ich übersetzt habe

| ActionScript 3                                         | HTML5 / JavaScript                                    |
|--------------------------------------------------------------|---------------------------------------------------------------|
| `cannonballDY += gravity;` (fester Betrag pro Frame)            | `ball.dy += GRAVITY * dt;` (zeitbasiert, bildratenunabhängig)   |
| Ballons als vorplatzierte Timeline-Objekte pro Level             | pro Level generiertes Koordinaten-Array (`layoutForLevel()`)     |
| `getChildAt()` + `is Balloon` zum Einsammeln                     | entfällt — Ballons werden direkt als Objekte verwaltet           |
| `gotoAndPlay("explode")`                                         | kurze Skalier-/Fade-Animation (`popping`/`popT`)                 |

## Was man hier lernt

- Den Unterschied zwischen frame-basierter und zeitbasierter Physik ganz
  konkret an einem Beispiel, bei dem es sichtbar wird: falsch skalierte
  Schwerkraft sieht bei anderer Bildrate spürbar anders aus
- Wie man eine im Original per Editor gebaute Content-Platzierung (Ballons
  auf der Zeitleiste) durch ein einfaches datengetriebenes Layout ersetzt,
  ohne die Spiellogik selbst zu verändern
- Levelfortschritt als einfache Zustandsmaschine (`playing` → `levelover` →
  nächstes Level → … → `gameover`)

## Dateien

```
chapter-07-balloonpop/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       HUD-/Overlay-Styles
├── game.js           Balloon- und BalloonPopGame-Klassen, Level-Layouts
└── README.md          diese Datei
```
