/**
 * Chapter 06 · Jigsaw Puzzle
 * Portierung von A3GPU206_JigsawPuzzle/JigsawPuzzle.as
 *
 * Kernidee des Originals bleibt erhalten: Teile werden nicht einzeln,
 * sondern in "verbundenen Gruppen" gezogen — sobald zwei Teile in der
 * richtigen relativen Position zueinander liegen, bewegen sie sich ab da
 * gemeinsam. Der Verbindungs-Suchalgorithmus (findLockedPieces/isConnected)
 * ist 1:1 aus dem Original übernommen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const hint = document.getElementById("hint");

const numPiecesHoriz = 8;
const numPiecesVert = 6;

const img = new Image();
img.src = "assets/jigsawimage.jpg";

class JigsawGame {
  constructor() {
    canvas.addEventListener("mousedown", e => this.onDown(e));
    window.addEventListener("mousemove", e => this.onMove(e));
    window.addEventListener("mouseup", () => this.onUp());
  }

  start() {
    if (!img.complete) { img.onload = () => this.start(); return; }

    this.pieceWidth = Math.floor((img.width / numPiecesHoriz) / 10) * 10;
    this.pieceHeight = Math.floor((img.height / numPiecesVert) / 10) * 10;

    this.puzzleObjects = [];
    for (let x = 0; x < numPiecesHoriz; x++) {
      for (let y = 0; y < numPiecesVert; y++) {
        this.puzzleObjects.push({
          locX: x, locY: y,             // feste Position im fertigen Bild
          sx: x * this.pieceWidth, sy: y * this.pieceHeight,
          x: Math.random() * (W - this.pieceWidth - 40) + 20,
          y: Math.random() * (H - this.pieceHeight - 40) + 20,
        });
      }
    }
    this.lockPiecesToGrid();
    this.zOrder = [...this.puzzleObjects.keys()];
    this.beingDragged = [];
    this.dragOffsets = {};

    overlay.style.display = "none";
    hint.style.display = "block";
    this.render();
  }

  toLocal(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  pieceAt(mx, my) {
    for (let i = this.zOrder.length - 1; i >= 0; i--) {
      const idx = this.zOrder[i];
      const p = this.puzzleObjects[idx];
      if (mx >= p.x && mx <= p.x + this.pieceWidth && my >= p.y && my <= p.y + this.pieceHeight) return idx;
    }
    return -1;
  }

  onDown(e) {
    if (!this.puzzleObjects) return;
    const { x: mx, y: my } = this.toLocal(e);
    const idx = this.pieceAt(mx, my);
    if (idx === -1) return;

    this.beingDragged = [idx];
    this.dragOffsets = { [idx]: { x: mx - this.puzzleObjects[idx].x, y: my - this.puzzleObjects[idx].y } };
    this.bringToFront(idx);
    this.findLockedPieces(idx, mx, my);
    this.render();
  }

  // entspricht findLockedPieces() / isConnected() in JigsawPuzzle.as
  findLockedPieces(clickedIdx, mx, my) {
    const clicked = this.puzzleObjects[clickedIdx];
    const candidates = this.puzzleObjects
      .map((p, i) => ({ i, dist: Math.hypot(p.locX - clicked.locX, p.locY - clicked.locY) }))
      .filter(o => o.i !== clickedIdx)
      .sort((a, b) => b.dist - a.dist); // weit -> nah, wie Array.DESCENDING im Original

    let found = true;
    while (found) {
      found = false;
      for (let i = candidates.length - 1; i >= 0; i--) {
        const n = candidates[i].i;
        const np = this.puzzleObjects[n];
        const diffX = np.locX - clicked.locX;
        const diffY = np.locY - clicked.locY;
        const expectedX = clicked.x + this.pieceWidth * diffX;
        const expectedY = clicked.y + this.pieceHeight * diffY;
        if (Math.abs(np.x - expectedX) < 0.5 && Math.abs(np.y - expectedY) < 0.5) {
          if (this.isConnected(n)) {
            this.beingDragged.push(n);
            this.dragOffsets[n] = { x: mx - np.x, y: my - np.y };
            this.bringToFront(n);
            candidates.splice(i, 1);
            found = true;
          }
        }
      }
    }
  }

  isConnected(idx) {
    const p = this.puzzleObjects[idx];
    return this.beingDragged.some(di => {
      const d = this.puzzleObjects[di];
      const hd = Math.abs(p.locX - d.locX), vd = Math.abs(p.locY - d.locY);
      return (hd === 1 && vd === 0) || (hd === 0 && vd === 1);
    });
  }

  bringToFront(idx) {
    this.zOrder = this.zOrder.filter(i => i !== idx);
    this.zOrder.push(idx);
  }

  onMove(e) {
    if (!this.beingDragged || this.beingDragged.length === 0) return;
    const { x: mx, y: my } = this.toLocal(e);
    this.beingDragged.forEach(idx => {
      const off = this.dragOffsets[idx];
      this.puzzleObjects[idx].x = mx - off.x;
      this.puzzleObjects[idx].y = my - off.y;
    });
    this.render();
  }

  onUp() {
    if (!this.beingDragged || this.beingDragged.length === 0) return;
    this.lockPiecesToGrid();
    this.beingDragged = [];
    this.dragOffsets = {};
    this.render();
    if (this.puzzleTogether()) this.endGame();
  }

  lockPiecesToGrid() {
    this.puzzleObjects.forEach(p => {
      p.x = 10 * Math.round(p.x / 10);
      p.y = 10 * Math.round(p.y / 10);
    });
  }

  puzzleTogether() {
    const first = this.puzzleObjects[0];
    for (let i = 1; i < this.puzzleObjects.length; i++) {
      const p = this.puzzleObjects[i];
      const diffX = p.locX - first.locX, diffY = p.locY - first.locY;
      if (p.x !== first.x + this.pieceWidth * diffX) return false;
      if (p.y !== first.y + this.pieceHeight * diffY) return false;
    }
    return true;
  }

  endGame() {
    hint.style.display = "none";
    overlayText.textContent = "Zusammengesetzt! Alle Teile liegen richtig zueinander.";
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal mischen";
  }

  render() {
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, W, H);
    if (!this.puzzleObjects) return;
    this.zOrder.forEach(idx => {
      const p = this.puzzleObjects[idx];
      ctx.drawImage(img, p.sx, p.sy, this.pieceWidth, this.pieceHeight, p.x, p.y, this.pieceWidth, this.pieceHeight);
      ctx.strokeStyle = this.beingDragged.includes(idx) ? "#ffb84d" : "rgba(0,0,0,0.35)";
      ctx.lineWidth = this.beingDragged.includes(idx) ? 2 : 1;
      ctx.strokeRect(p.x, p.y, this.pieceWidth, this.pieceHeight);
    });
  }
}

const game = new JigsawGame();
startBtn.addEventListener("click", () => game.start());

ctx.fillStyle = "#05070a";
ctx.fillRect(0, 0, W, H);
