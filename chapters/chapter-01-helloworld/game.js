/**
 * Chapter 01 · Hello World
 * Portierung von A3GPU201_HelloWorld (HelloWorld1–3, DebugExample, TooEarlyExample)
 *
 * In Flash gab es dafür ein separates "Ausgabe"-Fenster für trace().
 * Wir bauen uns dasselbe hier als kleines DOM-Panel neben dem Canvas nach,
 * damit der Vergleich zum Buch möglichst 1:1 bleibt.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const outputEl = document.getElementById("output");
const buttons = document.querySelectorAll("[data-demo]");

function clearStage() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearOutput() {
  outputEl.textContent = "";
}

// entspricht trace() in AS3 -> schreibt sowohl ins Panel als auch in die
// echte Browser-Konsole, damit man F12 parallel öffnen kann
function trace(...args) {
  console.log(...args);
  outputEl.textContent += args.join(" ") + "\n";
  outputEl.scrollTop = outputEl.scrollHeight;
}

function drawText(text, x, y, opts = {}) {
  ctx.fillStyle = opts.color || "#e8edf3";
  ctx.font = `${opts.size || 16}px "JetBrains Mono", monospace`;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

/* ---------- Demo 1: HelloWorld1 – nur trace() ---------- */
function demoHelloWorld1() {
  clearStage();
  clearOutput();
  drawText("(nichts auf der Bühne — nur Konsolenausgabe)", 16, 130, { size: 13, color: "#5b6b7d" });
  trace("Hello World.");
}

/* ---------- Demo 2: HelloWorld3 – sichtbares Textfeld ---------- */
function demoHelloWorld3() {
  clearStage();
  clearOutput();
  drawText("Hello World!", 20, 20, { size: 24, color: "#ffb84d" });
  trace("Ein TextField wurde erzeugt und per addChild() zur Bühne hinzugefügt.");
}

/* ---------- Demo 3: DebugExample – Schleife mit Positionierung ---------- */
function demoDebug() {
  clearStage();
  clearOutput();
  let i = 0;
  const step = () => {
    if (i >= 10) return;
    drawText(String(i), 20, 14 + i * 22, { size: 14, color: "#5fe0c9" });
    trace("showNumber:", i);
    i++;
    setTimeout(step, 120);
  };
  step();
}

/* ---------- Demo 4: TooEarlyExample – Zugriff vor Initialisierung ---------- */
let tooEarlyStage = "before"; // before -> after

function demoTooEarly() {
  clearStage();
  clearOutput();
  tooEarlyStage = "before";
  renderTooEarly();
}

function renderTooEarly() {
  clearStage();
  drawText("Klassen-Konstruktor läuft SOFORT beim Anlegen des Objekts.", 16, 16, { size: 12.5, color: "#8fa0b3" });
  drawText("Das Kind-Objekt \"textFieldOne\" existiert auf der Timeline aber erst ab Frame 2.", 16, 36, { size: 12.5, color: "#8fa0b3" });

  if (tooEarlyStage === "before") {
    drawText('this.textFieldOne.text = "..."', 16, 90, { size: 15, color: "#ff6b6b" });
    drawText("→ TypeError: Cannot set properties of undefined", 16, 116, { size: 13, color: "#ff6b6b" });
    trace("Aufruf im Konstruktor: textFieldOne ist noch undefined.");
    trace('TypeError: Cannot set properties of undefined (reading "text")');
  } else {
    drawText('setSomeText() später (z.B. nach dem Laden) aufgerufen:', 16, 90, { size: 13, color: "#8fa0b3" });
    drawText('this.textFieldTwo.text = "This is text field two."', 16, 116, { size: 14, color: "#5fe0c9" });
    trace("Jetzt existiert das Objekt bereits im DOM/auf der Bühne → funktioniert.");
  }
}

document.getElementById("too-early-btn").addEventListener("click", () => {
  tooEarlyStage = tooEarlyStage === "before" ? "after" : "before";
  renderTooEarly();
  document.getElementById("too-early-btn").textContent =
    tooEarlyStage === "before" ? "Später erneut versuchen" : "Zurück zu \"zu früh\"";
});

/* ---------- Steuerung ---------- */
const demos = {
  hello1: demoHelloWorld1,
  hello3: demoHelloWorld3,
  debug: demoDebug,
  tooearly: demoTooEarly,
};

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("btn-active"));
    btn.classList.add("btn-active");
    demos[btn.dataset.demo]();
  });
});

// Start
demoHelloWorld1();
