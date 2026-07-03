/**
 * Chapter 09 · Word Search
 * Portierung von A3GPU209_WordSearch/WordSearch.as
 *
 * Der Platzierungsalgorithmus (placeLetters), die Auswahl-Validierung
 * (isValidRange: gleiche Reihe/Spalte/45°-Diagonale) und die
 * Wortprüfung (auch rückwärts gelesen) sind 1:1 aus dem Original
 * übernommen. Nur die Eingabe läuft über Canvas-Koordinaten statt über
 * einzelne Sprite-Objekte mit eigenen Mouse-Events.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const puzzleSize = 12;
const spacing = 28;
const offset = { x: 16, y: 16 };
const wordListX = puzzleSize * spacing + offset.x + 20;

const WORDS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

class WordSearchGame {
  constructor() {
    canvas.addEventListener("mousedown", e => this.onDown(e));
    canvas.addEventListener("mousemove", e => this.onMove(e));
    window.addEventListener("mouseup", () => this.onUp());
  }

  start() {
    this.usedWords = [];
    this.grid = this.placeLetters();
    this.foundOutlines = [];
    this.foundWords = new Set();
    this.dragMode = "none";
    this.startPoint = null;
    this.endPoint = null;
    overlay.style.display = "none";
    this.render();
  }

  // entspricht placeLetters() — 1:1 derselbe Platzierungsversuch-Algorithmus
  placeLetters() {
    const letters = Array.from({ length: puzzleSize }, () => new Array(puzzleSize).fill("*"));
    const wordListCopy = [...WORDS];
    this.usedWords = [];

    let repeatTimes = 2000;
    while (wordListCopy.length > 0 && repeatTimes-- > 0) {
      const wordNum = Math.floor(Math.random() * wordListCopy.length);
      const word = wordListCopy[wordNum].toUpperCase();
      const x0 = Math.floor(Math.random() * puzzleSize);
      const y0 = Math.floor(Math.random() * puzzleSize);
      const dx = Math.floor(Math.random() * 3) - 1;
      const dy = Math.floor(Math.random() * 3) - 1;
      if (dx === 0 && dy === 0) continue;

      let fits = true;
      for (let j = 0; j < word.length; j++) {
        const x = x0 + dx * j, y = y0 + dy * j;
        if (x < 0 || y < 0 || x >= puzzleSize || y >= puzzleSize) { fits = false; break; }
        const cur = letters[x][y];
        if (cur !== "*" && cur !== word.charAt(j)) { fits = false; break; }
      }
      if (!fits) continue;

      for (let j = 0; j < word.length; j++) letters[x0 + dx * j][y0 + dy * j] = word.charAt(j);
      wordListCopy.splice(wordNum, 1);
      this.usedWords.push(word);
    }

    for (let x = 0; x < puzzleSize; x++)
      for (let y = 0; y < puzzleSize; y++)
        if (letters[x][y] === "*") letters[x][y] = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    return letters;
  }

  cellFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const x = Math.floor((mx - offset.x) / spacing);
    const y = Math.floor((my - offset.y) / spacing);
    if (x < 0 || y < 0 || x >= puzzleSize || y >= puzzleSize) return null;
    return { x, y };
  }

  onDown(e) {
    const p = this.cellFromEvent(e);
    if (!p) return;
    this.startPoint = p;
    this.endPoint = p;
    this.dragMode = "drag";
    this.render();
  }

  onMove(e) {
    if (this.dragMode !== "drag") return;
    const p = this.cellFromEvent(e);
    if (p) this.endPoint = p;
    this.render();
  }

  onUp() {
    if (this.dragMode !== "drag") return;
    this.dragMode = "none";
    if (this.isValidRange(this.startPoint, this.endPoint)) {
      const word = this.getSelectedWord();
      this.checkWord(word, this.startPoint, this.endPoint);
    }
    this.render();
  }

  isValidRange(p1, p2) {
    if (!p1 || !p2) return false;
    if (p1.x === p2.x) return true;
    if (p1.y === p2.y) return true;
    return Math.abs(p2.x - p1.x) === Math.abs(p2.y - p1.y);
  }

  getSelectedWord() {
    const dx = this.endPoint.x - this.startPoint.x;
    const dy = this.endPoint.y - this.startPoint.y;
    const len = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
    let word = "";
    for (let i = 0; i < len; i++) {
      const x = this.startPoint.x + Math.sign(dx) * i;
      const y = this.startPoint.y + Math.sign(dy) * i;
      word += this.grid[x][y];
    }
    return word;
  }

  checkWord(word, p1, p2) {
    for (const used of this.usedWords) {
      if (this.foundWords.has(used)) continue;
      const reversed = word.split("").reverse().join("");
      if (word === used || reversed === used) {
        this.foundWords.add(used);
        this.foundOutlines.push({ p1, p2 });
        if (this.foundWords.size === this.usedWords.length) this.endGame();
        return;
      }
    }
  }

  endGame() {
    overlayText.textContent = "Alle Wörter gefunden!";
    overlay.style.display = "flex";
    startBtn.textContent = "Neues Rätsel";
  }

  drawOutline(p1, p2, color, width) {
    const cx = spacing / 2, cy = spacing / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p1.x * spacing + offset.x + cx, p1.y * spacing + offset.y + cy);
    ctx.lineTo(p2.x * spacing + offset.x + cx, p2.y * spacing + offset.y + cy);
    ctx.stroke();
  }

  render() {
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);

    this.foundOutlines.forEach(o => this.drawOutline(o.p1, o.p2, "rgba(95,224,201,0.4)", 18));

    if (this.dragMode === "drag" && this.isValidRange(this.startPoint, this.endPoint)) {
      this.drawOutline(this.startPoint, this.endPoint, "rgba(255,184,77,0.35)", 18);
    }

    ctx.font = "15px 'JetBrains Mono'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let x = 0; x < puzzleSize; x++) {
      for (let y = 0; y < puzzleSize; y++) {
        ctx.fillStyle = "#e8edf3";
        ctx.fillText(this.grid[x][y], x * spacing + offset.x + spacing / 2, y * spacing + offset.y + spacing / 2);
      }
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

    // Wortliste
    ctx.font = "14px 'JetBrains Mono'";
    this.usedWords.forEach((w, i) => {
      ctx.fillStyle = this.foundWords.has(w) ? "#3a4657" : "#8fa0b3";
      ctx.fillText(w, wordListX, offset.y + i * 24 + 12);
      if (this.foundWords.has(w)) {
        const width = ctx.measureText(w).width;
        ctx.strokeStyle = "#3a4657";
        ctx.beginPath();
        ctx.moveTo(wordListX, offset.y + i * 24 + 8);
        ctx.lineTo(wordListX + width, offset.y + i * 24 + 8);
        ctx.stroke();
      }
    });
  }
}

const game = new WordSearchGame();
startBtn.addEventListener("click", () => game.start());
ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
