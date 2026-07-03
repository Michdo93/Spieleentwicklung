/**
 * Chapter 07 · Rotation Math
 * Portierung von A3GPU207_RotationMath (PointingArrow.as, MovingCar.as)
 *
 * Die Trigonometrie-Grundlagen, die AirRaid 2, Balloon Pop und Space Rocks
 * alle in unterschiedlicher Form benutzen: Grad ↔ Radiant umrechnen,
 * einen Winkel aus einer Richtung berechnen (atan2), einen Bewegungsvektor
 * aus einem Winkel berechnen (cos/sin).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const buttons = document.querySelectorAll("[data-demo]");
const hint = document.getElementById("hint");

function deg2rad(d) { return (d * Math.PI) / 180; }
function rad2deg(r) { return (r * 180) / Math.PI; }

function drawArrow(x, y, angleDeg, len, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(deg2rad(angleDeg));
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  ctx.lineTo(len / 2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(len / 2, 0);
  ctx.lineTo(len / 2 - 10, -6);
  ctx.lineTo(len / 2 - 10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------------- */
/* Demo 1: PointingArrow — atan2() zeigt auf den Cursor               */
/* ---------------------------------------------------------------- */
const demoPointer = {
  run() {
    hint.textContent = "Maus bewegen — der Pfeil dreht sich per atan2() zum Cursor.";
    const cx = W / 2, cy = H / 2;
    let mx = cx + 100, my = cy;
    const move = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    canvas.addEventListener("mousemove", move);

    let raf;
    const frame = () => {
      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, W, H);

      const dx = mx - cx, dy = my - cy;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = rad2deg(angleRad);

      drawArrow(cx, cy, angleDeg, 70, "#ffb84d");
      ctx.fillStyle = "#5fe0c9";
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#8fa0b3";
      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillText(`Math.atan2(dy, dx) = ${angleDeg.toFixed(1)}°`, 14, 24);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { canvas.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  },
};

/* ---------------------------------------------------------------- */
/* Demo 2: MovingCar — Pfeiltasten drehen + Vektorbewegung           */
/* ---------------------------------------------------------------- */
const demoCar = {
  run() {
    hint.textContent = "← → drehen, ↑ beschleunigt in Blickrichtung.";
    let rotation = -90, x = W / 2, y = H / 2;
    const arrows = { left: false, right: false, up: false };
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up" };
    const down = e => { if (map[e.key]) { arrows[map[e.key]] = true; e.preventDefault(); } };
    const up = e => { if (map[e.key]) arrows[map[e.key]] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let raf;
    const frame = () => {
      if (arrows.left) rotation -= 3;
      if (arrows.right) rotation += 3;
      if (arrows.up) {
        const speed = 2.4;
        const angle = deg2rad(rotation);
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
        x = Math.max(20, Math.min(W - 20, x));
        y = Math.max(20, Math.min(H - 20, y));
      }

      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, W, H);
      drawArrow(x, y, rotation, 34, "#5fe0c9");
      ctx.fillStyle = "#8fa0b3";
      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillText(`rotation = ${rotation.toFixed(0)}°   dx = cos(a)·speed   dy = sin(a)·speed`, 14, 24);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(raf); };
  },
};

const DEMOS = { pointer: demoPointer, car: demoCar };
let cleanup = null;
function load(key) {
  if (cleanup) cleanup();
  cleanup = DEMOS[key].run() || null;
}
buttons.forEach(b => b.addEventListener("click", () => {
  buttons.forEach(x => x.classList.remove("btn-active"));
  b.classList.add("btn-active");
  load(b.dataset.demo);
}));
load("pointer");
