/**
 * Chapter 04 · Deduction
 * Portierung von A3GPU204_Deduction/Deduction.as — ein Mastermind-Klon.
 *
 * Peg-Grafiken gab es im Original als Bibliothekssymbol mit einem Frame
 * pro Farbe (+ ein leerer Frame). Hier gezeichnet als einfache Kreise.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const messageEl = document.getElementById("message");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

/* Konstanten — 1:1 aus Deduction.as */
const numPegs = 5;
const numColors = 5;
const maxTries = 10;
const horizOffset = 30;
const vertOffset = 30;
const pegSpacing = 40;
const rowSpacing = 38;
const pegRadius = 14;

const PEG_COLORS = ["#3a4657", "#ff6b6b", "#ffb84d", "#5fe0c9", "#a78bfa", "#7cd992"]; // Index 0 = leer

class DeductionGame {
  constructor() {
    canvas.addEventListener("click", e => this.handleClick(e));
  }

  startGame() {
    this.solution = [];
    for (let i = 0; i < numPegs; i++) this.solution.push(Math.floor(Math.random() * numColors) + 1);

    this.turnNum = 0;
    this.rows = [];       // abgeschlossene Reihen: { colors: [], correctSpot, correctColor }
    this.finished = false;
    overlay.style.display = "none";
    this.newRow();
    this.render();
    messageEl.textContent = "Klicke auf die Punkte, um Farben zu setzen, dann auf DONE.";
  }

  newRow() {
    this.currentRow = new Array(numPegs).fill(0); // 0 = leer
  }

  handleClick(e) {
    if (this.finished) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;

    const y = this.turnNum * rowSpacing + vertOffset;

    // Klick auf einen Peg?
    for (let i = 0; i < numPegs; i++) {
      const px = i * pegSpacing + horizOffset;
      if (Math.hypot(mx - px, my - y) < pegRadius) {
        this.currentRow[i] = (this.currentRow[i] + 1) % (numColors + 1);
        this.render();
        return;
      }
    }

    // Klick auf DONE-Button?
    const btnX = numPegs * pegSpacing + horizOffset + 6;
    const btnW = 64, btnH = 26;
    if (mx >= btnX && mx <= btnX + btnW && my >= y - btnH / 2 && my <= y + btnH / 2) {
      this.clickDone();
    }
  }

  clickDone() {
    let correctSpot = 0, correctColor = 0;
    const solutionColorList = new Array(numColors).fill(0);
    const currentColorList = new Array(numColors).fill(0);

    for (let i = 0; i < numPegs; i++) {
      if (this.currentRow[i] === this.solution[i]) {
        correctSpot++;
      } else {
        if (this.solution[i] > 0) solutionColorList[this.solution[i] - 1]++;
        if (this.currentRow[i] > 0) currentColorList[this.currentRow[i] - 1]++;
      }
    }
    for (let i = 0; i < numColors; i++) correctColor += Math.min(solutionColorList[i], currentColorList[i]);

    this.rows.push({ colors: [...this.currentRow], correctSpot, correctColor });
    this.turnNum++;

    if (correctSpot === numPegs) {
      this.finished = true;
      messageEl.textContent = "Du hast die Lösung gefunden!";
      this.render();
      this.endGame(true);
    } else if (this.turnNum === maxTries) {
      this.finished = true;
      messageEl.textContent = "Keine Versuche mehr übrig.";
      this.render();
      this.endGame(false);
    } else {
      this.newRow();
      this.render();
      messageEl.textContent = `Treffer: ${correctSpot} richtig platziert, ${correctColor} richtige Farbe (falsche Stelle).`;
    }
  }

  endGame(won) {
    overlayText.textContent = won
      ? `Gelöst in ${this.turnNum} von ${maxTries} Versuchen!`
      : `Nicht geschafft — die Lösung war: ${this.solution.map(c => "●").join(" ")}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  drawPeg(x, y, colorIndex, filled = true) {
    ctx.beginPath();
    ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
    if (filled) {
      ctx.fillStyle = PEG_COLORS[colorIndex];
      ctx.fill();
    }
    ctx.strokeStyle = "#263041";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  render() {
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, W, H);

    // abgeschlossene Reihen
    this.rows.forEach((row, rowIdx) => {
      const y = rowIdx * rowSpacing + vertOffset;
      row.colors.forEach((c, i) => this.drawPeg(i * pegSpacing + horizOffset, y, c));
      this.drawResultBadge(row, y);
    });

    // aktuelle Reihe (falls Spiel nicht beendet)
    if (!this.finished) {
      const y = this.turnNum * rowSpacing + vertOffset;
      this.currentRow.forEach((c, i) => this.drawPeg(i * pegSpacing + horizOffset, y, c, c > 0));

      // DONE-Button
      const btnX = numPegs * pegSpacing + horizOffset + 6;
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath();
      ctx.roundRect(btnX, y - 13, 64, 26, 5);
      ctx.fill();
      ctx.fillStyle = "#14100a";
      ctx.font = "bold 12px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DONE", btnX + 32, y + 1);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
  }

  drawResultBadge(row, y) {
    const x = numPegs * pegSpacing + horizOffset + 80;
    ctx.font = "11px 'JetBrains Mono'";
    ctx.fillStyle = "#8fa0b3";
    ctx.fillText(`● ${row.correctSpot}  ○ ${row.correctColor}`, x, y + 4);
  }
}

const game = new DeductionGame();
startBtn.addEventListener("click", () => game.startGame());

ctx.fillStyle = "#05070a";
ctx.fillRect(0, 0, W, H);
