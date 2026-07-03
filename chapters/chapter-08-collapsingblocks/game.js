/**
 * Chapter 08 · Collapsing Blocks
 * Portierung von A3GPU208_CollapsingBlocks/CollapsingBlocks.as ("SameGame"-Prinzip)
 *
 * Klick auf einen Block markiert per rekursiver Flood-Fill-Suche
 * (testBlock()) alle direkt verbundenen Blöcke desselben Typs. Bei zwei oder
 * mehr Treffern verschwinden sie, darüberliegende Blöcke fallen nach, leere
 * Spalten rutschen zusammen. Der Algorithmus ist 1:1 aus dem Original
 * übernommen — nur die Animation läuft zeitbasiert statt in festen
 * Pixel-Schritten pro Frame.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const scoreEl = document.getElementById("hud-score");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const spacing = 32, offsetX = 20, offsetY = 20;
const numCols = 14, numRows = 10;
const moveSpeed = 260; // px/s
const TYPE_COLORS = { 1: "#ff6b6b", 2: "#5fe0c9", 3: "#ffb84d", 4: "#a78bfa" };

// Wiederverwendete Mini-Version von PointBurst (siehe Chapter 08a)
class PointBurst {
  constructor(pts, x, y) { this.text = String(pts); this.x = x; this.y = y; this.start = performance.now(); this.done = false; }
  update(now) {
    const p = Math.min((now - this.start) / 500, 1);
    this.scale = p * 2; this.alpha = 1 - p;
    if (p >= 1) this.done = true;
  }
  draw(ctx) {
    ctx.save(); ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y); ctx.scale(this.scale, this.scale);
    ctx.fillStyle = "#ffb84d"; ctx.font = "bold 16px 'Space Grotesk'";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

class CollapsingBlocksGame {
  constructor() { canvas.addEventListener("click", e => this.onClick(e)); }

  start() {
    this.blocks = Array.from({ length: numCols }, () => new Array(numRows).fill(null));
    for (let col = 0; col < numCols; col++)
      for (let row = 0; row < numRows; row++)
        this.addBlock(col, row);

    this.gameScore = 0;
    this.checkColumns = false;
    this.bursts = [];
    overlay.style.display = "none";
    this.showScore();
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  addBlock(col, row) {
    const b = { col, row, type: Math.ceil(Math.random() * 4), x: col * spacing + offsetX, y: row * spacing + offsetY };
    this.blocks[col][row] = b;
    return b;
  }

  screenX(b) { return b.col * spacing + offsetX; }
  screenY(b) { return b.row * spacing + offsetY; }

  onClick(e) {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const col = Math.floor((mx - offsetX + spacing / 2) / spacing);
    const row = Math.floor((my - offsetY + spacing / 2) / spacing);
    const b = this.getBlock(col, row);
    if (b) this.clickBlock(b);
  }

  getBlock(col, row) {
    if (col < 0 || col >= numCols || row < 0 || row >= numRows) return null;
    return this.blocks[col][row];
  }
  getBlockType(col, row) { const b = this.getBlock(col, row); return b ? b.type : 0; }

  clickBlock(block) {
    const type = block.type;
    const visited = new Set();
    const matchList = this.testBlock(block.col, block.row, type, visited);
    if (matchList.length > 1) {
      matchList.forEach(b => this.affectAbove(b));
      this.checkColumns = true;
      const pts = matchList.length * matchList.length;
      this.gameScore += pts; this.showScore();
      this.bursts.push(new PointBurst(pts, block.x, block.y));
    }
  }

  // entspricht testBlock() — rekursive Flood-Fill-Suche in 4 Richtungen.
  // "visited" ersetzt den Original-Trick (type kurzzeitig auf 0 setzen),
  // damit ein einzelner Klick auf einen unverbundenen Block nicht dauerhaft
  // unklickbar wird.
  testBlock(col, row, type, visited) {
    const key = col + "," + row;
    if (visited.has(key)) return [];
    if (this.getBlockType(col, row) !== type || type === 0) return [];
    visited.add(key);
    const b = this.blocks[col][row];
    let list = [b];
    list = list.concat(this.testBlock(col + 1, row, type, visited));
    list = list.concat(this.testBlock(col - 1, row, type, visited));
    list = list.concat(this.testBlock(col, row + 1, type, visited));
    list = list.concat(this.testBlock(col, row - 1, type, visited));
    return list;
  }

  affectAbove(block) {
    this.blocks[block.col][block.row] = null;
    for (let row = block.row - 1; row >= 0; row--) {
      if (this.blocks[block.col][row] != null) {
        this.blocks[block.col][row].row++;
        this.blocks[block.col][row + 1] = this.blocks[block.col][row];
        this.blocks[block.col][row] = null;
      }
    }
  }

  checkForEmptyColumns() {
    let foundEmpty = false;
    let blocksToMove = 0;
    for (let col = 0; col < numCols; col++) {
      if (!foundEmpty) {
        if (this.blocks[col][numRows - 1] == null) { foundEmpty = true; this.checkColumns = true; }
      } else {
        for (let row = 0; row < numRows; row++) {
          if (this.blocks[col][row] != null) {
            this.blocks[col][row].col--;
            this.blocks[col - 1][row] = this.blocks[col][row];
            this.blocks[col][row] = null;
            blocksToMove++;
          }
        }
      }
    }
    if (blocksToMove === 0) { this.checkColumns = false; this.checkForGameOver(); }
  }

  checkForGameOver() {
    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows; row++) {
        const t = this.getBlockType(col, row);
        if (t === 0) continue;
        if (t === this.getBlockType(col + 1, row)) return;
        if (t === this.getBlockType(col, row + 1)) return;
      }
    }
    this.endGame();
  }

  endGame() {
    overlayText.textContent = `Keine Züge mehr übrig. Score: ${this.gameScore}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  showScore() { scoreEl.textContent = `Score: ${this.gameScore}`; }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    let madeMove = false;
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const b = this.blocks[col][row];
        if (!b) continue;
        const ty = this.screenY(b), tx = this.screenX(b);
        if (b.y < ty) { b.y = Math.min(ty, b.y + moveSpeed * dt); madeMove = true; }
        else if (b.x > tx) { b.x = Math.max(tx, b.x - moveSpeed * dt); madeMove = true; }
      }
    }
    if (!madeMove && this.checkColumns) { this.checkColumns = false; this.checkForEmptyColumns(); }

    this.bursts.forEach(pb => pb.update(now));
    this.bursts = this.bursts.filter(pb => !pb.done);

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  render() {
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows; row++) {
        const b = this.blocks[col][row];
        if (!b) continue;
        ctx.fillStyle = TYPE_COLORS[b.type] || "#666";
        ctx.beginPath();
        ctx.roundRect(b.x - spacing / 2 + 2, b.y - spacing / 2 + 2, spacing - 4, spacing - 4, 4);
        ctx.fill();
      }
    }
    this.bursts.forEach(pb => pb.draw(ctx));
  }
}

const game = new CollapsingBlocksGame();
startBtn.addEventListener("click", () => game.start());
ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
