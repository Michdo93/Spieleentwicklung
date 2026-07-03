# Chapter 08a · Point Burst

> Original: `A3GPU208_PointBurst` (`PointBurst.as`, `PointBurstExample.as`)
> Live-Demo: [`chapters/chapter-08-pointburst/`](./index.html) auf GitHub Pages

## Worum es geht

Eine kleine, wiederverwendbare UI-Komponente: eine Punktezahl an einer
Position einblenden, während sie größer wird und ausblendet — der klassische
"+50"-Effekt aus vielen Puzzlespielen.

## Was ich übersetzt habe

| ActionScript 3                                  | HTML5 / JavaScript                              |
|------------------------------------------------------|------------------------------------------------------|
| `Timer(animStepTime, animSteps)` + zwei Event-Handler   | ein Objekt mit `update(now)`, zeitbasierter Fortschritt |
| `TIMER_COMPLETE` → `removeBurst()`                       | `done`-Flag, das der Aufrufer aus seiner Liste filtert  |
| `new PointBurst(this, pts, x, y)`                         | `new PointBurst(pts, x, y)` — identischer Aufrufstil     |

## Was man hier lernt

- Eine Komponente, die sich selbst animiert **und** selbst wieder entfernt,
  ohne dass der Aufrufer Aufräumcode schreiben muss
- Das Muster "Liste von Effekt-Objekten, jedes mit `update()`/`draw()`, am
  Ende der Liste entfernen, was `done` ist" — taucht ab hier regelmäßig
  wieder auf (Explosionen, Partikel, …)

## Dateien

```
chapter-08-pointburst/
├── index.html      Lernseite (Erklärung + interaktive Demo)
├── chapter.css       minimal
├── game.js           PointBurst-Klasse
└── README.md          diese Datei
```
