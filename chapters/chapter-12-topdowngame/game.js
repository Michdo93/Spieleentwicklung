/**
 * Chapter 12 · Top-Down Game
 * Portierung von A3GPU212_TopDownGame/TopDownDrive.as
 *
 * Ein offenes Fahr-Sammelspiel: Müll aufsammeln, zur passenden Tonne
 * bringen, dabei Hindernisse ("Blocks") umfahren. Der Rechteck-Kollisions-
 * Push-Back-Algorithmus (moveCar) und die Kartengrenzen-Behandlung sind
 * 1:1 aus dem Original übernommen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const VIEW_W = canvas.width, VIEW_H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const timeEl = document.getElementById("hud-time");
const scoreEl = document.getElementById("hud-score");
const onboardEl = document.getElementById("hud-onboard");
const leftEl = document.getElementById("hud-left");

/* Konstanten — 1:1 aus TopDownDrive.as, Karte für die Demo verkleinert */
const speedConst = 0.3;
const turnSpeed = 0.2;
const carSize = 40;
const mapRect = { x: -700, y: -700, w: 1400, h: 1400 };
const numTrashObjects = 60;
const maxCarry = 10;
const pickupDistance = 26;
const dropDistance = 36;

const TRASH_COLORS = ["#ffb84d", "#5fe0c9", "#a78bfa"];

/* ---------------------------------------------------------------- */
/* Eigenes Beispiellevel: Hindernisse und Mülltonnen (ersetzt die   */
/* im Editor platzierten Block-/Trashcan-Symbole)                   */
/* ---------------------------------------------------------------- */
function buildBlocks() {
  return [
    { x: -300, y: -300, w: 140, h: 140 },
    { x: 120, y: -420, w: 200, h: 100 },
    { x: -520, y: 150, w: 120, h: 220 },
    { x: 250, y: 200, w: 180, h: 140 },
    { x: -100, y: 400, w: 260, h: 90 },
    { x: 420, y: -80, w: 100, h: 260 },
  ];
}
function buildTrashcans() {
  return [
    { x: -600, y: -600, type: 0 },
    { x: 600, y: -600, type: 1 },
    { x: 0, y: 620, type: 2 },
  ];
}

/* ---------------------------------------------------------------- */
let audioCtx;
function ensureAudio() { audioCtx ??= new (window.AudioContext || window.webkitAudioContext)(); }
function beep(freq, dur, type = "sine") {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.13, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}

/* ---------------------------------------------------------------- */
class TopDownGame {
  constructor() {
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
  }

  start() {
    this.arrowLeft = this.arrowRight = this.arrowUp = this.arrowDown = false;
    this.blocks = buildBlocks();
    this.trashcans = buildTrashcans();
    this.trashObjects = this.placeTrash();
    this.onboard = [0, 0, 0];
    this.totalOnboard = 0;
    this.score = 0;
    this.car = { x: 0, y: 0, rotation: -90 };
    this.gameStartTime = performance.now();
    this.gameMode = "play";
    overlay.style.display = "none";
    this.showScore();
    beep(500, 0.2);
    requestAnimationFrame(t => this.loop(t));
  }

  placeTrash() {
    const items = [];
    for (let i = 0; i < numTrashObjects; i++) {
      let x, y, onBlock;
      do {
        x = Math.floor(Math.random() * mapRect.w) + mapRect.x;
        y = Math.floor(Math.random() * mapRect.h) + mapRect.y;
        onBlock = this.blocks.some(b => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h);
      } while (onBlock);
      items.push({ x, y, type: Math.floor(Math.random() * 3) });
    }
    return items;
  }

  keyDownFunction(e) {
    if (e.keyCode === 37) { this.arrowLeft = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.arrowRight = true; e.preventDefault(); }
    else if (e.keyCode === 38) { this.arrowUp = true; e.preventDefault(); }
    else if (e.keyCode === 40) { this.arrowDown = true; e.preventDefault(); }
  }
  keyUpFunction(e) {
    if (e.keyCode === 37) this.arrowLeft = false;
    else if (e.keyCode === 39) this.arrowRight = false;
    else if (e.keyCode === 38) this.arrowUp = false;
    else if (e.keyCode === 40) this.arrowDown = false;
  }

