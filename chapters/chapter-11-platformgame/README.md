# Chapter 11 · Platform Game

> Original: `A3GPU211_PlatformGame` (`PlatformGame.as`, `Floor.as`, `Wall.as`, `Treasure.as`, `Key.as`, `Door.as`, `Chest.as`, `Dialog.as`)
> Live-Demo: [`chapters/chapter-11-platformgame/`](./index.html) auf GitHub Pages

## Worum es geht

Das Jump-'n'-Run-Grundgerüst: Schwerkraft, Sprung, Kollision mit Boden und
Wänden, ein scrollendes Level, ein an Wänden umkehrender Gegner,
Schatz/Schlüssel/Tür/Truhe-Fortschritt, Leben und Game-Over-Dialoge.

## Was ich übersetzt habe

| ActionScript 3                                              | HTML5 / JavaScript                                        |
|--------------------------------------------------------------------|--------------------------------------------------------------------|
| `moveCharacter()` — Schwerkraft, Sprung, zwei Kollisionsschleifen     | 1:1 identisch übernommen, inklusive aller Konstanten (`gravity=.004`, `jumpSpeed=.8`, `walkSpeed=.15`) |
| `examineLevel()` — Timeline nach `Floor`/`Wall`/Item-Symbolen durchsuchen | entfällt — Level wird direkt als Datenstruktur (`buildLevel()`) definiert |
| `scrollWithHero()`                                                    | 1:1 identisch übernommen (Kamera-Offset statt `gamelevel.x`)         |
| `hitTestObject()` für Gegner-/Item-Kollision                            | eigene AABB-Rechteck-Kollision (wie in Kapitel 05)                    |
| `Dialog`-Bibliothekssymbol mit Button                                   | HTML-Overlay (`<div id="dialog">`) mit echtem `<button>`               |
| Gegner-Umkehr per `hitWallLeft`/`hitWallRight` aus echter Wandkollision  | vereinfacht auf feste Patrouillegrenzen (`patrolLeft`/`patrolRight`) — die Bewegungsphysik selbst bleibt unverändert |

## Das Level: neu entworfen, gleiche Bausteine

Im Original lagen Boden-, Wand-, Schatz- und Türsymbole fertig auf der
Flash-Zeitleiste — das lässt sich nicht exportieren. Das Beispiellevel hier
verwendet dieselben Objektarten (`Floor`/`Wall` als Kollisionsgeometrie,
`Treasure`/`Key`/`Door`/`Chest` als Items) in einem selbst entworfenen
Kurz-Level: zwei Sprunghindernisse, eine erhöhte Schatzplattform, ein
patrouillierender Gegner, ein Schlüssel, der eine Tür öffnet, hinter der
eine Schatztruhe das Spiel gewinnt.

## Was man hier lernt

- Eine komplette, wiederverwendbare 2D-Plattform-Physik in einer einzigen
  Funktion, die für beliebig viele Charaktere (Held, mehrere Gegnertypen)
  gleichermaßen funktioniert
- Die Reihenfolge "erst vertikal (landen), dann horizontal (anstoßen)
  kollidieren" als wichtiges Detail, um Hängenbleiben beim Landen zu
  vermeiden
- Kamera-Scrolling mit weichem Korridor statt starrem Mittig-Zentrieren
- Wie sich ein Level, das im Original nur als visuelle Editor-Platzierung
  existierte, als einfache Datenstruktur neu modellieren lässt, ohne die
  eigentliche Spiellogik zu verändern

## Dateien

```
chapter-11-platformgame/
├── index.html      Lernseite (Erklärung + spielbare Demo)
├── chapter.css       Overlay-/Dialog-Styles
├── game.js           PlatformGame-Klasse, Levelaufbau, Physik
└── README.md          diese Datei
```

## Steuerung

`←` / `→` laufen, `Leertaste` springt. Von oben auf einen Gegner springen
besiegt ihn, seitliche Berührung kostet ein Leben. Schlüssel vor der Tür
einsammeln.
