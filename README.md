# AS3 → HTML5 Game Dev Lab

Dieses Repo portiert das Lernmaterial von **„ActionScript 3.0 Game Programming
University“** (Flash + AS3) Kapitel für Kapitel nach **HTML5 Canvas +
Vanilla JavaScript** — lauffähig direkt im Browser, ganz ohne Flash Player,
ohne Build-Schritt, gehostet über GitHub Pages.

**Ziel:** ein Repo, mit dem man sich Spieleentwicklung von Grund auf
Stück für Stück beibringen kann — und nebenbei sieht, wie sich dieselben
Konzepte (Bewegung, Kollision, Zustände, Ein-/Ausgabe) von einer
2011er-Flash-Codebasis auf moderne Web-Technik übertragen.

▶ **[Alle Kapitel ansehen](./index.html)**

## Wie das Repo aufgebaut ist

```
/
├── index.html                     Übersichtsseite, verlinkt alle Kapitel
├── assets/
│   ├── css/site.css                gemeinsames Stylesheet für die ganze Seite
│   └── js/chapters-data.js         Kapitel-Register (Titel, Status, Beschreibung)
└── chapters/
    ├── chapter-01-helloworld/
    │   ├── index.html               Lernseite: Erklärung + eingebettete Demo
    │   ├── chapter.css              kapitelspezifisches Styling
    │   ├── game.js                  die eigentliche Portierung
    │   └── README.md                dieselbe Erklärung als Markdown (für GitHub)
    ├── chapter-05-airraid/
    │   └── ... (gleiche Struktur)
    └── ...
```

Jedes Kapitel ist **eigenständig lauffähig** (kein gemeinsamer Build, keine
Abhängigkeiten zwischen Kapiteln) und bringt zwei parallele Erklärungs-Ebenen mit:

- **`README.md`** — für GitHub selbst, wenn man in den Ordner klickt
- **`index.html`** — dieselbe Erklärung eingebettet in die Lernseite auf
  GitHub Pages, direkt neben dem lauffähigen Spiel und AS3-vs-JS-Codevergleichen

## Nummerierung: A3GPUxyz → Chapter

Im Originalmaterial sah jeder Ordner aus wie `A3GPU205_AirRaid`. Die führende
`2` war ein Auflagen-/Serienpräfix des Buchs, die beiden Ziffern danach sind
die tatsächliche Buchkapitelnummer. Deshalb zählen wir hier **Chapter 01–15**
statt `A3GPU2xx`, und mehrere Projekte desselben Buchkapitels
(z. B. drei Spiele in Kapitel 05) laufen unter derselben Kapitelnummer mit
eigenem Slug (`chapter-05-airraid`, `chapter-05-animation`, `chapter-05-paddleball`).
Der exakte Original-Ordnername steht trotzdem in jeder `README.md`.

## Status

| # | Kapitel | Status |
|---|---------|--------|
| 01 | Hello World | ✅ portiert |
| 02 | Game Elements | ✅ portiert |
| 03 | Matching Game | ✅ portiert |
| 04 | Deduction / Memory Game | ✅ portiert |
| 05 | Air Raid | ✅ portiert |
| 05 | Animation / Paddle Ball | ⏳ geplant |
| 06 | Bitmap / Jigsaw / Sliding Puzzle | ✅ portiert |
| 07 | Air Raid 2 / Balloon Pop / Rotation Math / Space Rocks | ✅ portiert |
| 08 | Collapsing Blocks / Match Three / Point Burst | ✅ portiert |
| 09 | Hangman / Text Examples / Word Search | ⏳ geplant |
| 10 | Trivia (3×) / XML Examples | ⏳ geplant |
| 11 | Platform Game | ⏳ geplant |
| 12 | Racing Game / Top-Down Game | ⏳ geplant |
| 13 | Blackjack / Higher or Lower / Video Poker | ⏳ geplant |
| 14 | 3D-Demos / Dungeon 3D / Racing 3D / Target Practice | ⏳ geplant |
| 15 | Apps | ⏳ geplant |

Der aktuelle Stand steht auch live oben auf der [Übersichtsseite](./index.html)
(Fortschrittsbalken, automatisch aus `assets/js/chapters-data.js` berechnet).

## Portierungsprinzipien

- **Kein Build-Schritt.** Reines HTML/CSS/JS, damit GitHub Pages es ohne
  Pipeline direkt ausliefern kann.
- **Grafik:** Wo das Original mit `graphics.beginFill()/drawRect()` & Co.
  direkt im Code zeichnet, übertragen wir das 1:1 auf die Canvas-2D-API.
  Wo echte Bilddateien verwendet wurden (z. B. Jigsaw-/Sliding-Puzzle),
  übernehmen wir die Originalbilder aus dem Buchmaterial.
- **Struktur bleibt erkennbar.** Klassenaufteilung und Methodennamen aus dem
  AS3-Original werden möglichst beibehalten, damit der Codevergleich lehrreich
  bleibt statt nur "irgendwie dasselbe Spiel".
- **Zeitbasierte Bewegung.** `ENTER_FRAME` + `getTimer()` → `requestAnimationFrame`
  + Delta-Zeit, in jedem Kapitel konsistent.

## Lokal ansehen

Kein Server nötig — `index.html` einfach im Browser öffnen, oder für sauberes
Verhalten bei `fetch()`-basierten späteren Kapiteln:

```bash
python3 -m http.server 8000
# dann: http://localhost:8000
```

## Quelle

Original-Lernmaterial: *ActionScript 3.0 Game Programming University*
(Flash/AS3, 2011). Diese Portierung ersetzt Flash vollständig durch
HTML5 Canvas + Vanilla JS.