  loop(now) {
    if (this.gameMode !== "play") { this.render(); return; }
    if (this.lastTime === undefined || this.lastTime === 0) this.lastTime = now;
    const timeDiff = Math.min(now - this.lastTime, 40);
    this.lastTime = now;

    if (this.arrowLeft) this.car.rotation -= turnSpeed * timeDiff;
    if (this.arrowRight) this.car.rotation += turnSpeed * timeDiff;
    if (this.arrowUp) { this.moveCar(timeDiff); this.checkCollisions(); }

    this.showTime(now);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  // entspricht moveCar() — Rechteck-Push-Back-Kollision, 1:1 aus dem Original
  moveCar(timeDiff) {
    const carRect = { left: this.car.x - carSize / 2, right: this.car.x + carSize / 2, top: this.car.y - carSize / 2, bottom: this.car.y + carSize / 2 };
    const carAngle = (this.car.rotation / 360) * (2.0 * Math.PI);
    const dx = Math.cos(carAngle), dy = Math.sin(carAngle);
    const moveX = dx * speedConst * timeDiff, moveY = dy * speedConst * timeDiff;

    const newCarRect = { left: carRect.left + moveX, right: carRect.right + moveX, top: carRect.top + moveY, bottom: carRect.bottom + moveY };
    let newX = this.car.x + moveX, newY = this.car.y + moveY;

    for (const b of this.blocks) {
      const blockRect = { left: b.x, right: b.x + b.w, top: b.y, bottom: b.y + b.h };
      const intersects = newCarRect.left < blockRect.right && newCarRect.right > blockRect.left && newCarRect.top < blockRect.bottom && newCarRect.bottom > blockRect.top;
      if (intersects) {
        if (carRect.right <= blockRect.left) newX += blockRect.left - newCarRect.right;
        else if (carRect.left >= blockRect.right) newX += blockRect.right - newCarRect.left;
        if (carRect.top >= blockRect.bottom) newY += blockRect.bottom - newCarRect.top;
        else if (carRect.bottom <= blockRect.top) newY += blockRect.top - newCarRect.bottom;
      }
    }

    if (newCarRect.right > mapRect.x + mapRect.w && carRect.right <= mapRect.x + mapRect.w) newX += (mapRect.x + mapRect.w) - newCarRect.right;
    if (newCarRect.left < mapRect.x && carRect.left >= mapRect.x) newX += mapRect.x - newCarRect.left;
    if (newCarRect.top < mapRect.y && carRect.top >= mapRect.y) newY += mapRect.y - newCarRect.top;
    if (newCarRect.bottom > mapRect.y + mapRect.h && carRect.bottom <= mapRect.y + mapRect.h) newY += (mapRect.y + mapRect.h) - newCarRect.bottom;

    this.car.x = newX; this.car.y = newY;
  }

  checkCollisions() {
    for (let i = this.trashObjects.length - 1; i >= 0; i--) {
      const t = this.trashObjects[i];
      if (Math.hypot(this.car.x - t.x, this.car.y - t.y) < pickupDistance) {
        if (this.totalOnboard < maxCarry) {
          this.onboard[t.type]++; this.totalOnboard++;
          this.trashObjects.splice(i, 1);
          this.showScore();
          beep(700, 0.1);
        } else if (this._lastFullObject !== t) {
          beep(180, 0.2, "square");
          this._lastFullObject = t;
        }
      }
    }

    this.trashcans.forEach(can => {
      if (Math.hypot(this.car.x - can.x, this.car.y - can.y) < dropDistance) {
        if (this.onboard[can.type] > 0) {
          this.score += this.onboard[can.type];
          this.totalOnboard -= this.onboard[can.type];
          this.onboard[can.type] = 0;
          this.showScore();
          beep(420, 0.18);
          if (this.score >= numTrashObjects) this.endGame();
        }
      }
    });
  }

  showScore() {
    onboardEl.innerHTML = this.onboard.map((n, i) => `<span style="color:${TRASH_COLORS[i]}">${n}</span>`).join(" · ");
    leftEl.textContent = `Noch auf der Karte: ${this.trashObjects.length}`;
    scoreEl.textContent = `Score: ${this.score} / ${numTrashObjects}`;
  }

  showTime(now) {
    const ms = now - this.gameStartTime;
    let seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    timeEl.textContent = `Time: ${minutes}:${String(seconds + 100).substring(1, 3)}`;
  }

  endGame() {
    this.gameMode = "gameover";
    beep(880, 0.4);
    overlayText.textContent = `Alle Mülltonnen voll! ${timeEl.textContent}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  drawCar() {
    ctx.save();
    ctx.translate(VIEW_W / 2, VIEW_H / 2);
    ctx.rotate((this.car.rotation * Math.PI) / 180);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.moveTo(14, 0); ctx.lineTo(-10, -9); ctx.lineTo(-5, 0); ctx.lineTo(-10, 9);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  render() {
    ctx.fillStyle = "#141a22"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (!this.car) return;
    ctx.save();
    ctx.translate(-this.car.x + VIEW_W / 2, -this.car.y + VIEW_H / 2);

    // Bodenraster
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    const gridStep = 80;
    const startGX = Math.floor((this.car.x - VIEW_W) / gridStep) * gridStep;
    const startGY = Math.floor((this.car.y - VIEW_H) / gridStep) * gridStep;
    for (let gx = startGX; gx < this.car.x + VIEW_W; gx += gridStep) { ctx.beginPath(); ctx.moveTo(gx, this.car.y - VIEW_H); ctx.lineTo(gx, this.car.y + VIEW_H); ctx.stroke(); }
    for (let gy = startGY; gy < this.car.y + VIEW_H; gy += gridStep) { ctx.beginPath(); ctx.moveTo(this.car.x - VIEW_W, gy); ctx.lineTo(this.car.x + VIEW_W, gy); ctx.stroke(); }

    // Kartengrenze
    ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 4;
    ctx.strokeRect(mapRect.x, mapRect.y, mapRect.w, mapRect.h);

    // Hindernisse
    ctx.fillStyle = "#3a4657";
    this.blocks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    // Mülltonnen
    this.trashcans.forEach(can => {
      ctx.fillStyle = TRASH_COLORS[can.type];
      ctx.beginPath(); ctx.roundRect(can.x - 16, can.y - 16, 32, 32, 6); ctx.fill();
      ctx.strokeStyle = "#05070a"; ctx.lineWidth = 2; ctx.strokeRect(can.x - 16, can.y - 16, 32, 32);
    });

    // Müll
    this.trashObjects.forEach(t => {
      ctx.fillStyle = TRASH_COLORS[t.type];
      ctx.beginPath(); ctx.arc(t.x, t.y, 6, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
    this.drawCar();
  }
}

const game = new TopDownGame();
startBtn.addEventListener("click", () => { game.start(); canvas.focus(); });
ctx.fillStyle = "#141a22"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
