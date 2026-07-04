/**
 * Chapter 15 · Apps — Marble Maze
 * Portierung von A3GPU215_Apps/MarbleMaze.as
 *
 * Das Original prüft Accelerometer.isSupported: auf einem Mobilgerät steuert
 * man per Neigen, auf dem Desktop (wo es keinen Beschleunigungssensor gibt)
 * fällt der Code automatisch auf die Pfeiltasten zurück. Genau dasselbe
 * Muster gibt es im Web: die DeviceOrientation-API auf Mobilgeräten (nach
 * Nutzer-Bestätigung auf iOS), Pfeiltasten als Fallback auf dem Desktop.
 * Die Bewegungsphysik (Rechteck-Push-Back gegen Wände und Spielfeldrand)
 * ist 1:1 aus dem Original übernommen — dieselbe Technik wie schon in
 * Top-Down Game (Kapitel 12) und Dungeon 3D (Kapitel 14).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const tiltBtn = document.getElementById("tilt-btn");
const modeEl = document.getElementById("hud-mode");

const speed = 0.3;
const marbleSize = 16;
const mapRect = { left: 4, right: W - 4, top: 4, bottom: H - 4 };

function buildMaze() {
  // Wandsegmente für ein einfaches Slalom-Labyrinth (ersetzt die im
  // Editor platzierten "Block"-Instanzen des Originals)
  return [
    { x: 0, y: 90, w: 250, h: 14 },
    { x: 90, y: 180, w: 250, h: 14 },
    { x: 0, y: 270, w: 250, h: 14 },
    { x: 90, y: 360, w: 250, h: 14 },
  ];
}

class MarbleMaze {
  constructor() {
    this.dx = 0; this.dy = 0;
    window.addEventListener("keydown", e => this.keyDown(e));
    window.addEventListener("keyup", e => this.keyUp(e));

    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
      tiltBtn.style.display = "inline-block";
      tiltBtn.addEventListener("click", () => this.requestTilt());
    } else if (window.DeviceOrientationEvent && matchMedia("(pointer:coarse)").matches) {
      this.enableTilt();
    }
  }

  async requestTilt() {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === "granted") this.enableTilt();
    } catch (err) { /* Nutzer hat abgelehnt, Pfeiltasten bleiben Fallback */ }
    tiltBtn.style.display = "none";
  }

  enableTilt() {
    this.tiltEnabled = true;
    modeEl.textContent = "Steuerung: Neigen";
    window.addEventListener("deviceorientation", e => this.onTilt(e));
  }

  onTilt(e) {
    if (e.gamma == null || e.beta == null) return;
    this.dx = Math.max(-1, Math.min(1, e.gamma / 25));
    this.dy = Math.max(-1, Math.min(1, e.beta / 25));
  }

  keyDown(e) {
    if (this.tiltEnabled) return;
    if (e.keyCode === 37) { this.dx = -0.5; e.preventDefault(); }
    else if (e.keyCode === 39) { this.dx = 0.5; e.preventDefault(); }
    else if (e.keyCode === 38) { this.dy = -0.5; e.preventDefault(); }
    else if (e.keyCode === 40) { this.dy = 0.5; e.preventDefault(); }
  }
  keyUp(e) {
    if (this.tiltEnabled) return;
    if (e.keyCode === 37 || e.keyCode === 39) this.dx = 0;
    else if (e.keyCode === 38 || e.keyCode === 40) this.dy = 0;
  }

  start() {
    this.blocks = buildMaze();
    this.marble = { x: 30, y: 30 };
    this.hole = { x: W - 30, y: H - 30 };
    this.lastTime = 0;
    overlay.style.display = "none";
    if (!this.tiltEnabled) modeEl.textContent = "Steuerung: Pfeiltasten";
    requestAnimationFrame(t => this.loop(t));
  }

  loop(now) {
    if (this.lastTime === 0) this.lastTime = now;
    const timeDiff = Math.min(now - this.lastTime, 40);
    this.lastTime = now;

    this.moveMarble(timeDiff);

    if (Math.hypot(this.marble.x - this.hole.x, this.marble.y - this.hole.y) < 16) this.endGame();

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  // entspricht moveMarble() — Rechteck-Push-Back, 1:1 aus dem Original
  moveMarble(timeDiff) {
    const half = marbleSize / 2;
    const rect = { left: this.marble.x - half, right: this.marble.x + half, top: this.marble.y - half, bottom: this.marble.y + half };
    const moveX = this.dx * speed * timeDiff, moveY = this.dy * speed * timeDiff;
    const newRect = { left: rect.left + moveX, right: rect.right + moveX, top: rect.top + moveY, bottom: rect.bottom + moveY };
    let newX = this.marble.x + moveX, newY = this.marble.y + moveY;

    this.blocks.forEach(b => {
      const blockRect = { left: b.x, right: b.x + b.w, top: b.y, bottom: b.y + b.h };
      const intersects = newRect.left < blockRect.right && newRect.right > blockRect.left && newRect.top < blockRect.bottom && newRect.bottom > blockRect.top;
      if (intersects) {
        if (rect.right <= blockRect.left) { newX += blockRect.left - newRect.right; }
        else if (rect.left >= blockRect.right) { newX += blockRect.right - newRect.left; }
        if (rect.top >= blockRect.bottom) { newY += blockRect.bottom - newRect.top; }
        else if (rect.bottom <= blockRect.top) { newY += blockRect.top - newRect.bottom; }
      }
    });

    if (newRect.right > mapRect.right && rect.right <= mapRect.right) newX += mapRect.right - newRect.right;
    if (newRect.left < mapRect.left && rect.left >= mapRect.left) newX += mapRect.left - newRect.left;
    if (newRect.top < mapRect.top && rect.top >= mapRect.top) newY += mapRect.top - newRect.top;
    if (newRect.bottom > mapRect.bottom && rect.bottom <= mapRect.bottom) newY += mapRect.bottom - newRect.bottom;

    this.marble.x = newX; this.marble.y = newY;
  }

  endGame() {
    overlayText.textContent = "Ziel erreicht!";
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  render() {
    ctx.fillStyle = "#141a22"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#263041"; ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    this.blocks.forEach(b => {
      ctx.fillStyle = "#3a4657";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    ctx.fillStyle = "#05070a";
    ctx.beginPath(); ctx.arc(this.hole.x, this.hole.y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffb84d"; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = "#5fe0c9";
    ctx.beginPath(); ctx.arc(this.marble.x, this.marble.y, marbleSize / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#0a0e14"; ctx.lineWidth = 1.5; ctx.stroke();
  }
}

const game = new MarbleMaze();
startBtn.addEventListener("click", () => { game.start(); canvas.focus(); });
ctx.fillStyle = "#141a22"; ctx.fillRect(0, 0, W, H);
