/**
 * Chapter 06 · Sliding Puzzle
 * Portierung von A3GPU206_SlidingPuzzle/SlidingPuzzle.as
 *
 * Klassisches 15-Puzzle-Prinzip (hier 4×3 = 11 Teile + 1 Leerfeld).
 * Die Slide-Animation lief im Original über einen Timer mit festen Schritten
 * (slideSteps=10, slideTime=250ms) — hier 1:1 als requestAnimationFrame mit
 * Fortschrittsberechnung aus verstrichener Zeit übertragen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const pieceSpace = 2;
const horizOffset = 30;
const vertOffset = 30;
const numPiecesHoriz = 4;
const numPiecesVert = 3;
const numShuffle = 120;
const slideTime = 220; // ms

const img = new Image();
img.src = "assets/slidingimage.jpg";

class SlidingPuzzle {
  constructor() {
    canvas.addEventListener("click", e => this.onClick(e));
  }

  start() {
    if (!img.complete) { img.onload = () => this.start(); return; }

    this.pieceWidth = img.width / numPiecesHoriz;
    this.pieceHeight = img.height / numPiecesVert;
    this.blank = { x: numPiecesHoriz - 1, y: numPiecesVert - 1 };

    this.pieces = [];
    for (let x = 0; x < numPiecesHoriz; x++) {
      for (let y = 0; y < numPiecesVert; y++) {
        if (x === this.blank.x && y === this.blank.y) continue;
        this.pieces.push({
          homeX: x, homeY: y,
          curX: x, curY: y,
          sx: x * this.pieceWidth, sy: y * this.pieceHeight,
          animX: null, animY: null, // während der Slide-Animation gesetzt
        });
      }
    }
    for (let i = 0; i < numShuffle; i++) this.shuffleRandomMove();

    this.sliding = null; // { piece, fromX, fromY, toX, toY, startTime }
    overlay.style.display = "none";
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  pieceScreenX(p) { return p.curX * (this.pieceWidth + pieceSpace) + horizOffset; }
  pieceScreenY(p) { return p.curY * (this.pieceHeight + pieceSpace) + vertOffset; }

  validMove(p) {
    if (p.curX === this.blank.x && p.curY === this.blank.y + 1) return "up";
    if (p.curX === this.blank.x && p.curY === this.blank.y - 1) return "down";
    if (p.curY === this.blank.y && p.curX === this.blank.x + 1) return "left";
    if (p.curY === this.blank.y && p.curX === this.blank.x - 1) return "right";
    return "none";
  }

  shuffleRandomMove() {
    const valid = this.pieces.filter(p => this.validMove(p) !== "none");
    const pick = valid[Math.floor(Math.random() * valid.length)];
    this.movePiece(pick, false);
  }

  movePiece(p, slideEffect) {
    const move = this.validMove(p);
    if (move === "none") return;
    const dx = move === "left" ? -1 : move === "right" ? 1 : 0;
    const dy = move === "up" ? -1 : move === "down" ? 1 : 0;

    const fromX = this.pieceScreenX(p), fromY = this.pieceScreenY(p);
    p.curX += dx; p.curY += dy;
    this.blank.x -= dx; this.blank.y -= dy;

    if (slideEffect) {
      this.sliding = { piece: p, fromX, fromY, toX: this.pieceScreenX(p), toY: this.pieceScreenY(p), start: performance.now() };
    }
  }

  onClick(e) {
    if (!this.pieces || this.sliding) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const clicked = this.pieces.find(p => {
      const x = this.pieceScreenX(p), y = this.pieceScreenY(p);
      return mx >= x && mx <= x + this.pieceWidth && my >= y && my <= y + this.pieceHeight;
    });
    if (clicked) this.movePiece(clicked, true);
  }

  puzzleComplete() {
    return this.pieces.every(p => p.curX === p.homeX && p.curY === p.homeY);
  }

  loop(now) {
    if (this.sliding) {
      const t = Math.min((now - this.sliding.start) / slideTime, 1);
      const s = this.sliding;
      s.piece.animX = s.fromX + (s.toX - s.fromX) * t;
      s.piece.animY = s.fromY + (s.toY - s.fromY) * t;
      if (t >= 1) {
        s.piece.animX = null;
        s.piece.animY = null;
        this.sliding = null;
        if (this.puzzleComplete()) this.endGame();
      }
    }
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  endGame() {
    overlayText.textContent = "Bild vollständig! Alle Teile am richtigen Platz.";
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal mischen";
  }

  render() {
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, W, H);
    if (!this.pieces) return;
    ctx.strokeStyle = "#263041";
    ctx.strokeRect(
      horizOffset - 1, vertOffset - 1,
      numPiecesHoriz * (this.pieceWidth + pieceSpace) + 1,
      numPiecesVert * (this.pieceHeight + pieceSpace) + 1
    );
    this.pieces.forEach(p => {
      const x = p.animX ?? this.pieceScreenX(p);
      const y = p.animY ?? this.pieceScreenY(p);
      ctx.drawImage(img, p.sx, p.sy, this.pieceWidth, this.pieceHeight, x, y, this.pieceWidth, this.pieceHeight);
    });
  }
}

const game = new SlidingPuzzle();
startBtn.addEventListener("click", () => game.start());

ctx.fillStyle = "#05070a";
ctx.fillRect(0, 0, W, H);
