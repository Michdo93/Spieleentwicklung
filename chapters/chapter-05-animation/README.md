# Chapter 05b · Animation

> Original: `A3GPU205_Animation` (`AnimatedObject.as`, `AnimationTest.as`)
> Live-Demo: [`chapters/chapter-05-animation/`](./index.html) auf GitHub Pages

## Worum es geht

Das denkbar einfachste Bewegungsbeispiel: 50 Objekte, jedes mit eigener
konstanter Geschwindigkeit, bewegen sich zeitbasiert über die Bühne.

## Was ich übersetzt habe

| ActionScript 3                                  | HTML5 / JavaScript                        |
|--------------------------------------------------------|------------------------------------------------|
| `getTimer()`-Differenz in Millisekunden, `/1000` am Ende  | `dt` wird direkt in Sekunden berechnet, kein `/1000` nötig |
| jedes `AnimatedObject` mit eigenem `ENTER_FRAME`-Listener | ein gemeinsamer Game-Loop, jedes Objekt hat eine eigene `update(dt)`-Methode |
| Objekte verschwinden von der Bühne, sobald sie den sichtbaren Bereich verlassen | Ergänzung: Objekte tauchen am gegenüberliegenden Rand wieder auf |

## Was man hier lernt

- Das Grundmuster "Objekt kennt seine eigene Geschwindigkeit, aktualisiert
  sich selbst" — taucht im ganzen restlichen Buch wieder auf
- Der einzige praktische Unterschied bei der Zeitmessung: AS3 rechnet in
  Millisekunden und teilt am Ende durch 1000, der JS-Game-Loop rechnet
  gleich in Sekunden

## Dateien

```
chapter-05-animation/
├── index.html      Lernseite (Erklärung + Demo)
├── chapter.css       minimal
├── game.js           AnimatedObject-Klasse
└── README.md          diese Datei
```
