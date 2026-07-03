# Chapter 10b · Trivia Game

> Original: `A3GPU210_TriviaGame` (`TriviaGame.as`, `trivia1.xml`)
> Live-Demo: [`chapters/chapter-10-triviagame/`](./index.html) auf GitHub Pages
> ⚠️ Braucht wie [Chapter 10a](../chapter-10-xmlexamples/) einen lokalen Server (`fetch()`), siehe dortiges README.

## Worum es geht

Ein Multiple-Choice-Quiz aus 10 Fragen (Original-Fragedaten aus `trivia1.xml`,
1:1 nach `assets/trivia1.json` konvertiert). Antworten werden gemischt,
laufender Punktestand wird angezeigt.

## Warum DOM statt Canvas

Alle bisherigen Spiele in diesem Repo laufen über `<canvas>`. Ein Quiz ist im
Kern ein Formular — Text, Buttons, Listen. Dafür ist echtes HTML/CSS die
bessere Wahl: Textumbruch, Fokus-Reihenfolge und responsives Verhalten
"kommen geschenkt", ganz ohne selbst geschriebene Layout-Logik. AS3s
`createText()`-Hilfsfunktion (die für jedes Textfeld manuell Format,
Zeilenumbruch und Autosize setzt) entfällt komplett — das übernimmt CSS.

## Was ich übersetzt habe

| ActionScript 3                                       | HTML5 / JavaScript                            |
|--------------------------------------------------------------|------------------------------------------------------|
| `createText()` + `TextFormat` pro Feld                          | HTML-Elemente + CSS-Klassen                             |
| `Circle`-Bibliothekssymbol als Antwort-Button                    | `<button class="quiz-answer">` mit CSS-Styling           |
| `shuffleAnswers()`                                                | identischer Algorithmus, `XMLList`-Zugriffe → Array-Methoden |
| `finishQuestion()` — falsche Antworten ausblenden, richtige markieren | identisch übernommen (`display:none` / CSS-Klasse `correct`) |

## Was man hier lernt

- Wann Canvas die richtige Wahl ist (Bewegung, Kollision, freie Zeichnung)
  und wann natives HTML klar im Vorteil ist (Formulare, Textlisten, Quiz-UIs)
- Dass sich Spiellogik (Mischen, Punktestand, Zustandsübergänge) unabhängig
  vom Rendering-Ansatz identisch portieren lässt — nur die Darstellung ändert
  sich

## Dateien

```
chapter-10-triviagame/
├── index.html      Lernseite (Erklärung + spielbares Quiz)
├── chapter.css       Quiz-Karten-Styles
├── game.js           Spiellogik (DOM-basiert)
├── assets/
│   └── trivia1.json   aus trivia1.xml konvertiert, Inhalt unverändert
└── README.md          diese Datei
```
