/**
 * Chapter 08 · Match Three
 * Portierung von A3GPU208_MatchThree/MatchThree.as — ein Bejeweled-Klon.
 *
 * Ablauf 1:1 aus dem Original: erstes Teil anklicken (markieren), zweites
 * angrenzendes Teil anklicken → Tausch probieren → nur behalten, wenn dadurch
 * eine Dreier-Reihe entsteht → Treffer entfernen, PointBurst zeigen, Rest
 * fällt nach, neue Teile von oben, danach erneut auf Ketten-Reaktionen prüfen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const scoreEl = document.getElementById("hud-score");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const gridSize = 8;
const spacing = 44, offsetX = 20, offsetY = 20;
const moveSpeed = 320; // px/s

const PIECE_SHAPES = ["circle", "square", "triangle", "diamond", "star", "cross", "hex"];
const PIECE_COLORS = ["#ff6b6b", "#ffb84d", "#5fe0c9", "#a78bfa", "#7cd992", "#ffd23f", "#4fb0ff"];

function drawShape(ctx, type, x, y, size, highlighted) {
  const shape = PIECE_SHAPES[type - 1];
  const color = PIECE_COLORS[type - 1];
  ctx.save();
  ctx.translate(x, y);
  if (highlighted) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-size / 2 + 1, -size / 2 + 1, size - 2, size - 2);
  }
  ctx.fillStyle = color;
  const r = size * 0.32;
  switch (shape) {
    case "circle": ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); break;
    case "square": ctx.fillRect(-r, -r, r * 2, r * 2); break;
    case "triangle": ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill(); break;
    case "diamond": ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill(); break;
    case "star": {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
    case "cross":
      ctx.fillRect(-r, -r * 0.35, r * 2, r * 0.7);
      ctx.fillRect(-r * 0.35, -r, r * 0.7, r * 2);
      break;
    case "hex": {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

class PointBurst {
  constructor(pts, x, y) { this.text = String(pts); this.x = x; this.y = y; this.start = performance.now(); this.done = false; }
  update(now) {
    const p = Math.min((now - this.start) / 500, 1);
    this.scale = p * 1.8; this.alpha = 1 - p;
    if (p >= 1) this.done = true;
  }
  draw(ctx) {
    ctx.save(); ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y); ctx.scale(this.scale, this.scale);
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Space Grotesk'";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

class MatchThreeGame {
  constructor() { canvas.addEventListener("click", e => this.onClick(e)); }

  start() {
    this.gameScore = 0;
    this.firstPiece = null;
    this.isDropping = false;
    this.isSwapping = false;
    this.bursts = [];
    this.setUpGrid();
    overlay.style.display = "none";
    this.showScore();
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  setUpGrid() {
    let attempts = 0;
    while (attempts++ < 200) {
      this.grid = Array.from({ length: gridSize }, () => new Array(gridSize));
      for (let col = 0; col < gridSize; col++)
        for (let row = 0; row < gridSize; row++)
          this.addPiece(col, row);
      if (this.lookForMatches().length === 0 && this.lookForPossibles()) break;
    }
  }

  addPiece(col, row) {
    const p = {
      col, row, type: Math.ceil(Math.random() * PIECE_SHAPES.length),
      x: col * spacing + offsetX, y: row * spacing + offsetY, selected: false,
    };
    this.grid[col][row] = p;
    return p;
  }

  screenX(p) { return p.col * spacing + offsetX; }
  screenY(p) { return p.row * spacing + offsetY; }

  onClick(e) {
    if (this.isDropping || this.isSwapping) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const col = Math.floor((mx - offsetX + spacing / 2) / spacing);
    const row = Math.floor((my - offsetY + spacing / 2) / spacing);
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return;
    this.clickPiece(this.grid[col][row]);
  }

  clickPiece(piece) {
    if (this.firstPiece == null) {
      piece.selected = true;
      this.firstPiece = piece;
    } else if (this.firstPiece === piece) {
      piece.selected = false;
      this.firstPiece = null;
    } else {
      this.firstPiece.selected = false;
      const adjacent =
        (this.firstPiece.row === piece.row && Math.abs(this.firstPiece.col - piece.col) === 1) ||
        (this.firstPiece.col === piece.col && Math.abs(this.firstPiece.row - piece.row) === 1);
      if (adjacent) {
        this.makeSwap(this.firstPiece, piece);
        this.firstPiece = null;
      } else {
        this.firstPiece = piece;
        piece.selected = true;
      }
    }
  }

  makeSwap(p1, p2) {
    this.swapPieces(p1, p2);
    if (this.lookForMatches().length === 0) {
      this.swapPieces(p1, p2); // kein Treffer -> zurücktauschen
    } else {
      this.isSwapping = true;
    }
  }

  swapPieces(p1, p2) {
    const c = p1.col, r = p1.row;
    p1.col = p2.col; p1.row = p2.row;
    p2.col = c; p2.row = r;
    this.grid[p1.col][p1.row] = p1;
    this.grid[p2.col][p2.row] = p2;
  }

  lookForMatches() {
    const matchList = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize - 2; col++) {
        const m = this.getMatchHoriz(col, row);
        if (m.length > 2) { matchList.push(m); col += m.length - 1; }
      }
    }
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize - 2; row++) {
        const m = this.getMatchVert(col, row);
        if (m.length > 2) { matchList.push(m); row += m.length - 1; }
      }
    }
    return matchList;
  }
  getMatchHoriz(col, row) {
    const match = [this.grid[col][row]];
    for (let i = 1; col + i < gridSize; i++) {
      if (this.grid[col][row].type === this.grid[col + i][row].type) match.push(this.grid[col + i][row]);
      else break;
    }
    return match;
  }
  getMatchVert(col, row) {
    const match = [this.grid[col][row]];
    for (let i = 1; row + i < gridSize; i++) {
      if (this.grid[col][row].type === this.grid[col][row + i].type) match.push(this.grid[col][row + i]);
      else break;
    }
    return match;
  }

  findAndRemoveMatches() {
    const matches = this.lookForMatches();
    matches.forEach(match => {
      const pts = (match.length - 1) * 50;
      match.forEach(piece => {
        if (this.grid[piece.col][piece.row] === piece) {
          this.bursts.push(new PointBurst(pts, piece.x, piece.y));
          this.gameScore += pts; this.showScore();
          this.grid[piece.col][piece.row] = null;
          this.affectAbove(piece);
        }
      });
    });
    this.addNewPieces();
    if (matches.length === 0 && !this.lookForPossibles()) this.endGame();
  }

  affectAbove(piece) {
    for (let row = piece.row - 1; row >= 0; row--) {
      if (this.grid[piece.col][row] != null) {
        this.grid[piece.col][row].row++;
        this.grid[piece.col][row + 1] = this.grid[piece.col][row];
        this.grid[piece.col][row] = null;
      }
    }
  }

  addNewPieces() {
    for (let col = 0; col < gridSize; col++) {
      let missing = 0;
      for (let row = gridSize - 1; row >= 0; row--) {
        if (this.grid[col][row] == null) {
          const p = this.addPiece(col, row);
          p.y = offsetY - spacing - spacing * missing++;
          this.isDropping = true;
        }
      }
    }
  }

  lookForPossibles() {
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        if (this.matchPattern(col, row, [[1, 0]], [[-2, 0], [-1, -1], [-1, 1], [2, -1], [2, 1], [3, 0]])) return true;
        if (this.matchPattern(col, row, [[2, 0]], [[1, -1], [1, 1]])) return true;
        if (this.matchPattern(col, row, [[0, 1]], [[0, -2], [-1, -1], [1, -1], [-1, 2], [1, 2], [0, 3]])) return true;
        if (this.matchPattern(col, row, [[0, 2]], [[-1, 1], [1, 1]])) return true;
      }
    }
    return false;
  }
  matchPattern(col, row, mustHave, needOne) {
    const type = this.grid[col][row].type;
    for (const [dc, dr] of mustHave) if (!this.matchType(col + dc, row + dr, type)) return false;
    for (const [dc, dr] of needOne) if (this.matchType(col + dc, row + dr, type)) return true;
    return false;
  }
  matchType(col, row, type) {
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return false;
    return this.grid[col][row].type === type;
  }

  endGame() {
    overlayText.textContent = `Keine Züge mehr möglich. Score: ${this.gameScore}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }
  showScore() { scoreEl.textContent = `Score: ${this.gameScore}`; }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    let madeMove = false;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const p = this.grid[col][row];
        if (!p) continue;
        const tx = this.screenX(p), ty = this.screenY(p);
        if (p.y < ty) { p.y = Math.min(ty, p.y + moveSpeed * dt); madeMove = true; }
        else if (p.y > ty) { p.y = Math.max(ty, p.y - moveSpeed * dt); madeMove = true; }
        else if (p.x < tx) { p.x = Math.min(tx, p.x + moveSpeed * dt); madeMove = true; }
        else if (p.x > tx) { p.x = Math.max(tx, p.x - moveSpeed * dt); madeMove = true; }
      }
    }

    if (this.isDropping && !madeMove) { this.isDropping = false; this.findAndRemoveMatches(); }
    else if (this.isSwapping && !madeMove) { this.isSwapping = false; this.findAndRemoveMatches(); }

    this.bursts.forEach(b => b.update(now));
    this.bursts = this.bursts.filter(b => !b.done);

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  render() {
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        const p = this.grid[col][row];
        if (p) drawShape(ctx, p.type, p.x, p.y, spacing - 8, p.selected);
      }
    }
    ctx.restore();
    this.bursts.forEach(b => b.draw(ctx));
  }
}

const game = new MatchThreeGame();
startBtn.addEventListener("click", () => game.start());
ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
