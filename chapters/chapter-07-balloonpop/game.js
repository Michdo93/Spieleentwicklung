/**
 * Chapter 07 · Balloon Pop
 * Portierung von A3GPU207_BalloonPop/BalloonPop.as
 *
 * Im Original lagen die Ballons als fertig platzierte MovieClip-Instanzen
 * auf der Timeline jedes Levels (per Flash-IDE gezeichnet) und wurden zur
 * Laufzeit mit `getChildAt()`/`is Balloon` eingesammelt. Da es diese
 * Timeline-Platzierung im Web nicht gibt, generiere ich für jedes Level ein
 * eigenes Ballon-Layout per Code.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const scoreEl = document.getElementById("hud-score");
const levelEl = document.getElementById("hud-level");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

function deg2rad(d) { return (d * Math.PI) / 180; }

const BALLOON_COLORS = ["#ff6b6b", "#ffb84d", "#5fe0c9", "#a78bfa", "#7cd992"];
const CANNON_X = 60, CANNON_Y = 340;
const GRAVITY = 220; // px/s^2 (skaliert von AS3s .05/Frame auf echte Sekunden)

// Layouts pro Level — ersetzt die im Original per Flash-IDE platzierten Ballon-Instanzen
function layoutForLevel(level) {
  const layouts = {
    1: [[200, 260], [280, 220], [360, 260], [440, 200], [500, 260]],
    2: [[180, 280], [230, 200], [300, 240], [360, 180], [420, 230], [470, 170], [520, 240], [270, 130]],
    3: [[160, 290], [200, 200], [250, 250], [300, 160], [340, 220], [390, 150], [430, 210],
        [470, 140], [500, 200], [230, 320], [350, 320], [460, 300]],
  };
  return layouts[level] || layouts[1];
}

class Balloon {
  constructor(x, y) {
    this.x = x; this.y = y; this.r = 18;
    this.color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    this.popping = false; this.popT = 0;
  }
  draw(ctx) {
    if (this.popping) {
      const s = 1 + this.popT * 1.8;
      const alpha = Math.max(0, 1 - this.popT / 0.3);
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(this.x, this.y); ctx.scale(s, s);
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * this.r, Math.sin(a) * this.r); ctx.stroke();
      }
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.moveTo(this.x, this.y + this.r * 1.2); ctx.lineTo(this.x, this.y + this.r * 1.2 + 18); ctx.stroke();
    ctx.restore();
  }
  bounds() { return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 }; }
}

class BalloonPopGame {
  constructor() {
    canvas.addEventListener("keydown", () => {});
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
    this.leftArrow = false; this.rightArrow = false;
  }

  startGame() {
    this.gameLevel = 1;
    this.shotsUsed = 0;
    this.speed = 340;
    this.cannonRotation = -55;
    this.state = "playing";
    this.startLevel();
  }

  startLevel() {
    this.balloons = layoutForLevel(this.gameLevel).map(([x, y]) => new Balloon(x, y));
    this.cannonball = null;
    overlay.style.display = "none";
    this.showGameScore();
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  showGameScore() {
    scoreEl.textContent = `Shots: ${this.shotsUsed}`;
    levelEl.textContent = `Level: ${this.gameLevel} / 3`;
  }

  keyDownFunction(e) {
    if (this.state !== "playing") return;
    if (e.keyCode === 37) { this.leftArrow = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.rightArrow = true; e.preventDefault(); }
    else if (e.keyCode === 32) { this.fireCannon(); e.preventDefault(); }
  }
  keyUpFunction(e) {
    if (e.keyCode === 37) this.leftArrow = false;
    else if (e.keyCode === 39) this.rightArrow = false;
  }

  moveCannon(dt) {
    let r = this.cannonRotation;
    if (this.leftArrow) r -= 60 * dt;
    if (this.rightArrow) r += 60 * dt;
    if (r < -90) r = -90;
    if (r > -20) r = -20;
    this.cannonRotation = r;
  }

  fireCannon() {
    if (this.cannonball != null) return;
    this.shotsUsed++; this.showGameScore();
    const rad = deg2rad(this.cannonRotation);
    this.cannonball = {
      x: CANNON_X, y: CANNON_Y,
      dx: this.speed * Math.cos(rad),
      dy: this.speed * Math.sin(rad),
    };
  }

  moveCannonball(dt) {
    if (!this.cannonball) return;
    this.cannonball.x += this.cannonball.dx * dt;
    this.cannonball.y += this.cannonball.dy * dt;
    this.cannonball.dy += GRAVITY * dt;
    if (this.cannonball.y > 340 || this.cannonball.x > W) this.cannonball = null;
  }

  checkForHits() {
    if (!this.cannonball) return;
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      if (b.popping) continue;
      if (Math.hypot(this.cannonball.x - b.x, this.cannonball.y - b.y) < b.r + 4) {
        b.popping = true; b.popT = 0;
        this.cannonball = null;
        break;
      }
    }
  }

  balloonDone(balloon) {
    const i = this.balloons.indexOf(balloon);
    if (i !== -1) this.balloons.splice(i, 1);
    if (this.balloons.length === 0) {
      if (this.gameLevel === 3) this.endGame();
      else this.endLevel();
    }
  }

  endLevel() {
    this.state = "levelover";
    overlayText.textContent = `Level ${this.gameLevel} geschafft! Weiter mit Level ${this.gameLevel + 1}.`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nächstes Level";
    this._nextAction = () => { this.gameLevel++; this.state = "playing"; this.startLevel(); };
  }

  endGame() {
    this.state = "gameover";
    overlayText.textContent = `Alle 3 Level geschafft! Schüsse insgesamt: ${this.shotsUsed}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal von vorne";
    this._nextAction = () => this.startGame();
  }

  loop(now) {
    if (this.state !== "playing") return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.moveCannon(dt);
    this.moveCannonball(dt);
    this.checkForHits();
    this.balloons.forEach(b => {
      if (b.popping) {
        b.popT += dt;
        if (b.popT > 0.3) this.balloonDone(b);
      }
    });

    this.render();
    if (this.state === "playing") requestAnimationFrame(t => this.loop(t));
  }

  render() {
    ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#141a22"; ctx.fillRect(0, 340, W, H - 340);

    this.balloons.forEach(b => b.draw(ctx));

    // Kanone
    ctx.save();
    ctx.translate(CANNON_X, CANNON_Y);
    ctx.fillStyle = "#3a4657";
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(deg2rad(this.cannonRotation));
    ctx.fillStyle = "#5fe0c9";
    ctx.fillRect(0, -4, 30, 8);
    ctx.restore();

    if (this.cannonball) {
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath(); ctx.arc(this.cannonball.x, this.cannonball.y, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

const game = new BalloonPopGame();
startBtn.addEventListener("click", () => {
  if (game._nextAction) { const fn = game._nextAction; game._nextAction = null; fn(); }
  else game.startGame();
  canvas.focus();
});

ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, W, H);
