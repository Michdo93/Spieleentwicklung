/**
 * Chapter 07 · Space Rocks
 * Portierung von A3GPU207_SpaceRocks/SpaceRocks.as — ein Asteroids-Klon.
 * Das komplexeste Spiel in diesem Kapitel und die Zusammenfassung aller
 * bisherigen Trigonometrie-Bausteine: Schiffsrotation, Schub in
 * Blickrichtung, Geschoss-Richtung, Bildschirm-Wrapping.
 *
 * Grafiken (Schiff, Felsen, Schild) gab es im Original als Bibliotheks-
 * symbole. Hier als einfache Vektorformen gezeichnet, Struktur und
 * Spielkonstanten sind 1:1 aus SpaceRocks.as übernommen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const scoreEl = document.getElementById("hud-score");
const livesEl = document.getElementById("hud-lives");
const shieldEl = document.getElementById("hud-shield");
const levelEl = document.getElementById("hud-level");

function deg2rad(d) { return (d * Math.PI) / 180; }

/* Konstanten — aus SpaceRocks.as übernommen, auf echte px/s umgerechnet
   (das Original rechnet in px/ms, hier wird mit dt in Sekunden gearbeitet) */
const shipRotationSpeed = 100;   // Grad/s
const rockSpeedStart = 30;       // px/s
const rockSpeedIncrease = 20;    // px/s pro Level
const missileSpeed = 220;        // px/s
const thrustPower = 140;         // px/s^2
const shipRadius = 16;
const startingShips = 3;
const dragFactor = 0.995;        // leichte Reibung, damit das Schiff nicht ewig gleitet

class SpaceRocksGame {
  constructor() {
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
  }

