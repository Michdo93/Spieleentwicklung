/**
 * Chapter 12 · Racing Game
 * Portierung von A3GPU212_RacingGame/Racing.as
 *
 * Das Original testete die Straßenbegrenzung mit
 * `road.hitTestPoint(x, y, true)` gegen eine im Flash-Editor gezeichnete
 * Straßengrafik (Alpha-genauer Pixeltest). Canvas hat kein Äquivalent zu
 * BitmapData-Pixeltests eingebaut — der nächste Verwandte ist
 * `ctx.isPointInPath(path, x, y)` gegen einen Vektorpfad, den wir uns
 * selbst bauen. Die restliche Fahrphysik (Beschleunigung, Lenkung,
 * Geschwindigkeitsverlust abseits der Straße) ist 1:1 übernommen.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const VIEW_W = canvas.width, VIEW_H = canvas.height;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const timeEl = document.getElementById("hud-time");
const countdownEl = document.getElementById("countdown");

/* Konstanten — 1:1 aus Racing.as */
const maxSpeed = 0.3;
const accel = 0.0002;
const decel = 0.0003;
const turnSpeed = 0.18;

/* ---------------------------------------------------------------- */
/* Strecke (ersetzt die im Flash-Editor gezeichnete Straßengrafik)   */
/* ---------------------------------------------------------------- */
const OUTER = { x: 80, y: 80, w: 760, h: 560, r: 150 };
const INNER = { x: 250, y: 230, w: 420, h: 260, r: 80 };
const SIDE_MARGIN = 26; // zusätzliche "Seitenstreifen"-Toleranz

function roundedRectPath(r) {
  const p = new Path2D();
  p.moveTo(r.x + r.r, r.y);
  p.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, r.r);
  p.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, r.r);
  p.arcTo(r.x, r.y + r.h, r.x, r.y, r.r);
  p.arcTo(r.x, r.y, r.x + r.w, r.y, r.r);
  p.closePath();
  return p;
}
function expand(r, m) { return { x: r.x - m, y: r.y - m, w: r.w + m * 2, h: r.h + m * 2, r: r.r + m }; }
function shrink(r, m) { return { x: r.x + m, y: r.y + m, w: r.w - m * 2, h: r.h - m * 2, r: Math.max(0, r.r - m) }; }

const roadPath = new Path2D();
roadPath.addPath(roundedRectPath(OUTER));
roadPath.addPath(roundedRectPath(INNER));

const sidePath = new Path2D();
sidePath.addPath(roundedRectPath(expand(OUTER, SIDE_MARGIN)));
sidePath.addPath(roundedRectPath(shrink(INNER, SIDE_MARGIN)));

const START = { x: 460, y: 155 };
const WAYPOINTS = [{ x: 755, y: 360 }, { x: 460, y: 565 }, { x: 165, y: 360 }];

/* ---------------------------------------------------------------- */
/* Synthetische Motorgeräusche (Web Audio) — ersetzt die Original-  */
/* Bibliothekssounds (DriveSound, OffroadSound, SideSound, ...)      */
/* ---------------------------------------------------------------- */
let audioCtx, engineOsc, engineGain;
function ensureAudio() { audioCtx ??= new (window.AudioContext || window.webkitAudioContext)(); }
function beep(freq, dur, type = "sine") {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}
function startEngine() {
  ensureAudio();
  if (engineOsc) return;
  engineOsc = audioCtx.createOscillator();
  engineGain = audioCtx.createGain();
  engineOsc.type = "triangle";
  engineOsc.frequency.value = 90;
  engineGain.gain.value = 0;
  engineOsc.connect(engineGain).connect(audioCtx.destination);
  engineOsc.start();
}
function updateEngine(speedRatio, surface) {
  if (!engineOsc) return;
  engineOsc.frequency.setTargetAtTime(90 + Math.abs(speedRatio) * 260, audioCtx.currentTime, 0.05);
  engineOsc.type = surface === "road" ? "triangle" : "sawtooth";
  engineGain.gain.setTargetAtTime(Math.min(0.09, 0.03 + Math.abs(speedRatio) * 0.08), audioCtx.currentTime, 0.05);
}
function stopEngine() {
  if (!engineOsc) return;
  engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
  const osc = engineOsc, gain = engineGain;
  setTimeout(() => { osc.stop(); }, 300);
  engineOsc = null; engineGain = null;
}

/* ---------------------------------------------------------------- */
class RacingGame {
  constructor() {
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
  }

