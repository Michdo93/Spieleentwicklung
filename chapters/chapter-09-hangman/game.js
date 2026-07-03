/**
 * Chapter 09 · Hangman
 * Portierung von A3GPU209_Hangman/Hangman.as
 *
 * Die Kernidee ist verblüffend simpel: der "shown"-String startet als
 * Unterstriche und wird bei jedem Treffer Zeichen für Zeichen ersetzt.
 * Die Galgen-Zeichnung gab es im Original als Bibliothekssymbol mit einem
 * Frame pro Fehlversuch — hier als Canvas-Zeichnung in Stufen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const phraseEl = document.getElementById("phrase-display");
const wrongEl = document.getElementById("wrong-letters");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const phrase = "Imagination is more important than knowledge.";
const maxWrong = 8;

function drawGallows(numWrong) {
  ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#8fa0b3";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  // Basis-Galgen ist immer sichtbar
  ctx.beginPath();
  ctx.moveTo(20, H - 20); ctx.lineTo(120, H - 20);   // Boden
  ctx.moveTo(50, H - 20); ctx.lineTo(50, 20);           // Pfosten
  ctx.moveTo(50, 20); ctx.lineTo(140, 20);              // Balken
  ctx.moveTo(140, 20); ctx.lineTo(140, 45);             // Seil
  ctx.stroke();

  // Strichmännchen-Teile, ein Teil pro Fehlversuch
  ctx.strokeStyle = "#ff6b6b";
  const parts = [
    () => { ctx.beginPath(); ctx.arc(140, 62, 17, 0, Math.PI * 2); ctx.stroke(); },        // Kopf
    () => { ctx.beginPath(); ctx.moveTo(140, 79); ctx.lineTo(140, 125); ctx.stroke(); },    // Rumpf
    () => { ctx.beginPath(); ctx.moveTo(140, 90); ctx.lineTo(115, 110); ctx.stroke(); },    // Arm links
    () => { ctx.beginPath(); ctx.moveTo(140, 90); ctx.lineTo(165, 110); ctx.stroke(); },    // Arm rechts
    () => { ctx.beginPath(); ctx.moveTo(140, 125); ctx.lineTo(118, 160); ctx.stroke(); },   // Bein links
    () => { ctx.beginPath(); ctx.moveTo(140, 125); ctx.lineTo(162, 160); ctx.stroke(); },   // Bein rechts
    () => { ctx.beginPath(); ctx.moveTo(132, 58); ctx.lineTo(136, 62); ctx.moveTo(136, 58); ctx.lineTo(132, 62); ctx.moveTo(144, 58); ctx.lineTo(148, 62); ctx.moveTo(148, 58); ctx.lineTo(144, 62); ctx.stroke(); }, // X-Augen
    () => { ctx.beginPath(); ctx.arc(140, 70, 6, 0, Math.PI, false); ctx.stroke(); },       // trauriger Mund
  ];
  for (let i = 0; i < Math.min(numWrong, parts.length); i++) parts[i]();
}

class HangmanGame {
  constructor() {
    window.addEventListener("keyup", e => this.pressKey(e));
  }
  start() {
    this.shown = phrase.replace(/[A-Za-z]/g, "_");
    this.numWrong = 0;
    this.wrongLetters = [];
    this.state = "playing";
    overlay.style.display = "none";
    this.render();
  }
  pressKey(e) {
    if (this.state !== "playing") return;
    const charPressed = e.key.toLowerCase();
    if (!/^[a-z]$/.test(charPressed)) return;
    if (this.wrongLetters.includes(charPressed)) return;

    let foundLetter = false;
    let newShown = this.shown;
    for (let i = 0; i < phrase.length; i++) {
      if (phrase.charAt(i).toLowerCase() === charPressed) {
        newShown = newShown.substr(0, i) + phrase.substr(i, 1) + newShown.substr(i + 1);
        foundLetter = true;
      }
    }
    this.shown = newShown;

    if (!foundLetter) {
      this.numWrong++;
      this.wrongLetters.push(charPressed);
      if (this.numWrong >= maxWrong) { this.state = "lost"; }
    } else if (!this.shown.includes("_")) {
      this.state = "won";
    }
    this.render();
    if (this.state === "won") this.endGame(true);
    else if (this.state === "lost") this.endGame(false);
  }
  endGame(won) {
    overlayText.textContent = won
      ? `Geschafft! Fehlversuche: ${this.numWrong} / ${maxWrong}`
      : `Verloren — der Satz war: "${phrase}"`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }
  render() {
    drawGallows(this.numWrong);
    phraseEl.textContent = this.shown;
    wrongEl.textContent = this.wrongLetters.length
      ? `Falsch: ${this.wrongLetters.join(", ").toUpperCase()}`
      : "";
  }
}

const game = new HangmanGame();
startBtn.addEventListener("click", () => game.start());
drawGallows(0);
