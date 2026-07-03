# Chapter 10a · XML Examples

> Original: `A3GPU210_XMLExamples` (`xmlimport.as`, `xmltestdata.xml`)
> Live-Demo: [`chapters/chapter-10-xmlexamples/`](./index.html) auf GitHub Pages

## Worum es geht

Der Grundbaustein für alle drei Trivia-Spiele in diesem Kapitel: externe
Frage-Daten laden. AS3 nutzt dafür `URLLoader` + `XML`, im Web ist
`fetch()` + JSON die naheliegende Wahl.

## Was ich übersetzt habe

| ActionScript 3                                       | HTML5 / JavaScript                          |
|--------------------------------------------------------------|----------------------------------------------------|
| `URLLoader` + `URLRequest` + `Event.COMPLETE`                   | `fetch()` (Promise-basiert, mit `async`/`await`)      |
| `XML(event.target.data)`                                        | `await response.json()`                              |
| `IOErrorEvent.IO_ERROR`                                          | `try`/`catch` um den `fetch()`-Aufruf                 |
| `xmldata.item.answers.answer[1]`                                  | `data[0].answers[1]`                                 |
| `xmltestdata.xml`                                                  | `xmltestdata.json` — inhaltlich unverändert, nur Formatkonvertierung |

## ⚠️ Browser-Eigenheit: fetch() und `file://`

Ab diesem Kapitel brauchen die Demos einen lokalen Webserver, weil
`fetch()` bei direkt geöffneten `file://`-Seiten in Chrome/Edge von der
CORS-Sperre blockiert wird (die Canvas-Kapitel davor kamen ohne Server aus,
weil `new Image()` das nicht betrifft). Lokal reicht:

```bash
python3 -m http.server 8000
# dann: http://localhost:8000
```

Auf GitHub Pages ist das kein Thema, da dort alles über `https://`
ausgeliefert wird.

## Was man hier lernt

- `fetch()` als natürlicher Ersatz für `URLLoader`, mit sauberem
  `async`/`await`-Fehlerhandling statt zweier separater Event-Listener
- Warum JSON im Browser die deutlich natürlichere Datenstruktur ist als XML
  (kein Parsing-Umweg über `XMLList`-Zugriffe)
- Die CORS-Einschränkung bei lokalen Dateien als praktische Web-Eigenheit,
  die in der Flash-Welt keine Entsprechung hatte

## Dateien

```
chapter-10-xmlexamples/
├── index.html      Lernseite (Erklärung + Live-Demo)
├── chapter.css       Ausgabe-Panel-Styles
├── game.js           fetch()-Demo
├── assets/
│   └── xmltestdata.json  aus xmltestdata.xml konvertiert, Inhalt unverändert
└── README.md          diese Datei
```