  startGame() {
    this.gameLevel = 1;
    this.shipsLeft = startingShips;
    this.gameScore = 0;
    this.leftArrow = this.rightArrow = this.upArrow = false;
    this.missiles = [];
    this.gameMode = "delay";
    this.shieldOn = false;
    this.shieldsLeft = 0;
    overlay.style.display = "none";
    this.updateHud();
    this.nextRockWave();
    this.newShip();
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  updateHud() {
    scoreEl.textContent = `Score: ${this.gameScore}`;
    livesEl.textContent = `Ships: ${this.shipsLeft}`;
    shieldEl.textContent = `Shields: ${this.shieldsLeft}`;
    levelEl.textContent = `Level: ${this.gameLevel}`;
  }

  newShip() {
    if (this.shipsLeft < 1) { this.endGame(); return; }
    this.ship = { x: W / 2, y: H / 2, rotation: -90, thrust: false, exploding: false, explodeT: 0 };
    this.shipMoveX = 0; this.shipMoveY = 0;
    this.gameMode = "play";
    this.shieldsLeft = 3;
    if (this.shipsLeft !== startingShips) this.startShield(true);
    this.updateHud();
  }

  keyDownFunction(e) {
    if (this.gameMode === "gameover" || !this.ship) return;
    if (e.keyCode === 37) { this.leftArrow = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.rightArrow = true; e.preventDefault(); }
    else if (e.keyCode === 38) { this.upArrow = true; if (this.gameMode === "play") this.ship.thrust = true; e.preventDefault(); }
    else if (e.keyCode === 32) { this.newMissile(); e.preventDefault(); }
    else if (e.keyCode === 90) { this.startShield(false); }
  }
  keyUpFunction(e) {
    if (e.keyCode === 37) this.leftArrow = false;
    else if (e.keyCode === 39) this.rightArrow = false;
    else if (e.keyCode === 38) { this.upArrow = false; if (this.ship) this.ship.thrust = false; }
  }

  moveShip(dt) {
    if (this.leftArrow) this.ship.rotation -= shipRotationSpeed * dt;
    else if (this.rightArrow) this.ship.rotation += shipRotationSpeed * dt;
    else if (this.upArrow) {
      const rad = deg2rad(this.ship.rotation);
      this.shipMoveX += Math.cos(rad) * thrustPower * dt;
      this.shipMoveY += Math.sin(rad) * thrustPower * dt;
    }
    this.shipMoveX *= dragFactor;
    this.shipMoveY *= dragFactor;
    this.ship.x += this.shipMoveX * dt;
    this.ship.y += this.shipMoveY * dt;
    this.ship.x = wrap(this.ship.x, W);
    this.ship.y = wrap(this.ship.y, H);
  }

  shipHit() {
    this.gameMode = "delay";
    this.ship.exploding = true; this.ship.explodeT = 0;
    this.shieldsLeft = 0;
    this.shipsLeft--;
    this.updateHud();
    setTimeout(() => { this.ship = null; this.newShip(); }, 1400);
  }

  startShield(free) {
    if (this.shieldsLeft < 1) return;
    if (this.shieldOn) return;
    this.shieldOn = true;
    if (!free) { this.shieldsLeft--; this.updateHud(); }
    clearTimeout(this._shieldTimer);
    this._shieldTimer = setTimeout(() => { this.shieldOn = false; }, 3000);
  }

  newRock(x, y, type) {
    const radii = { Big: 34, Medium: 20, Small: 11 };
    const rock = {
      x, y, type, radius: radii[type],
      dx: (Math.random() * 2 - 1), dy: (Math.random() * 2 - 1),
      rotation: 0, dr: (Math.random() - 0.5) * 60,
      sides: 8 + Math.floor(Math.random() * 3),
      jag: Array.from({ length: 11 }, () => 0.75 + Math.random() * 0.5),
    };
    this.rocks.push(rock);
  }

  nextRockWave() {
    this.rocks = [];
    this.newRock(90, 90, "Big");
    this.newRock(90, H - 90, "Big");
    this.newRock(W - 90, 90, "Big");
    this.newRock(W - 90, H - 90, "Big");
    this.gameMode = "play";
  }

  moveRocks(dt) {
    const speedScale = rockSpeedStart + rockSpeedIncrease * this.gameLevel;
    this.rocks.forEach(r => {
      r.x = wrap(r.x + r.dx * speedScale * dt, W);
      r.y = wrap(r.y + r.dy * speedScale * dt, H);
      r.rotation += r.dr * dt;
    });
  }

  rockHit(i) {
    const r = this.rocks[i];
    if (r.type === "Big") { this.newRock(r.x, r.y, "Medium"); this.newRock(r.x, r.y, "Medium"); }
    else if (r.type === "Medium") { this.newRock(r.x, r.y, "Small"); this.newRock(r.x, r.y, "Small"); }
    this.rocks.splice(i, 1);
  }

  newMissile() {
    if (!this.ship || this.gameMode !== "play") return;
    const rad = deg2rad(this.ship.rotation);
    const dx = Math.cos(rad), dy = Math.sin(rad);
    this.missiles.push({ x: this.ship.x + dx * shipRadius, y: this.ship.y + dy * shipRadius, dx, dy });
  }

  moveMissiles(dt) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.x += m.dx * missileSpeed * dt;
      m.y += m.dy * missileSpeed * dt;
      if (m.x < 0 || m.x > W || m.y < 0 || m.y > H) this.missiles.splice(i, 1);
    }
  }

  checkCollisions() {
    for (let j = this.rocks.length - 1; j >= 0; j--) {
      const r = this.rocks[j];
      let rockGone = false;
      for (let i = this.missiles.length - 1; i >= 0; i--) {
        const m = this.missiles[i];
        if (Math.hypot(r.x - m.x, r.y - m.y) < r.radius) {
          this.rockHit(j);
          this.missiles.splice(i, 1);
          this.gameScore += 10;
          this.updateHud();
          rockGone = true;
          break;
        }
      }
      if (rockGone) continue;

      if (this.gameMode === "play" && this.ship && !this.shieldOn) {
        if (Math.hypot(r.x - this.ship.x, r.y - this.ship.y) < r.radius + shipRadius) {
          this.shipHit();
          this.rockHit(j);
        }
      }
    }

    if (this.rocks.length === 0 && this.gameMode === "play") {
      this.gameMode = "betweenlevels";
      this.gameLevel++;
      this.updateHud();
      setTimeout(() => this.nextRockWave(), 1500);
    }
  }

  endGame() {
    this.gameMode = "gameover";
    overlayText.textContent = `Game Over — Score: ${this.gameScore}, erreicht: Level ${this.gameLevel}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (this.gameMode !== "gameover") {
      this.moveRocks(dt);
      if (this.ship && this.gameMode !== "delay") this.moveShip(dt);
      if (this.ship?.exploding) this.ship.explodeT += dt;
      this.moveMissiles(dt);
      if (this.gameMode !== "delay") this.checkCollisions();
      this.render();
      requestAnimationFrame(t => this.loop(t));
    } else {
      this.render();
    }
  }

  drawRock(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(deg2rad(r.rotation));
    ctx.strokeStyle = "#8fa0b3";
    ctx.fillStyle = "rgba(143,160,179,0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < r.sides; i++) {
      const a = (i / r.sides) * Math.PI * 2;
      const rad = r.radius * r.jag[i % r.jag.length];
      const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  drawShip() {
    const s = this.ship;
    if (!s) return;
    if (s.exploding) {
      const r = 6 + s.explodeT * 50;
      const alpha = Math.max(0, 1 - s.explodeT / 1.2);
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = "#ffb84d"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(deg2rad(s.rotation));
    ctx.strokeStyle = "#5fe0c9"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shipRadius, 0);
    ctx.lineTo(-shipRadius * 0.7, -shipRadius * 0.7);
    ctx.lineTo(-shipRadius * 0.3, 0);
    ctx.lineTo(-shipRadius * 0.7, shipRadius * 0.7);
    ctx.closePath();
    ctx.stroke();
    if (s.thrust) {
      ctx.strokeStyle = "#ffb84d";
      ctx.beginPath();
      ctx.moveTo(-shipRadius * 0.3, 0);
      ctx.lineTo(-shipRadius * 1.3, 0);
      ctx.stroke();
    }
    if (this.shieldOn) {
      ctx.strokeStyle = "rgba(95,224,201,0.6)";
      ctx.beginPath(); ctx.arc(0, 0, shipRadius + 8, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  render() {
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
    this.rocks.forEach(r => this.drawRock(r));
    ctx.fillStyle = "#fff3c4";
    this.missiles.forEach(m => { ctx.beginPath(); ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2); ctx.fill(); });
    this.drawShip();
  }
}

function wrap(v, max) {
  const margin = 20;
  if (v < -margin) return max + margin - 1;
  if (v > max + margin) return -margin + 1;
  return v;
}

const game = new SpaceRocksGame();
startBtn.addEventListener("click", () => { game.startGame(); canvas.focus(); });
ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
