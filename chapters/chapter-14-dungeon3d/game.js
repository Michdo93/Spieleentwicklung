/**
 * Chapter 14 · Dungeon 3D
 * Portierung von A3GPU214_Dungeon3D/Dungeon3D.as
 *
 * Das Original ist ein waschechter First-Person-Walker, gebaut komplett
 * mit Flash Players nativer 3D-Engine (viewSprite/worldSprite mit
 * rotationX/Y, z-Sortierung per transform.getRelativeMatrix3D()). Ohne
 * diese Engine übernimmt hier eine von Hand geschriebene
 * Perspektivenprojektion (siehe Chapter 14a) dieselbe Aufgabe — inklusive
 * derselben Rechteck-Kollision, die auch das Top-Down-Spiel aus Kapitel 12
 * benutzt (Blöcke = die "Square"-Objekte des Originals).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const CENTER_X = W / 2, CENTER_Y = H / 2 - 10;
const FOCAL = 280;
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const coinsEl = document.getElementById("hud-coins");

/* ---------------------------------------------------------------- */
function project(x, y, z, camera) {
  const dx = x - camera.x, dz = z - camera.z;
  const yawRad = (camera.yaw * Math.PI) / 180;
  const cos = Math.cos(-yawRad), sin = Math.sin(-yawRad);
  const cx = dx * cos - dz * sin;
  const cz = dx * sin + dz * cos;
  if (cz <= 5) return null;
  const scale = FOCAL / cz;
  return { x: CENTER_X + cx * scale, y: CENTER_Y + y * scale, scale, depth: cz };
}

/* Beispiel-Dungeon: Blöcke (=Original "Square"-Hindernisse) + Münzen     */
function buildDungeon() {
  const blocks = [
    { x: -80, z: 200, w: 160, d: 160 },
    { x: 300, z: 100, w: 140, d: 140 },
    { x: -350, z: 350, w: 120, d: 220 },
    { x: 100, z: 500, w: 200, d: 120 },
    { x: -300, z: -100, w: 150, d: 150 },
  ];
  const coins = [
    { x: 0, z: 60 }, { x: 380, z: 260 }, { x: -280, z: 460 },
    { x: 180, z: 620 }, { x: -420, z: -20 },
  ];
  return { blocks, coins };
}

class Dungeon3D {
  constructor() {
    window.addEventListener("keydown", e => this.keyDown(e));
    window.addEventListener("keyup", e => this.keyUp(e));
  }

  start() {
    const level = buildDungeon();
    this.blocks = level.blocks;
    this.coins = level.coins.map(c => ({ ...c, spin: Math.random() * 360 }));
    this.totalCoins = this.coins.length;
    this.charPos = { x: 0, z: -150 };
    this.dir = 90; // Blickrichtung in Grad
    this.leftArrow = this.rightArrow = this.upArrow = this.downArrow = false;
    overlay.style.display = "none";
    this.updateHud();
    this.lastTime = 0;
    requestAnimationFrame(t => this.loop(t));
  }

  keyDown(e) {
    if (e.keyCode === 37) { this.leftArrow = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.rightArrow = true; e.preventDefault(); }
    else if (e.keyCode === 38) { this.upArrow = true; e.preventDefault(); }
    else if (e.keyCode === 40) { this.downArrow = true; e.preventDefault(); }
  }
  keyUp(e) {
    if (e.keyCode === 37) this.leftArrow = false;
    else if (e.keyCode === 39) this.rightArrow = false;
    else if (e.keyCode === 38) this.upArrow = false;
    else if (e.keyCode === 40) this.downArrow = false;
  }

