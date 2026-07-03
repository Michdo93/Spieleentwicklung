/**
 * Chapter 03 · Matching Game
 * Portierung der finalen Buchversion A3GPU203_MatchingGame
 * (MatchingGameObject10.as + Card10.as — das Buch baut dieses Spiel im
 * Kapitel in 10 Schritten auf, wir portieren direkt die fertige Version 10).
 *
 * Kartenbilder gab es im Original als nummerierte Frames im Card10-
 * Bibliothekssymbol. Da es diese Bibliothek im Web nicht gibt, zeichnen
 * wir 18 eindeutige Symbol/Farb-Kombinationen selbst (6 Formen × 3 Farben).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const scoreEl = document.getElementById("hud-score");
const timeEl = document.getElementById("hud-time");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

/* ---------------------------------------------------------------- */
/* Konstanten (1:1 aus MatchingGameObject10.as übernommen)           */
/* ---------------------------------------------------------------- */
const boardWidth = 6;
const boardHeight = 6;
const cardSpacing = 60;
const boardOffsetX = 40;
const boardOffsetY = 20;
const cardSize = 50;
const pointsForMatch = 100;
const pointsForMiss = -5;

const SHAPES = ["circle", "square", "triangle", "diamond", "star", "cross"];
const COLORS = ["#ff6b6b", "#5fe0c9", "#ffb84d"];

