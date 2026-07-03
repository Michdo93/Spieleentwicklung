# Chapter 14c · Racing 3D

> Original: `A3GPU214_Racing3D` (`Racing3D.as`)
> Live-Demo: [`chapters/chapter-14-racing3d/`](./index.html) auf GitHub Pages

## Worum es geht

Dieselbe Ringstrecke wie [Chapter 12a](../chapter-12-racinggame/), diesmal
aus der Ich-Perspektive gerendert. Ein freies Fahr-Techdemo ohne
Rundenzähler oder festes Ziel — genau wie im Original.

## Was ich übersetzt habe

| ActionScript 3                                          | HTML5 / JavaScript                                    |
|------------------------------------------------------------------|---------------------------------------------------------------|
| `viewSprite`/`worldSprite`, automatische 3D-Projektion              | `project(x,y,z,camera)` aus Chapter 14a                          |
| `ground.road.hitTestPoint()`                                        | `surfaceAt(x,z)` — reine Punkt-in-abgerundetes-Rechteck-Mathematik, dieselbe Streckenform wie in Chapter 12a |
| `zSort()` für Bäume/Auto                                             | Sortierung nach berechneter Kamera-Tiefe                       |
| Beschleunigung/Lenkung/Geländeabzug                                  | funktional identisch, auf eigene Zeiteinheiten umskaliert       |

## Der Clou: eine Funktion für Physik UND Darstellung

`surfaceAt()` entscheidet sowohl, ob das Auto abseits der Straße langsamer
wird, als auch, welche Farbe eine Bodenkachel beim Zeichnen bekommt. Keine
doppelte Straßen-Definition, die auseinanderlaufen könnte — Physik und
Optik greifen auf exakt dieselbe Wahrheit zu.

## Was man hier lernt

- Denselben geometrischen Test (Chapter 12a) in einem neuen Rendering-
  Kontext wiederzuverwenden, statt ihn für die Ich-Perspektive neu zu
  erfinden
- Boden-Rendering als live generiertes Kachelraster um die Kamera statt
  eines vorgezeichneten Bildes
- Dass nicht jede Portierung ein "Spiel mit Ziel" sein muss — manche
  Kapitel im Originalbuch sind bewusst offene Techdemos

## Dateien

```
chapter-14-racing3d/
├── index.html      Lernseite (Erklärung + fahrbare Demo)
├── chapter.css       minimal
├── game.js           Racing3D-Klasse, Projektion, Streckenmathematik
└── README.md          diese Datei
```

## Steuerung

`↑` Gas, `←`/`→` lenken.
