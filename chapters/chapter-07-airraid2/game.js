/**
 * Chapter 07 · Air Raid 2
 * Portierung von A3GPU207_AirRaid2 (AirRaid2.as, AAGun.as, Bullet.as, Airplane.as)
 *
 * Unterschied zu Chapter 05 "Air Raid": die Kanone bewegt sich nicht mehr
 * seitlich, sondern dreht sich (rotation -170°..-20°), und Kugeln fliegen in
 * genau die Richtung, in die die Kanone gerade zeigt — die erste praktische
 * Anwendung der Trigonometrie aus Chapter 07a.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const GROUND_Y = 360;
const scoreEl = document.getElementById("hud-score");
const shotsEl = document.getElementById("hud-shots");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

function deg2rad(d) { return (d * Math.PI) / 180; }

/* AAGun — jetzt mit Rotation statt X-Bewegung */
class AAGun {
  static rotSpeed = 150.0;
  constructor(game) {
    this.game = game;
    this.x = 275; this.y = 340;
    this.rotation = -90;
  }
  moveGun(dt) {
    let r = this.rotation;
    if (this.game.leftArrow) r -= AAGun.rotSpeed * dt;
    if (this.game.rightArrow) r += AAGun.rotSpeed * dt;
    if (r < -170) r = -170;
    if (r > -20) r = -20;
    this.rotation = r;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = "#3a4657";
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(deg2rad(this.rotation));
    ctx.fillStyle = "#5fe0c9";
    ctx.fillRect(0, -4, 34, 6);
    ctx.restore();
  }
}

/* Airplane — unverändert aus Chapter 05 übernommen */
const PLANE_COLORS = ["#ff6b6b", "#5fe0c9", "#ffb84d", "#a78bfa", "#7cd992"];
class Airplane {
  constructor(game, side, speed, altitude) {
    this.game = game; this.width = 40; this.height = 14;
    this.exploding = false; this.explodeT = 0;
    if (side === "left") { this.x = -50; this.dx = speed; this.flip = -1; }
    else { this.x = 600; this.dx = -speed; this.flip = 1; }
    this.y = altitude;
    this.colorIndex = Math.floor(Math.random() * PLANE_COLORS.length);
  }
  movePlane(dt) {
    if (this.exploding) { this.explodeT += dt; if (this.explodeT > 0.4) this.game.removePlane(this, true); return; }
    this.x += this.dx * dt;
    if ((this.dx < 0) && (this.x < -50)) this.deletePlane();
    else if ((this.dx > 0) && (this.x > 600)) this.deletePlane();
  }
  bounds() { return { x: this.x - this.width / 2, y: this.y - this.height / 2, w: this.width, h: this.height }; }
  planeHit() { this.exploding = true; this.explodeT = 0; this.game.removePlane(this, false); }
  deletePlane() { this.game.removePlane(this, true); }
  draw(ctx) {
    if (this.exploding) {
      const r = 6 + this.explodeT * 60, alpha = Math.max(0, 1 - this.explodeT / 0.4);
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = "#ffb84d";
      ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      return;
    }
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(this.flip, 1);
    ctx.fillStyle = PLANE_COLORS[this.colorIndex];
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(16, -3); ctx.lineTo(20, 0); ctx.lineTo(16, 3); ctx.closePath(); ctx.fill();
    ctx.fillRect(-6, -8, 14, 3); ctx.fillRect(-6, 5, 14, 3);
    ctx.restore();
  }
}

/* Bullet — jetzt mit Richtung statt fester "nach oben"-Bewegung */
class Bullet {
  constructor(game, x, y, rotDeg, speed) {
    this.game = game;
    const initialMove = 35;
    const rad = deg2rad(rotDeg);
    this.x = x + initialMove * Math.cos(rad);
    this.y = y + initialMove * Math.sin(rad);
    this.dx = speed * Math.cos(rad);
    this.dy = speed * Math.sin(rad);
    this.width = 6; this.height = 6;
  }
  moveBullet(dt) {
    this.x += this.dx * dt; this.y += this.dy * dt;
    if (this.y < 0 || this.x < 0 || this.x > W) this.deleteBullet();
  }
  bounds() { return { x: this.x - 3, y: this.y - 3, w: this.width, h: this.height }; }
  deleteBullet() { this.game.removeBullet(this); }
  draw(ctx) { ctx.fillStyle = "#fff3c4"; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); }
}

class AirRaid2Game {
  constructor() {
    this.leftArrow = false; this.rightArrow = false;
    this.state = "intro"; this.lastTime = 0;
    this._loopBound = this.loop.bind(this);
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
  }
  startAirRaid() {
    this.shotsLeft = 20; this.shotsHit = 0; this.showGameScore();
    this.aagun = new AAGun(this);
    this.airplanes = []; this.bullets = []; this._exploding = [];
    this.state = "playing"; overlay.style.display = "none";
    this.setNextPlane();
    this.lastTime = performance.now();
    requestAnimationFrame(this._loopBound);
  }
  setNextPlane() { this.nextPlaneAt = performance.now() + 1000 + Math.random() * 1000; }
  newPlane() {
    const side = Math.random() > 0.5 ? "left" : "right";
    const altitude = Math.random() * 50 + 20;
    const speed = Math.random() * 150 + 150;
    this.airplanes.push(new Airplane(this, side, speed, altitude));
    this.setNextPlane();
  }
  checkForHits() {
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      for (let ai = this.airplanes.length - 1; ai >= 0; ai--) {
        if (rectsHit(this.bullets[bi].bounds(), this.airplanes[ai].bounds())) {
          this.airplanes[ai].planeHit();
          this.bullets[bi].deleteBullet();
          this.shotsHit++; this.showGameScore();
          break;
        }
      }
    }
    if (this.shotsLeft === 0 && this.bullets.length === 0) this.endGame();
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
    this.bullets.push(new Bullet(this, this.aagun.x, this.aagun.y, this.aagun.rotation, 300));
    this.shotsLeft--; this.showGameScore();
  }
  showGameScore() { scoreEl.textContent = `Score: ${this.shotsHit}`; shotsEl.textContent = `Shots Left: ${this.shotsLeft}`; }
  removePlane(plane, removeFromArray) {
    const i = this.airplanes.indexOf(plane);
    if (i !== -1) this.airplanes.splice(i, 1);
    if (!removeFromArray) this._exploding.push(plane);
  }
  removeBullet(bullet) { const i = this.bullets.indexOf(bullet); if (i !== -1) this.bullets.splice(i, 1); }
  endGame() {
    this.state = "gameover";
    overlayText.textContent = `Game Over — Treffer: ${this.shotsHit} / 20`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }
  loop(now) {
    if (this.state !== "playing") return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    if (now >= this.nextPlaneAt) this.newPlane();
    this.aagun.moveGun(dt);
    this.airplanes.forEach(p => p.movePlane(dt));
    this._exploding.forEach(p => p.movePlane(dt));
    this._exploding = this._exploding.filter(p => p.exploding && p.explodeT <= 0.4);
    this.bullets.forEach(b => b.moveBullet(dt));
    this.checkForHits();
    this.render();
    requestAnimationFrame(this._loopBound);
  }
  render() {
    ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#141a22"; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = "#263041"; ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();
    this.bullets.forEach(b => b.draw(ctx));
    this.airplanes.forEach(p => p.draw(ctx));
    this._exploding.forEach(p => p.draw(ctx));
    this.aagun.draw(ctx);
  }
}
function rectsHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

const game = new AirRaid2Game();
startBtn.addEventListener("click", () => { game.startAirRaid(); canvas.focus(); });
ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, W, H);
