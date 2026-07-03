/**
 * Chapter 14 · Racing 3D
 * Portierung von A3GPU214_Racing3D/Racing3D.as
 *
 * Dieselbe Straßenform wie in Chapter 12a (Racing Game), diesmal aber aus
 * der Ich-Perspektive gerendert statt von oben. Die Straßen-Erkennung
 * (auf/neben/abseits der Straße) nutzt denselben "abgerundetes Donut"-Test,
 * nur als reine Mathematik statt als Canvas-Pfad — dieselbe Funktion
 * treibt hier sowohl die Physik als auch das Einfärben des Bodens an.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const CENTER_X = W / 2, CENTER_Y = H / 2 - 30;
const FOCAL = 300;
const speedEl = document.getElementById("hud-speed");
const hintEl = document.getElementById("hud-surface");

/* Straßenform — dieselbe Ringstrecke wie in Chapter 12a, hier als reine
   Mathematik statt Canvas-Pfad (wird von Physik UND Rendering benutzt) */
const OUTER = { x: -420, y: -420, w: 840, h: 840, r: 160 };
const INNER = { x: -220, y: -220, w: 440, h: 440, r: 90 };
const SIDE_MARGIN = 28;

function pointInRoundedRect(px, pz, r) {
  const left = r.x, right = r.x + r.w, top = r.y, bottom = r.y + r.h, rad = r.r;
  if (px < left || px > right || pz < top || pz > bottom) return false;
  if (px >= left + rad && px <= right - rad) return true;
  if (pz >= top + rad && pz <= bottom - rad) return true;
  const cx = Math.min(Math.max(px, left + rad), right - rad);
  const cz = Math.min(Math.max(pz, top + rad), bottom - rad);
  return Math.hypot(px - cx, pz - cz) <= rad;
}
function expand(r, m) { return { x: r.x - m, y: r.y - m, w: r.w + m * 2, h: r.h + m * 2, r: r.r + m }; }
function shrink(r, m) { return { x: r.x + m, y: r.y + m, w: r.w - m * 2, h: r.h - m * 2, r: Math.max(0, r.r - m) }; }
const SIDE_OUTER = expand(OUTER, SIDE_MARGIN), SIDE_INNER = shrink(INNER, SIDE_MARGIN);

function surfaceAt(x, z) {
  const onRoad = pointInRoundedRect(x, z, OUTER) && !pointInRoundedRect(x, z, INNER);
  if (onRoad) return "road";
  const onSide = pointInRoundedRect(x, z, SIDE_OUTER) && !pointInRoundedRect(x, z, SIDE_INNER);
  return onSide ? "side" : "offroad";
}

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

function placeTrees(count) {
  const trees = [];
  let attempts = 0;
  while (trees.length < count && attempts++ < 2000) {
    const x = Math.random() * 1100 - 550;
    const z = Math.random() * 1100 - 550;
    if (surfaceAt(x, z) === "offroad" && Math.hypot(x, z) < 600) trees.push({ x, z });
  }
  return trees;
}

class Racing3D {
  constructor() {
    window.addEventListener("keydown", e => this.keyDown(e));
    window.addEventListener("keyup", e => this.keyUp(e));
  }

  start() {
    this.trees = placeTrees(26);
    this.camera = { x: 0, z: -280, yaw: 0 };
    this.speed = 0;
    this.leftArrow = this.rightArrow = this.upArrow = this.downArrow = false;
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

    const maxSpeed = 230, accel = 160, decel = 100, baseTurn = 130;

    if (this.upArrow) { this.speed += accel * dt; if (this.speed > maxSpeed) this.speed = maxSpeed; }
    else { this.speed -= decel * dt; if (this.speed < 0) this.speed = 0; }

    const surface = surfaceAt(this.camera.x, this.camera.z);
    if (surface !== "road") this.speed *= Math.pow(surface === "side" ? 0.97 : 0.9, dt * 60);

    let turn = 0;
    if (this.leftArrow) turn = -baseTurn;
    else if (this.rightArrow) turn = baseTurn;
    if (turn !== 0) this.camera.yaw += Math.min(1, this.speed / maxSpeed + 0.15) * turn * dt;

    if (this.speed > 0) {
      const rad = (this.camera.yaw * Math.PI) / 180;
      this.camera.x += Math.cos(rad) * this.speed * dt;
      this.camera.z += Math.sin(rad) * this.speed * dt;
    }

    speedEl.textContent = `Speed: ${Math.round((this.speed / maxSpeed) * 100)}%`;
    hintEl.textContent = `Untergrund: ${surface === "road" ? "Straße" : surface === "side" ? "Bankett" : "Gelände"}`;

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  render() {
    ctx.fillStyle = "#12203a"; ctx.fillRect(0, 0, W, CENTER_Y);
    ctx.fillStyle = "#0a3d1f"; ctx.fillRect(0, CENTER_Y, W, H - CENTER_Y);

    const camera = this.camera;
    const tiles = [];
    const tileSize = 60;
    for (let x = -540; x <= 540; x += tileSize) {
      for (let z = -540; z <= 540; z += tileSize) {
        const wx = Math.round(camera.x / tileSize) * tileSize + x;
        const wz = Math.round(camera.z / tileSize) * tileSize + z;
        const corners = [
          project(wx, 110, wz, camera), project(wx + tileSize, 110, wz, camera),
          project(wx + tileSize, 110, wz + tileSize, camera), project(wx, 110, wz + tileSize, camera),
        ];
        if (corners.some(c => !c)) continue;
        const depth = corners.reduce((s, c) => s + c.depth, 0) / 4;
        if (depth > 900) continue;
        const surf = surfaceAt(wx + tileSize / 2, wz + tileSize / 2);
        tiles.push({ corners, depth, surf });
      }
    }
    tiles.sort((a, b) => b.depth - a.depth);
    tiles.forEach(t => {
      ctx.fillStyle = t.surf === "road" ? "#3a4657" : t.surf === "side" ? "#5a5030" : "#123018";
      ctx.beginPath();
      ctx.moveTo(t.corners[0].x, t.corners[0].y);
      t.corners.slice(1).forEach(c => ctx.lineTo(c.x, c.y));
      ctx.closePath(); ctx.fill();
    });

    const projectedTrees = this.trees
      .map(tr => ({ tr, p: project(tr.x, 0, tr.z, camera) }))
      .filter(o => o.p)
      .sort((a, b) => b.p.depth - a.p.depth);
    projectedTrees.forEach(({ p }) => {
      const s = 60 * p.scale;
      ctx.fillStyle = "#3a2a18";
      ctx.fillRect(p.x - s * 0.05, p.y - s * 0.3, s * 0.1, s * 0.3);
      ctx.fillStyle = "#2f7d4f";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.45, p.y - s * 0.3);
      ctx.lineTo(p.x - s * 0.45, p.y - s * 0.3);
      ctx.closePath(); ctx.fill();
    });

    // Auto (fest im Bild, wie im Original nahe am Betrachter)
    ctx.save();
    ctx.translate(W / 2, H - 70);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.moveTo(-34, 30); ctx.lineTo(-28, -10); ctx.lineTo(-14, -26); ctx.lineTo(14, -26);
    ctx.lineTo(28, -10); ctx.lineTo(34, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0a0e14";
    ctx.fillRect(-24, -18, 48, 14);
    ctx.restore();
  }
}

const game = new Racing3D();
game.start();
canvas.setAttribute("tabindex", "0");
canvas.focus();
