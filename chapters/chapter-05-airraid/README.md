# Chapter 05 · Air Raid

> Original: `A3GPU205_AirRaid` (AirRaid.as, AAGun.as, Airplane.as, Bullet.as)
> Live-Demo: [`chapters/chapter-05-airraid/`](./index.html) auf GitHub Pages

## Worum es geht

Das erste vollständige Spiel im Buch: Eine Flak-Kanone am unteren Bildrand schießt
auf Flugzeuge, die zufällig von links oder rechts hereinfliegen. 20 Schuss, Ziel:
möglichst viele Treffer.

## Architektur (1:1 vom Original übernommen)

| Klasse       | Aufgabe                                                   |
|--------------|-------------------------------------------------------------|
| `AirRaidGame`| Spielzustand, Spawner, Kollisionsprüfung, HUD, Game-Over-Logik (entspricht `AirRaid.as`) |
| `AAGun`      | Spielerfigur: Position, Bewegung per Pfeiltasten            |
| `Airplane`   | Gegner: Startseite/Höhe/Geschwindigkeit zufällig, Explosion bei Treffer |
| `Bullet`     | Projektil: bewegt sich nach oben, verschwindet am oberen Rand oder bei Treffer |

## Was ich übersetzt habe

| ActionScript 3                                   | HTML5 / JavaScript                                  |
|----------------------------------------------------|--------------------------------------------------------|
| `Event.ENTER_FRAME` + `getTimer()`                  | `requestAnimationFrame` + Zeitdifferenz zwischen Frames |
| `hitTestObject()`                                   | eigene AABB-Rechteck-Kollision (`rectsHit()`)           |
| `flash.utils.Timer` für den nächsten Flugzeug-Spawn | `performance.now()`-Zeitstempel, im Game-Loop geprüft   |
| Bibliothekssymbole (Kanone/Flugzeug/Kugel in der FLA)| Formen direkt mit der Canvas-2D-API gezeichnet          |
| `stage.addEventListener(KeyboardEvent...)`          | `window.addEventListener('keydown'/'keyup', ...)`       |
| `gotoAndStop("gameover")`                           | einfache `state`-Maschine (`intro` / `playing` / `gameover`) + DOM-Overlay |

Fünf Flugzeug-Varianten gab es im Original als fünf Bibliothekssymbole
(`gotoAndStop(Math.floor(Math.random()*5+1))`). Hier sind es fünf Farbvarianten
derselben gezeichneten Silhouette — funktional identisch (zufällige Optik pro
Flugzeug), nur ohne Symbolbibliothek.

## Was man hier lernt

- Wie man ein Spiel in unabhängige, klar verantwortliche Klassen aufteilt
- Zeitbasierte statt frame-basierte Bewegung (wichtig für gleichbleibendes Tempo
  unabhängig von der Bildwiederholrate)
- Eine eigene Kollisionserkennung, die man ab hier im ganzen Buch wiederverwendet
- Objektlisten verwalten (spawnen, updaten, sicher wieder entfernen)
- Tastatur-Zustandsverfolgung (gedrückt/losgelassen) statt Einzelereignisse

## Dateien

```
chapter-05-airraid/
├── index.html     Lernseite (Erklärung + spielbare Demo)
├── chapter.css     HUD- und Overlay-Styles
├── game.js         AAGun/Airplane/Bullet/AirRaidGame-Klassen
└── README.md        diese Datei
```

## Steuerung

`←` / `→` bewegen die Kanone, `Leertaste` feuert. 20 Schuss ohne Nachladen — wie im Original.
