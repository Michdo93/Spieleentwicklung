/**
 * Chapter 05 · Paddle Ball
 * Portierung von A3GPU205_PaddleBall/PaddleBall.as
 *
 * Trotz des Namens ein waschechter Breakout-Klon: Maus steuert das
 * Paddle, Ball zerstört Ziegel, prallt von Wänden und dem Paddle ab
 * (mit variablem Abprallwinkel je nach Trefferpunkt). Die komplette
 * Kollisionslogik ist 1:1 aus dem Original übernommen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const messageEl = document.getElementById("message");
const ballsEl = document.getElementById("hud-balls");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

/* Konstanten — 1:1 aus PaddleBall.as, ballSpeed von px/ms auf px/s skaliert */
const ballRadius = 9;
const wallTop = 18, wallLeft = 18, wallRight = W - 18;
const paddleY = H - 20;
const paddleWidth = 90, paddleHeight = 18;
const ballSpeed = 200; // px/s (Original: .2 px/ms)
const paddleCurve = 5; // (Original: .005, hier an px/s-Einheiten angepasst)

const BRICK_COLORS = ["#ff6b6b", "#ffb84d", "#5fe0c9", "#a78bfa", "#7cd992"];

class PaddleBallGame {
  constructor() {
    canvas.addEventListener("mousemove", e => this.onMouseMove(e));
    canvas.addEventListener("click", () => this.newBall());
  }

  start() {
    this.paddleX = W / 2;
    this.makeBricks();
    this.balls = 3;
    this.ball = null;
    this.gameOver = false;
    overlay.style.display = "none";
    messageEl.textContent = "Klicken zum Starten";
    this.updateHud();
    this.lastTime = 0;
    requestAnimationFrame(t => this.loop(t));
  }

  makeBricks() {
    this.bricks = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 8; x++) {
        this.bricks.push({ x: 55 * x + wallLeft + 10, y: 20 * y + 50, w: 48, h: 14, color: BRICK_COLORS[y % BRICK_COLORS.length] });
      }
    }
  }

  onMouseMove(e) {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    this.paddleX = Math.min(wallRight - paddleWidth / 2, Math.max(wallLeft + paddleWidth / 2, mx));
  }

  newBall() {
    if (this.ball || this.gameOver) return;
    messageEl.textContent = "";
    this.ball = { x: (wallRight - wallLeft) / 2 + wallLeft, y: 200, dx: 0, dy: ballSpeed };
    this.balls--;
    this.updateHud();
  }

  updateHud() { ballsEl.textContent = `Balls: ${this.balls}`; }

  moveBall(dt) {
    if (!this.ball) return;
    const b = this.ball;
    let newX = b.x + b.dx * dt, newY = b.y + b.dy * dt;
    const oldRect = { left: b.x - ballRadius, right: b.x + ballRadius, top: b.y - ballRadius, bottom: b.y + ballRadius };
    let newRect = { left: newX - ballRadius, right: newX + ballRadius, top: newY - ballRadius, bottom: newY + ballRadius };
    const paddleRect = { left: this.paddleX - paddleWidth / 2, right: this.paddleX + paddleWidth / 2, top: paddleY - paddleHeight / 2, bottom: paddleY + paddleHeight / 2 };

    // Kollision mit Paddle
    if (newRect.bottom >= paddleRect.top && oldRect.bottom < paddleRect.top &&
        newRect.right > paddleRect.left && newRect.left < paddleRect.right) {
      newY -= 2 * (newRect.bottom - paddleRect.top);
      b.dy *= -1;
      b.dx = (newX - this.paddleX) * paddleCurve;
    } else if (newRect.top > H) {
      this.ball = null;
      if (this.balls > 0) messageEl.textContent = "Klicken für nächsten Ball";
      else this.endGame();
      return;
    }

    // Wände
    if (newRect.top < wallTop) { newY += 2 * (wallTop - newRect.top); b.dy *= -1; }
    if (newRect.left < wallLeft) { newX += 2 * (wallLeft - newRect.left); b.dx *= -1; }
    if (newRect.right > wallRight) { newX += 2 * (wallRight - newRect.right); b.dx *= -1; }

    newRect = { left: newX - ballRadius, right: newX + ballRadius, top: newY - ballRadius, bottom: newY + ballRadius };

    // Ziegel
    for (let i = this.bricks.length - 1; i >= 0; i--) {
      const brick = this.bricks[i];
      const brickRect = { left: brick.x, right: brick.x + brick.w, top: brick.y, bottom: brick.y + brick.h };
      const hit = newRect.left < brickRect.right && newRect.right > brickRect.left && newRect.top < brickRect.bottom && newRect.bottom > brickRect.top;
      if (hit) {
        if (oldRect.right < brickRect.left) { newX += 2 * (brickRect.left - oldRect.right); b.dx *= -1; }
        else if (oldRect.left > brickRect.right) { newX += 2 * (brickRect.right - oldRect.left); b.dx *= -1; }
        if (oldRect.top > brickRect.bottom) { b.dy *= -1; newY += 2 * (brickRect.bottom - newRect.top); }
        else if (oldRect.bottom < brickRect.top) { b.dy *= -1; newY += 2 * (brickRect.top - newRect.bottom); }

        this.bricks.splice(i, 1);
        if (this.bricks.length < 1) { this.endGame(true); return; }
        break;
      }
    }

    b.x = newX; b.y = newY;
  }

  endGame(won = false) {
    this.gameOver = true;
    overlayText.textContent = won ? "Alle Ziegel zerstört!" : "Keine Bälle mehr übrig.";
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  loop(now) {
    if (this.lastTime === 0) this.lastTime = now;
    const dt = Math.min((now - this.lastTime) / 1000, 0.03);
    this.lastTime = now;
    if (!this.gameOver) this.moveBall(dt);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  render() {
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#263041"; ctx.lineWidth = 3;
    ctx.strokeRect(wallLeft, wallTop, wallRight - wallLeft, H - wallTop - 4);

    this.bricks.forEach(brick => {
      ctx.fillStyle = brick.color;
      ctx.beginPath(); ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 3); ctx.fill();
    });

    ctx.fillStyle = "#5fe0c9";
    ctx.beginPath(); ctx.roundRect(this.paddleX - paddleWidth / 2, paddleY - paddleHeight / 2, paddleWidth, paddleHeight, 6); ctx.fill();

    if (this.ball) {
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, ballRadius, 0, Math.PI * 2); ctx.fill();
    }
  }
}

const game = new PaddleBallGame();
startBtn.addEventListener("click", () => game.start());
ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
