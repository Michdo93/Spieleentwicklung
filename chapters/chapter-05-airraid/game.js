/**
 * Chapter 05 · Air Raid
 * Portierung von A3GPU205_AirRaid (AirRaid.as, AAGun.as, Airplane.as, Bullet.as)
 *
 * Bewusst nah an der Original-Klassenaufteilung gehalten:
 * eine JS-"Klasse" pro AS3-Klasse, dieselben Methodennamen, dieselbe
 * zeitbasierte Bewegung (kein Rückgriff auf ENTER_FRAME, sondern
 * requestAnimationFrame + Delta-Zeit — das AS3-Äquivalent von getTimer()).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 550 – wie in AAGun/Airplane-Grenzen im Original
const H = canvas.height;  // 400
const GROUND_Y = 360;

const scoreEl = document.getElementById("hud-score");
const shotsEl = document.getElementById("hud-shots");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

/* ---------------------------------------------------------------- */
/*  AAGun — entspricht AAGun.as                                      */
/* ---------------------------------------------------------------- */
class AAGun {
  static speed = 150.0; // px/s, wie im Original

  constructor(game) {
    this.game = game;
    this.x = 275;
    this.y = 340;
    this.width = 34;
    this.height = 22;
  }

  moveGun(dt) {
    let newx = this.x;
    if (this.game.leftArrow) newx -= AAGun.speed * dt;
    if (this.game.rightArrow) newx += AAGun.speed * dt;
    if (newx < 10) newx = 10;
    if (newx > 540) newx = 540;
    this.x = newx;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    // Lafette
    ctx.fillStyle = "#3a4657";
    ctx.fillRect(-17, 4, 34, 10);
    ctx.beginPath();
    ctx.arc(0, 4, 12, Math.PI, 0);
    ctx.fill();
    // Rohr, zeigt leicht nach oben
    ctx.fillStyle = "#5fe0c9";
    ctx.save();
    ctx.rotate(-0.35);
    ctx.fillRect(0, -4, 26, 6);
    ctx.restore();
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- */
/*  Airplane — entspricht Airplane.as                                 */
/* ---------------------------------------------------------------- */
const PLANE_COLORS = ["#ff6b6b", "#5fe0c9", "#ffb84d", "#a78bfa", "#7cd992"];

class Airplane {
  constructor(game, side, speed, altitude) {
    this.game = game;
    this.width = 40;
    this.height = 14;
    this.exploding = false;
    this.explodeT = 0;

    if (side === "left") {
      this.x = -50;
      this.dx = speed;
      this.flip = -1;
    } else {
      this.x = 600;
      this.dx = -speed;
      this.flip = 1;
    }
    this.y = altitude;
    this.colorIndex = Math.floor(Math.random() * PLANE_COLORS.length);
  }

  movePlane(dt) {
    if (this.exploding) {
      this.explodeT += dt;
      if (this.explodeT > 0.4) this.game.removePlane(this, true);
      return;
    }
    this.x += this.dx * dt;
    if ((this.dx < 0) && (this.x < -50)) this.deletePlane();
    else if ((this.dx > 0) && (this.x > 600)) this.deletePlane();
  }

  bounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, w: this.width, h: this.height };
  }

  planeHit() {
    this.exploding = true;
    this.explodeT = 0;
    this.game.removePlane(this, false); // aus der Kollisionsliste raus, bleibt aber für Explosion sichtbar
  }

  deletePlane() {
    this.game.removePlane(this, true);
  }