  startRacing() {
    this.arrowLeft = this.arrowRight = this.arrowUp = this.arrowDown = false;
    this.speed = 0;
    this.gameMode = "wait";
    this.lastTime = 0;
    this.gameStartTime = performance.now() + 3000;
    this.waypointsLeft = WAYPOINTS.map(w => ({ ...w }));
    this.car = { x: START.x, y: START.y, rotation: 0 };
    this.lastCountdownNum = null;
    overlay.style.display = "none";
    countdownEl.textContent = "";
    requestAnimationFrame(t => this.loop(t));
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
    if (this.gameMode === "gameover") { this.render(); return; }
    if (this.lastTime === 0) this.lastTime = now;
    const timeDiff = Math.min(now - this.lastTime, 40);
    this.lastTime = now;

    if (this.gameMode === "race") {
      if (this.arrowLeft) this.car.rotation -= (this.speed + 0.1) * turnSpeed * timeDiff;
      if (this.arrowRight) this.car.rotation += (this.speed + 0.1) * turnSpeed * timeDiff;

      if (this.arrowUp) { this.speed += accel * timeDiff; if (this.speed > maxSpeed) this.speed = maxSpeed; }
      else if (this.arrowDown) { this.speed -= accel * timeDiff; if (this.speed < -maxSpeed) this.speed = -maxSpeed; }
      else if (this.speed > 0) { this.speed -= decel * timeDiff; if (this.speed < 0) this.speed = 0; }
      else if (this.speed < 0) { this.speed += decel * timeDiff; if (this.speed > 0) this.speed = 0; }

      if (this.speed !== 0) {
        this.moveCar(timeDiff);
        this.checkWaypoints();
        this.checkFinishLine();
      } else {
        stopEngine();
      }
    }

    this.showTime(now);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  moveCar(timeDiff) {
    const carAngleRad = (this.car.rotation / 360) * (2.0 * Math.PI);
    const move = this.speed * timeDiff;
    let dx = Math.cos(carAngleRad) * move;
    let dy = Math.sin(carAngleRad) * move;

    const nx = this.car.x + dx, ny = this.car.y + dy;
    let surface = "road";
    if (!ctx.isPointInPath(roadPath, nx, ny, "evenodd")) {
      if (ctx.isPointInPath(sidePath, nx, ny, "evenodd")) {
        surface = "side";
        this.speed *= 1.0 - 0.001 * timeDiff;
      } else {
        surface = "offroad";
        this.speed *= 1.0 - 0.005 * timeDiff;
      }
    }

    this.car.x = nx; this.car.y = ny;

    if (this.arrowUp || this.arrowDown) {
      startEngine();
      updateEngine(this.speed / maxSpeed, surface);
    } else {
      stopEngine();
    }
  }

  checkWaypoints() {
    for (let i = this.waypointsLeft.length - 1; i >= 0; i--) {
      const w = this.waypointsLeft[i];
      if (Math.hypot(w.x - this.car.x, w.y - this.car.y) < 150) this.waypointsLeft.splice(i, 1);
    }
  }

  // Angepasst ggü. Original: statt "car.y < finish.y" (setzt eine bestimmte
  // Streckenausrichtung voraus) wird hier die Nähe zum Startpunkt geprüft —
  // funktional dasselbe Ziel ("eine volle Runde gefahren"), nur an die
  // Donut-Form dieser Strecke angepasst.
  checkFinishLine() {
    if (this.waypointsLeft.length > 0) return;
    if (Math.hypot(START.x - this.car.x, START.y - this.car.y) < 100) this.endGame();
  }

  showTime(now) {
    const gameTime = now - this.gameStartTime;
    if (this.gameMode === "wait") {
      if (gameTime < 0) {
        const newNum = String(Math.abs(Math.floor(gameTime / 1000)));
        if (this.lastCountdownNum !== newNum) {
          this.lastCountdownNum = newNum;
          countdownEl.textContent = newNum;
          beep(300, 0.15);
        }
      } else {
        this.gameMode = "race";
        countdownEl.textContent = "GO!";
        beep(650, 0.3);
        setTimeout(() => { if (this.gameMode === "race") countdownEl.textContent = ""; }, 600);
      }
    } else if (this.gameMode === "race") {
      timeEl.textContent = `Time: ${this.clockTime(gameTime)}`;
    }
  }

  clockTime(ms) {
    let seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${minutes}:${String(seconds + 100).substring(1, 3)}`;
  }

  endGame() {
    stopEngine();
    beep(220, 0.4, "square");
    this.gameMode = "gameover";
    overlayText.textContent = `Ziel! Zeit: ${timeEl.textContent.replace("Time: ", "")}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal fahren";
  }

  drawCar() {
    ctx.save();
    ctx.translate(VIEW_W / 2, VIEW_H / 2 - 25);
    ctx.rotate((this.car.rotation * Math.PI) / 180);
    ctx.fillStyle = "#5fe0c9";
    ctx.beginPath();
    ctx.moveTo(14, 0); ctx.lineTo(-10, -8); ctx.lineTo(-6, 0); ctx.lineTo(-10, 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  render() {
    ctx.fillStyle = "#0a3d1f"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.save();
    ctx.translate(-this.car.x + VIEW_W / 2, -this.car.y + (VIEW_H / 2 - 25));

    ctx.fillStyle = "#3a4657";
    ctx.fill(roadPath, "evenodd");
    ctx.strokeStyle = "#e8edf3"; ctx.lineWidth = 3; ctx.setLineDash([14, 12]);
    ctx.stroke(roundedRectPath({ x: (OUTER.x + INNER.x) / 2, y: (OUTER.y + INNER.y) / 2, w: (OUTER.w + INNER.w) / 2, h: (OUTER.h + INNER.h) / 2, r: (OUTER.r + INNER.r) / 2 }));
    ctx.setLineDash([]);

    // Start/Ziel-Linie
    ctx.fillStyle = "#ffb84d";
    ctx.fillRect(START.x - 4, OUTER.y, 8, INNER.y - OUTER.y);

    // Wegpunkte (zur Orientierung leicht sichtbar)
    this.waypointsLeft.forEach(w => {
      ctx.strokeStyle = "rgba(255,184,77,0.5)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(w.x, w.y, 10, 0, Math.PI * 2); ctx.stroke();
    });

    ctx.restore();
    this.drawCar();
  }
}

const game = new RacingGame();
startBtn.addEventListener("click", () => { game.startRacing(); canvas.focus(); });
ctx.fillStyle = "#0a3d1f"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
