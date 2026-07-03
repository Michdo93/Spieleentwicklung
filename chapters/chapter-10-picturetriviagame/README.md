# Chapter 10d · Picture Trivia Game

> Original: `A3GPU210_PictureTriviaGame` (`PictureTriviaGame.as`, `trivia3.xml`, `triviaimages/*.swf`)
> Live-Demo: [`chapters/chapter-10-picturetriviagame/`](./index.html) auf GitHub Pages

## Worum es geht

Ein Quiz, bei dem Frage *oder* Antworten wahlweise Text oder ein Bild sein
können, gesteuert über ein `type`-Attribut pro Eintrag.

## Bilder: hier musste wirklich neu gezeichnet werden

Die Original-Bilder (`equilateral.swf`, `right.swf`, `isosceles.swf`,
`scalene.swf`, `italy.swf`) lagen als kompilierte Flash-Movies vor — anders
als bei den JPG-Dateien in Kapitel 06 gab es hier keine extrahierbare
Originalgrafik. Ersetzt durch fünf selbst gezeichnete Inline-SVGs:

- vier klar unterscheidbare Dreiecksarten (gleichseitig, rechtwinklig,
  gleichschenklig, ungleichseitig)
- eine stark vereinfachte, stilisierte Umriss-Silhouette Italiens
  (ausdrücklich nicht geografisch exakt, nur als Wiedererkennungshilfe gedacht)

## Was ich übersetzt habe

| ActionScript 3                                          | HTML5 / JavaScript                                  |
|------------------------------------------------------------------|-------------------------------------------------------------|
| `question.@type == "text"` vs. `"file"`                            | `item.question.type === "text"` vs. `"image"`                 |
| `Loader` + `URLRequest("triviaimages/"+question)`                    | Inline-SVG aus einer `IMAGES`-Lookup-Tabelle                   |
| `shuffleAnswers()` mit gemischten `{type, value}`-Objekten            | identisch übernommen                                          |
| Fragedaten aus `trivia3.xml`                                          | direkt als JS-Array (`QUESTIONS`) — keine externe Datei nötig, daher **kein lokaler Server erforderlich** |

## Was man hier lernt

- Wie man gemischte Inhaltstypen (Text vs. Bild) über ein einheitliches
  Datenmodell abbildet, statt für jeden Fall separaten Code zu schreiben
- Dass nicht jede Original-Ressource übernehmbar ist — bei verlorenen oder
  technisch unzugänglichen Assets (hier: kompilierte SWFs) ist Neuzeichnen
  die einzige Option, und wo möglich als klar erkennbare, funktional
  gleichwertige Vektorgrafik

## Dateien

```
chapter-10-picturetriviagame/
├── index.html      Lernseite (Erklärung + spielbares Quiz)
├── chapter.css       Quiz-Karten- + Bild-Grid-Styles
├── game.js           Spiellogik + selbst gezeichnete SVG-Ersatzbilder
└── README.md          diese Datei
```