  draw(ctx) {
    if (this.exploding) {
      const r = 6 + this.explodeT * 60;
      const alpha = Math.max(0, 1 - this.explodeT / 0.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.flip, 1);
    ctx.fillStyle = PLANE_COLORS[this.colorIndex];
    // simple Flugzeug-Silhouette: Rumpf + Tragflächen
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(16, -3);
    ctx.lineTo(20, 0);
    ctx.lineTo(16, 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-6, -8, 14, 3);
    ctx.fillRect(-6, 5, 14, 3);
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- */
/*  Bullet — entspricht Bullet.as                                     */
/* ---------------------------------------------------------------- */
class Bullet {
  constructor(game, x, y, speed) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.dy = speed; // negativ = nach oben
    this.width = 3;
    this.height = 10;
  }

  moveBullet(dt) {
    this.y += this.dy * dt;
    if (this.y < 0) this.deleteBullet();
  }

  bounds() {
    return { x: this.x - this.width / 2, y: this.y - this.height / 2, w: this.width, h: this.height };
  }

  deleteBullet() {
    this.game.removeBullet(this);
  }

  draw(ctx) {
    ctx.fillStyle = "#fff3c4";
    ctx.fillRect(this.x - 1.5, this.y - 5, 3, 10);
  }
}

/* ---------------------------------------------------------------- */
/*  AirRaid — entspricht AirRaid.as (die "Hauptklasse")               */
/* ---------------------------------------------------------------- */
class AirRaidGame {
  constructor() {
    this.leftArrow = false;
    this.rightArrow = false;
    this.state = "intro"; // intro | playing | gameover
    this.lastTime = 0;
    this._loopBound = this.loop.bind(this);

    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
  }

  startAirRaid() {
    this.shotsLeft = 20;
    this.shotsHit = 0;
    this.showGameScore();

    this.aagun = new AAGun(this);
    this.airplanes = [];
    this.bullets = [];

    this.state = "playing";
    overlay.style.display = "none";

    this.setNextPlane();
    this.lastTime = performance.now();
    requestAnimationFrame(this._loopBound);
  }

  setNextPlane() {
    const delay = 1000 + Math.random() * 1000;
    this.nextPlaneAt = performance.now() + delay;
  }

  newPlane() {
    const side = Math.random() > 0.5 ? "left" : "right";
    const altitude = Math.random() * 50 + 20;
    const speed = Math.random() * 150 + 150;
    const p = new Airplane(this, side, speed, altitude);
    this.airplanes.push(p);
    this.setNextPlane();
  }

  checkForHits() {
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      for (let ai = this.airplanes.length - 1; ai >= 0; ai--) {
        if (rectsHit(this.bullets[bi].bounds(), this.airplanes[ai].bounds())) {
          this.airplanes[ai].planeHit();
          this.bullets[bi].deleteBullet();
          this.shotsHit++;
          this.showGameScore();
          break;
        }
      }
    }
    if (this.shotsLeft === 0 && this.bullets.length === 0) {
      this.endGame();
    }
  }

  keyDownFunction(e) {
    if (this.state !== "playing") return;
    if (e.keyCode === 37) { this.leftArrow = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.rightArrow = true; e.preventDefault(); }
    else if (e.keyCode === 32) { this.fireBullet(); e.preventDefault(); }
  }

  keyUpFunction(e) {
    if (e.keyCode === 37) this.leftArrow = false;
    else if (e.keyCode === 39) this.rightArrow = false;
  }

  fireBullet() {
    if (this.shotsLeft <= 0) return;
    const b = new Bullet(this, this.aagun.x, this.aagun.y, -300);
    this.bullets.push(b);
    this.shotsLeft--;
    this.showGameScore();
  }

  showGameScore() {
    scoreEl.textContent = `Score: ${this.shotsHit}`;
    shotsEl.textContent = `Shots Left: ${this.shotsLeft}`;
  }

  removePlane(plane, removeFromArray) {
    if (removeFromArray) {
      const i = this.airplanes.indexOf(plane);
      if (i !== -1) this.airplanes.splice(i, 1);
    } else {
      const i = this.airplanes.indexOf(plane);
      if (i !== -1) this.airplanes.splice(i, 1);
      // Explosion bleibt separat gezeichnet, bis sie fertig ist
      this._exploding ??= [];
      this._exploding.push(plane);
    }
  }

  removeBullet(bullet) {
    const i = this.bullets.indexOf(bullet);
    if (i !== -1) this.bullets.splice(i, 1);
  }

  endGame() {
    this.state = "gameover";
    overlayText.textContent = `Game Over — Treffer: ${this.shotsHit} / 20`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  loop(now) {
    if (this.state !== "playing") return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Sekunden, gekappt gg. Tab-Wechsel
    this.lastTime = now;

    if (now >= this.nextPlaneAt) this.newPlane();

    this.aagun.moveGun(dt);
    this.airplanes.forEach(p => p.movePlane(dt));
    (this._exploding || []).forEach(p => p.movePlane(dt));
    this._exploding = (this._exploding || []).filter(p => p.exploding && p.explodeT <= 0.4);
    this.bullets.forEach(b => b.moveBullet(dt));

    this.checkForHits();
    this.render();

    requestAnimationFrame(this._loopBound);
  }

  render() {
    ctx.fillStyle = "#0a0e14";
    ctx.fillRect(0, 0, W, H);

    // Sterne/Hintergrund
    ctx.fillStyle = "#1a212b";
    for (let i = 0; i < 24; i++) {
      const sx = (i * 53) % W;
      const sy = (i * 97) % GROUND_Y;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Boden
    ctx.fillStyle = "#141a22";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = "#263041";
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    this.bullets.forEach(b => b.draw(ctx));
    this.airplanes.forEach(p => p.draw(ctx));
    (this._exploding || []).forEach(p => p.draw(ctx));
    this.aagun.draw(ctx);
  }
}

function rectsHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ---------------------------------------------------------------- */
const game = new AirRaidGame();

startBtn.addEventListener("click", () => {
  game.startAirRaid();
  canvas.focus();
});

// Startbildschirm einmal zeichnen
ctx.fillStyle = "#0a0e14";
ctx.fillRect(0, 0, W, H);