function drawFace(ctx, value, x, y, size) {
  const shape = SHAPES[value % SHAPES.length];
  const color = COLORS[Math.floor(value / SHAPES.length) % COLORS.length];
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const r = size * 0.32;
  switch (shape) {
    case "circle":
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      break;
    case "square":
      ctx.fillRect(-r, -r, r * 2, r * 2);
      break;
    case "triangle":
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill();
      break;
    case "diamond":
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
      break;
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
  }
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Card10 — entspricht Card10.as (Flip-Animation)                     */
/* ---------------------------------------------------------------- */
class Card {
  constructor(x, y, value) {
    this.x = x; this.y = y; this.value = value;
    this.faceUp = false;
    this.matched = false;
    this.flipT = 1;     // 1 = fertig, 0..1 während der Animation
    this.flipping = false;
    this.pendingFaceUp = false;
  }

  // entspricht startFlip() in Card10.as
  startFlip(showFace) {
    this.flipping = true;
    this.flipT = 0;
    this.pendingFaceUp = showFace;
  }

  update(dt) {
    if (!this.flipping) return;
    this.flipT += dt / 260; // ~260ms für die ganze Flip-Animation
    if (this.flipT >= 0.5 && this.faceUp !== this.pendingFaceUp) {
      this.faceUp = this.pendingFaceUp; // Gesichtswechsel in der Mitte des Flips
    }
    if (this.flipT >= 1) { this.flipT = 1; this.flipping = false; }
  }

  draw(ctx) {
    if (this.matched) return;
    // scaleX-Verlauf: 1 -> 0 -> 1 (entspricht dem 10-Schritte-Flip im Original)
    const scaleX = Math.abs(Math.cos(this.flipT * Math.PI));
    ctx.save();
    ctx.translate(this.x + cardSize / 2, this.y + cardSize / 2);
    ctx.scale(Math.max(scaleX, 0.04), 1);
    ctx.translate(-cardSize / 2, -cardSize / 2);

    ctx.fillStyle = "#141a22";
    ctx.strokeStyle = "#263041";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, cardSize, cardSize, 6);
    ctx.fill(); ctx.stroke();

    if (this.faceUp) {
      drawFace(ctx, this.value, 0, 0, cardSize);
    } else {
      ctx.strokeStyle = "#3a4657";
      ctx.beginPath();
      ctx.roundRect(6, 6, cardSize - 12, cardSize - 12, 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  bounds() { return { x: this.x, y: this.y, w: cardSize, h: cardSize }; }
}

/* ---------------------------------------------------------------- */
/* Sounds (Original-Assets, von .aiff nach .mp3 konvertiert)          */
/* ---------------------------------------------------------------- */
const sndFirst = new Audio("assets/FirstCardSound.mp3");
const sndMiss = new Audio("assets/MissSound.mp3");
const sndMatch = new Audio("assets/MatchSound.mp3");
function playSound(a) { a.currentTime = 0; a.play().catch(() => {}); }

/* ---------------------------------------------------------------- */
/* MatchingGameObject10 — Spiellogik                                  */
/* ---------------------------------------------------------------- */
class MatchingGame {
  constructor() {
    this.state = "intro";
    this.lastTime = 0;
    this._loopBound = this.loop.bind(this);
    canvas.addEventListener("click", e => this.handleClick(e));
  }

  startGame() {
    const cardlist = [];
    for (let i = 0; i < (boardWidth * boardHeight) / 2; i++) { cardlist.push(i); cardlist.push(i); }

    this.cards = [];
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        const r = Math.floor(Math.random() * cardlist.length);
        const value = cardlist.splice(r, 1)[0];
        this.cards.push(new Card(x * cardSpacing + boardOffsetX, y * cardSpacing + boardOffsetY, value));
      }
    }

    this.firstCard = null;
    this.secondCard = null;
    this.cardsLeft = this.cards.length;
    this.gameScore = 0;
    this.busy = false;
    this.gameStartTime = performance.now();
    this.gameTime = 0;

    this.state = "playing";
    overlay.style.display = "none";
    this.showGameScore();

    this.lastTime = performance.now();
    requestAnimationFrame(this._loopBound);
  }

  showGameScore() {
    scoreEl.textContent = `Score: ${this.gameScore}`;
  }

  handleClick(e) {
    if (this.state !== "playing" || this.busy) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const card = this.cards.find(c => !c.matched && mx >= c.x && mx <= c.x + cardSize && my >= c.y && my <= c.y + cardSize);
    if (!card) return;
    this.clickCard(card);
  }

  // entspricht clickCard() in MatchingGameObject10.as
  clickCard(thisCard) {
    if (this.firstCard === null) {
      this.firstCard = thisCard;
      thisCard.startFlip(true);
      playSound(sndFirst);
    } else if (this.firstCard === thisCard) {
      this.firstCard.startFlip(false);
      this.firstCard = null;
      playSound(sndMiss);
    } else if (this.secondCard === null) {
      this.secondCard = thisCard;
      thisCard.startFlip(true);

      if (this.firstCard.value === this.secondCard.value) {
        const f = this.firstCard, s = this.secondCard;
        this.gameScore += pointsForMatch;
        this.showGameScore();
        playSound(sndMatch);
        this.cardsLeft -= 2;
        setTimeout(() => { f.matched = true; s.matched = true; }, 180);
        this.firstCard = null;
        this.secondCard = null;
        if (this.cardsLeft === 0) {
          setTimeout(() => this.endGame(), 300);
        }
      } else {
        this.gameScore += pointsForMiss;
        this.showGameScore();
        playSound(sndMiss);
        this.busy = true;
        setTimeout(() => this.returnCards(), 900);
      }
    } else {
      this.returnCards();
      playSound(sndFirst);
      this.firstCard = thisCard;
      thisCard.startFlip(true);
    }
  }

  returnCards() {
    if (this.firstCard) this.firstCard.startFlip(false);
    if (this.secondCard) this.secondCard.startFlip(false);
    this.firstCard = null;
    this.secondCard = null;
    this.busy = false;
  }

  endGame() {
    this.state = "gameover";
    overlayText.textContent = `Geschafft! Score: ${this.gameScore} — Zeit: ${this.clockTime(this.gameTime)}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  clockTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds - m * 60;
    return `${m}:${String(s + 100).substring(1, 3)}`;
  }

  loop(now) {
    if (this.state !== "playing") return;
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.cards.forEach(c => c.update(dt));
    this.gameTime = now - this.gameStartTime;
    timeEl.textContent = `Time: ${this.clockTime(this.gameTime)}`;

    this.render();
    requestAnimationFrame(this._loopBound);
  }

  render() {
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, W, H);
    this.cards.forEach(c => c.draw(ctx));
  }
}

const game = new MatchingGame();
startBtn.addEventListener("click", () => game.startGame());

ctx.fillStyle = "#05070a";
ctx.fillRect(0, 0, W, H);