  loop(now) {
    if (this.lastTime === 0) this.lastTime = now;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    const turnSpeed = 110; // Grad/s
    if (this.leftArrow) this.dir -= turnSpeed * dt;
    if (this.rightArrow) this.dir += turnSpeed * dt;

    const moveSpeed = 220; // Einheiten/s
    let d = 0;
    if (this.upArrow) d = moveSpeed * dt;
    else if (this.downArrow) d = -moveSpeed * dt;
    if (d !== 0) this.movePlayer(d);

    this.coins.forEach(c => (c.spin += 140 * dt));
    this.checkCoins();

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  // entspricht movePlayer() — Rechteck-Push-Back, dasselbe Muster wie
  // TopDownGame.moveCar() in Kapitel 12
  movePlayer(d) {
    const charSize = 50;
    const charRect = { left: this.charPos.x - charSize / 2, right: this.charPos.x + charSize / 2, top: this.charPos.z - charSize / 2, bottom: this.charPos.z + charSize / 2 };
    const angle = (this.dir * Math.PI) / 180;
    const dx = d * Math.cos(angle), dz = d * Math.sin(angle);
    const newRect = { left: charRect.left + dx, right: charRect.right + dx, top: charRect.top + dz, bottom: charRect.bottom + dz };
    let newX = this.charPos.x + dx, newZ = this.charPos.z + dz;

    for (const b of this.blocks) {
      const blockRect = { left: b.x, right: b.x + b.w, top: b.z, bottom: b.z + b.d };
      const intersects = newRect.left < blockRect.right && newRect.right > blockRect.left && newRect.top < blockRect.bottom && newRect.bottom > blockRect.top;
      if (intersects) {
        if (charRect.right <= blockRect.left) newX += blockRect.left - newRect.right;
        else if (charRect.left >= blockRect.right) newX += blockRect.right - newRect.left;
        if (charRect.bottom <= blockRect.top) newZ += blockRect.top - newRect.bottom;
        else if (charRect.top >= blockRect.bottom) newZ += blockRect.bottom - newRect.top;
      }
    }
    this.charPos.x = newX; this.charPos.z = newZ;
  }

  checkCoins() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (Math.hypot(this.charPos.x - c.x, this.charPos.z - c.z) < 55) {
        this.coins.splice(i, 1);
        this.updateHud();
        if (this.coins.length === 0) this.winGame();
      }
    }
  }

  updateHud() { coinsEl.textContent = `Münzen: ${this.totalCoins - this.coins.length} / ${this.totalCoins}`; }

  winGame() {
    overlayText.textContent = "Alle Münzen gefunden!";
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  wallQuad(x1, z1, x2, z2, camera) {
    const topY = -110, botY = 110;
    const p1 = project(x1, topY, z1, camera), p2 = project(x2, topY, z2, camera);
    const p3 = project(x2, botY, z2, camera), p4 = project(x1, botY, z1, camera);
    if (!p1 || !p2 || !p3 || !p4) return null;
    const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
    return { pts: [p1, p2, p3, p4], depth: avgDepth };
  }

  render() {
    const camera = { x: this.charPos.x, z: this.charPos.z, yaw: this.dir };

    // Himmel/Boden
    const grdSky = ctx.createLinearGradient(0, 0, 0, CENTER_Y);
    grdSky.addColorStop(0, "#1a1030"); grdSky.addColorStop(1, "#2a1f45");
    ctx.fillStyle = grdSky; ctx.fillRect(0, 0, W, CENTER_Y);
    const grdFloor = ctx.createLinearGradient(0, CENTER_Y, 0, H);
    grdFloor.addColorStop(0, "#1c1710"); grdFloor.addColorStop(1, "#3a2f1e");
    ctx.fillStyle = grdFloor; ctx.fillRect(0, CENTER_Y, W, H - CENTER_Y);

    // Alle Wandquads sammeln (4 pro Block, wie im Original)
    const quads = [];
    this.blocks.forEach(b => {
      quads.push(this.wallQuad(b.x, b.z, b.x + b.w, b.z, camera));
      quads.push(this.wallQuad(b.x + b.w, b.z, b.x + b.w, b.z + b.d, camera));
      quads.push(this.wallQuad(b.x + b.w, b.z + b.d, b.x, b.z + b.d, camera));
      quads.push(this.wallQuad(b.x, b.z + b.d, b.x, b.z, camera));
    });
    const validQuads = quads.filter(Boolean).sort((a, b) => b.depth - a.depth);
    validQuads.forEach(q => {
      const shade = Math.max(0.35, Math.min(1, 260 / q.depth));
      ctx.fillStyle = `rgba(95,224,201,${shade * 0.5})`;
      ctx.strokeStyle = `rgba(5,7,10,0.8)`;
      ctx.beginPath();
      ctx.moveTo(q.pts[0].x, q.pts[0].y);
      q.pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
    });

    // Münzen als Billboards, nach Tiefe sortiert
    const projectedCoins = this.coins
      .map(c => ({ c, p: project(c.x, -30, c.z, camera) }))
      .filter(o => o.p)
      .sort((a, b) => b.p.depth - a.p.depth);
    projectedCoins.forEach(({ c, p }) => {
      const r = 16 * p.scale * Math.max(0.3, Math.abs(Math.cos((c.spin * Math.PI) / 180)));
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(2, r), 16 * p.scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#a67432"; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
}

const game = new Dungeon3D();
startBtn.addEventListener("click", () => { game.start(); canvas.focus(); });
ctx.fillStyle = "#1a1030"; ctx.fillRect(0, 0, W, H);
