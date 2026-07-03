# Chapter 02 · Game Elements

> Original: `A3GPU202_GameElements` (~28 einzelne FLA-Demos, reiner Timeline-Code)
> Live-Demo: [`chapters/chapter-02-game-elements/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Werkzeugkasten-Kapitel: kein zusammenhängendes Spiel, sondern viele kleine,
unabhängige Demos zu den Bausteinen, die praktisch jedes spätere Kapitel braucht.

## Original → Portierung (12 gebündelte Demos)

| # | Original-FLA(s) | Demo hier | Kernkonzept |
|---|------------------|-----------|--------------|
| 1 | DrawingShapes, DrawingText | Formen & Text | `graphics.*` → Canvas-2D-API |
| 2 | MouseInput | Maus | `mouseX`/`mouseY`, Klick-Events |
| 3 | KeyboardInput | Tastatur | `KeyboardEvent`, Tastenzustand |
| 4 | MovingSprites | Bewegen | Pfeiltasten-Bewegung pro Frame |
| 5 | DraggingSprites | Ziehen | Drag & Drop mit Klick-Offset |
| 6 | PhysicsBasedAnimation, TimeBasedAnimation | Physik & Zeit | zeitbasierte Bewegung, Schwerkraft |
| 7 | CollisionDetection | Kollision | `hitTestPoint`/`hitTestObject` → eigene Funktionen |
| 8 | SettingSpriteDepth | Tiefe/Z-Order | Zeichenreihenfolge steuern |
| 9 | UsingTimers, UsingTimers2 | Timer | `flash.utils.Timer` → `setInterval` |
| 10 | RandomNumbers, ShufflingAnArray | Zufall/Mischen | `Math.random()`, Fisher-Yates-Shuffle |
| 11 | PlayingSounds | Sound | Bibliotheks-Sound → Web-Audio-Ton, externe Datei → `Audio()` |
| 12 | TextInput | Texteingabe | AS3 Input-`TextField` → HTML `<input>` |

Bewusst ausgelassen (Flash/Browser-Sandbox-spezifisch, ohne sinnvolles Web-Äquivalent
oder redundant zu obigen Demos): `ExternalVariables` (FlashVars), `Security`
(Flash-Domain-Sandbox), `SystemData` (`Capabilities`-Klasse), `SavingLocalData`
(`SharedObject` — das Äquivalent `localStorage` kommt in einem späteren Kapitel,
wenn es inhaltlich gebraucht wird), `LoadingScreen` (`bytesLoaded/bytesTotal` einer
SWF — im Web gibt es kein vergleichbares Ladefortschritts-API für die Seite selbst),
`CreatingLinkedText`/`CustomCursor`/`MakingButtons`/`UsingMovieClips`/
`SpriteMovement`/`CreatingSpriteGroups` (Varianten/Kombinationen der zwölf
Kern-Demos ohne eigenständiges neues Konzept).

## Was man hier lernt

- Wie sich Flashs eingebaute Kollisionsmethoden als kurze eigene Funktionen
  nachbauen lassen (wichtig: das macht man **einmal**, dann wiederverwendbar)
- Der Unterschied zwischen `setInterval` (feste Zeitabstände) und
  `requestAnimationFrame` (an die Bildwiederholrate gekoppelt) — und wann man
  welches nimmt
- Dass "Zeichenreihenfolge" im Web reine Array-/DOM-Reihenfolge ist, es aber
  keine automatische Anzeigeliste wie in Flash gibt

## Dateien

```
chapter-02-game-elements/
├── index.html          Lernseite mit 12 Demo-Tabs
├── chapter.css          Tab-Leiste, Ausgabe-Panel, Formularelemente
├── game.js              alle 12 Demos als eigenständige Module
├── assets/
│   └── PlayingSounds.mp3   Original-Audiodatei aus dem Buchmaterial
└── README.md             diese Datei
```
