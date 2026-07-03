/**
 * Chapter 14 · 3D Demos
 * Portierung von A3GPU214_Demos (demo1–demo4.fla, reine Timeline-Skripte)
 *
 * Das Original nutzt Flash Players eingebaute "native 3D"-Eigenschaften
 * (DisplayObject.z, rotationX/Y/Z) — der Player übernimmt Projektion und
 * Verdeckung automatisch. Canvas hat kein Äquivalent dafür; die folgenden
 * vier Demos rechnen die Perspektive deshalb von Hand nach, mit derselben
 * einfachen Projektionsformel, die in diesem ganzen Kapitel wiederverwendet
 * wird: scale = focalLength / (focalLength + z).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const buttons = document.querySelectorAll("[data-demo]");
const hint = document.getElementById("hint");

const FOCAL = 300;
function project(x, y, z) {
  const scale = FOCAL / (FOCAL + z);
  return { x: x, y: y, scale };
}
function drawSquare(x, y, z, size = 60, color = "#5fe0c9") {
  const p = project(x, y, z);
  const s = size * p.scale;
  ctx.fillStyle = color;
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  ctx.strokeStyle = "#05070a"; ctx.lineWidth = 2;
  ctx.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
}
// tilt in Grad um die X-Achse als vertikale Stauchung genähert
// (echtes rotationX kippt die Fläche perspektivisch — hier vereinfacht
// über cos(angle) als Höhenfaktor, ohne echten Trapez-Verzug)
function drawTiltedSquare(x, y, z, tiltDeg, size = 60, color = "#ffb84d") {
  const p = project(x, y, z);
  const s = size * p.scale;
  const squish = Math.abs(Math.cos((tiltDeg * Math.PI) / 180));
  ctx.fillStyle = color;
  ctx.fillRect(p.x - s / 2, p.y - (s * squish) / 2, s, s * squish);
  ctx.strokeStyle = "#05070a"; ctx.lineWidth = 2;
  ctx.strokeRect(p.x - s / 2, p.y - (s * squish) / 2, s, s * squish);
}

function clearStage() { ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H); }

/* Demo 1: z allein — weiter weg = kleiner, weiter oben im Fluchtpunkt */
const demo1 = {
  run() {
    clearStage();
    drawSquare(120, 220, 0);
    drawSquare(280, 220, 100, 60, "#5fe0c9");
    drawSquare(430, 220, 200, 60, "#a78bfa");
    hint.textContent = "square.z = 0, 100, 200 — Original nutzt Flash's eingebaute Perspektive automatisch.";
    return null;
  },
};

/* Demo 2: zusätzlich rotationX (Fläche kippt langsam nach hinten) */
const demo2 = {
  run() {
    clearStage();
    drawTiltedSquare(120, 220, 0, 0);
    drawTiltedSquare(280, 220, 0, -30);
    drawTiltedSquare(430, 220, 0, -60);
    hint.textContent = "rotationX = 0°, -30°, -60° — die Fläche kippt zunehmend in den Raum.";
    return null;
  },
};

/* Demo 3: volle 90°-Kippung — wie liegende Bodenfliesen */
const demo3 = {
  run() {
    clearStage();
    drawTiltedSquare(120, 260, 0, -90);
    drawTiltedSquare(280, 290, 60, -90);
    drawTiltedSquare(430, 320, 120, -90);
    hint.textContent = "rotationX = -90° — die Flächen liegen jetzt flach wie ein Boden.";
    return null;
  },
};

/* Demo 4: kontinuierliche Rotation um X, Y und Z gleichzeitig */
const demo4 = {
  run() {
    let angleX = 0, angleY = 0, angleZ = 0;
    let raf;
    const frame = () => {
      clearStage();

      // Quadrat 1: rotiert um X (vertikale Stauchung)
      const s1 = Math.abs(Math.cos((angleX * Math.PI) / 180));
      ctx.save();
      ctx.translate(120, 220);
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(-30, -30 * s1, 60, 60 * s1);
      ctx.restore();

      // Quadrat 2: rotiert um Y (horizontale Stauchung)
      const s2 = Math.abs(Math.cos((angleY * Math.PI) / 180));
      ctx.save();
      ctx.translate(280, 220);
      ctx.fillStyle = "#5fe0c9";
      ctx.fillRect(-30 * s2, -30, 60 * s2, 60);
      ctx.restore();

      // Quadrat 3: rotiert um Z (klassische 2D-Rotation, kein Trick nötig)
      ctx.save();
      ctx.translate(430, 220);
      ctx.rotate((angleZ * Math.PI) / 180);
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(-30, -30, 60, 60);
      ctx.restore();

      angleX += 1; angleY += 1; angleZ += 1;
      raf = requestAnimationFrame(frame);
    };
    frame();
    hint.textContent = "rotationX/Y/Z laufen gleichzeitig weiter (ENTER_FRAME → requestAnimationFrame).";
    return () => cancelAnimationFrame(raf);
  },
};

const DEMOS = { demo1, demo2, demo3, demo4 };
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
load("demo1");
