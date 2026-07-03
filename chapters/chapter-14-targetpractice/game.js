/**
 * Chapter 14 · Target Practice
 * Portierung von A3GPU214_TargetPractice/TargetPractice.as
 *
 * Anders als Dungeon 3D/Racing 3D bewegt sich hier die Kamera nicht — nur
 * der Ball fliegt (mit Schwerkraft) durch den 3D-Raum. Dieselbe
 * project()-Funktion aus Chapter 14a übernimmt trotzdem die komplette
 * Darstellung, weil sich beliebige (x,y,z)-Punkte damit projizieren lassen,
 * unabhängig davon, was sich bewegt — Kamera oder Objekt.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const CENTER_X = W / 2, CENTER_Y = H / 2 - 20;
const FOCAL = 320;
const scoreEl = document.getElementById("hud-score");
const hintEl = document.getElementById("hint");

const camera = { x: 275, z: -320, yaw: 0 };
function project(x, y, z) {
  const dx = x - camera.x, dz = z - camera.z;
  const cx = dx, cz = dz; // yaw bleibt bei diesem Spiel konstant 0
  if (cz <= 5) return null;
  const scale = FOCAL / cz;
  return { x: CENTER_X + cx * scale, y: CENTER_Y + y * scale, scale, depth: cz };
}

const GROUND_Y = 350;

class TargetPractice {
  constructor() {
    window.addEventListener("keydown", e => this.keyPressed(e));
  }

  start() {
    this.cannonAngle = -30;
    this.cannonPosition = 275;
    this.ball = null; // null solange nicht abgefeuert
    this.hits = 0;
    this.shots = 0;
    this.setUpTarget();
    this.updateHud();
    requestAnimationFrame(t => this.loop(t));
  }

  setUpTarget() {
    this.target = { x: Math.random() * 400 - 200 + 275, z: Math.random() * 1200 + 600 };
  }

  keyPressed(e) {
    if (e.keyCode === 37) { this.cannonPosition -= 6; e.preventDefault(); }
    else if (e.keyCode === 39) { this.cannonPosition += 6; e.preventDefault(); }
    else if (e.keyCode === 38) { this.cannonAngle -= 1.5; e.preventDefault(); }
    else if (e.keyCode === 40) { this.cannonAngle += 1.5; if (this.cannonAngle > -3) this.cannonAngle = -3; e.preventDefault(); }
    else if (e.keyCode === 32) { this.fireBall(); e.preventDefault(); }
  }

  fireBall() {
    if (this.ball) return; // schon eine Kugel unterwegs
    const f = 15.0;
    const rad = (this.cannonAngle * Math.PI) / 180;
    this.ball = {
      x: this.cannonPosition, y: GROUND_Y, z: 0,
      dy: f * Math.sin(rad), dz: f * Math.cos(rad),
    };
    this.shots++;
    this.updateHud();
  }

  moveBall(dt) {
    if (!this.ball) return;
    const steps = dt * 60; // dieselbe Formel wie im Original, zeitbasiert skaliert
    this.ball.y += this.ball.dy * steps;
    this.ball.z += this.ball.dz * steps;
    this.ball.dy += 0.1 * steps;

    if (this.ball.y > GROUND_Y) {
      const dist = Math.hypot(this.ball.x - this.target.x, this.ball.z - this.target.z);
      if (dist < 50) { this.hits++; this.setUpTarget(); }
      this.ball = null;
      this.updateHud();
    }
  }

  updateHud() { scoreEl.textContent = `Treffer: ${this.hits} / ${this.shots}`; }

  loop(now) {
    if (this.lastTime === undefined) this.lastTime = now;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.moveBall(dt);
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  drawBillboardCircle(x, y, z, radius, color, stroke) {
    const p = project(x, y, z);
    if (!p) return;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, radius * p.scale), 0, Math.PI * 2); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  render() {
    ctx.fillStyle = "#12203a"; ctx.fillRect(0, 0, W, CENTER_Y);
    const grd = ctx.createLinearGradient(0, CENTER_Y, 0, H);
    grd.addColorStop(0, "#0a3d1f"); grd.addColorStop(1, "#062713");
    ctx.fillStyle = grd; ctx.fillRect(0, CENTER_Y, W, H - CENTER_Y);

    // Bodenraster zur Tiefenorientierung
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    for (let z = 0; z <= 1800; z += 150) {
      const pL = project(0, GROUND_Y, z), pR = project(550, GROUND_Y, z);
      if (pL && pR) { ctx.beginPath(); ctx.moveTo(pL.x, pL.y); ctx.lineTo(pR.x, pR.y); ctx.stroke(); }
    }

    // Zielscheibe (Bullseye, mehrere Ringe)
    const t = this.target;
    [50, 34, 18].forEach((r, i) => this.drawBillboardCircle(t.x, GROUND_Y, t.z, r, i % 2 === 0 ? "#ff6b6b" : "#f4f1e8"));

    // Kanonenringe (Flugbahn-Vorschau, wie im Original berechnet)
    const rad = (this.cannonAngle * Math.PI) / 180;
    for (let i = 0; i < 10; i++) {
      const ry = GROUND_Y + 5 * i * Math.sin(rad);
      const rz = 5 * i * Math.cos(rad);
      this.drawBillboardCircle(this.cannonPosition, ry, rz, 5, "rgba(95,224,201,0.7)");
    }

    // Ball + Schatten
    if (this.ball) {
      this.drawBillboardCircle(this.ball.x, GROUND_Y, this.ball.z, 22, "rgba(0,0,0,0.35)");
      this.drawBillboardCircle(this.ball.x, this.ball.y, this.ball.z, 14, "#ffb84d", "#a67432");
    }

    hintEl.textContent = `Winkel: ${Math.round(-this.cannonAngle)}°`;
  }
}

const game = new TargetPractice();
game.start();
canvas.setAttribute("tabindex", "0");
canvas.focus();
