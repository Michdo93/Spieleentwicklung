# Chapter 10c · Trivia Game Deluxe

> Original: `A3GPU210_TriviaGameDeluxe` (`TriviaGameDeluxe.as`, `trivia2.xml`)
> Live-Demo: [`chapters/chapter-10-triviagamedeluxe/`](./index.html) auf GitHub Pages
> ⚠️ Braucht wie [Chapter 10a](../chapter-10-xmlexamples/) einen lokalen Server (`fetch()`).

## Worum es geht

Baut auf [Chapter 10b](../chapter-10-triviagame/) auf und fügt hinzu:

- zufällige Auswahl von 10 aus 42 Fragen pro Runde
- ein 25-Sekunden-Countdown pro Frage mit sinkenden Punkten (1000 → 0)
- einen Hinweis-Button, der 300 Punkte kostet
- ein kurzes Faktum nach jeder beantworteten Frage

## Was ich übersetzt habe

| ActionScript 3                                       | HTML5 / JavaScript                              |
|--------------------------------------------------------------|----------------------------------------------------|
| `selectQuestions()` — 10 aus dem Gesamtpool ziehen              | identischer "ziehen & entfernen"-Algorithmus          |
| `Timer(1000,25)` + `Clock`-Bibliotheksanimation                  | `setInterval(fn, 1000)` + CSS-`width`-Übergang als Fortschrittsleiste |
| `questionPoints -= 25` pro Tick                                    | identisch übernommen                                  |
| `pressedHintButton()` — Punktabzug, Hinweis anzeigen               | identisch übernommen                                  |
| `dataXML.item[questionNum].fact`                                    | `dataXML[questionNum].fact` — Faktum nach jeder Frage  |

## Was man hier lernt

- Wie sich ein einfaches Punktesystem um Zeitdruck erweitern lässt, ohne die
  Grundstruktur (Frage → Antwort → nächste Frage) verändern zu müssen
- `setInterval()` für "etwas alle N Millisekunden tun, bis eine Bedingung
  eintritt" als direktes Äquivalent zu AS3s `Timer`-Klasse
- Eine Zufallsauswahl aus einem größeren Datenpool statt eines linearen
  Durchlaufs aller Einträge

## Dateien

```
chapter-10-triviagamedeluxe/
├── index.html      Lernseite (Erklärung + spielbares Quiz)
├── chapter.css       Quiz-Karten- + Timer-/Hint-Styles
├── game.js           Spiellogik (DOM-basiert, Timer, Hint, Fact)
├── assets/
│   └── trivia2.json   aus trivia2.xml konvertiert (42 Fragen), Inhalt unverändert
└── README.md          diese Datei
```
