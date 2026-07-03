/**
 * Chapter 08 · Point Burst
 * Portierung von A3GPU208_PointBurst (PointBurst.as + PointBurstExample.as)
 *
 * Eine kleine, wiederverwendbare Komponente: Punktezahl an einer Position
 * einblenden, während der Text größer wird und ausblendet. Wird ab hier in
 * fast jedem punktebasierten Spiel im Buch benutzt (Collapsing Blocks,
 * Match Three, …).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const hint = document.getElementById("hint");

/* entspricht der PointBurst-Klasse: eine sich selbst animierende,
   selbst entfernende Punktezahl-Anzeige */
class PointBurst {
  static animTime = 500;   // ms, entspricht animSteps * animStepTime im Original
  static startScale = 0;
  static endScale = 2.0;

  constructor(pts, x, y) {
    this.text = String(pts);
    this.x = x; this.y = y;
    this.start = performance.now();
    this.done = false;
  }

  update(now) {
    const percentDone = Math.min((now - this.start) / PointBurst.animTime, 1);
    this.scale = (1 - percentDone) * PointBurst.startScale + percentDone * PointBurst.endScale;
    this.alpha = 1 - percentDone;
    if (percentDone >= 1) this.done = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = "#ffb84d";
    ctx.font = "bold 20px 'Space Grotesk'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

const bursts = [];

canvas.addEventListener("click", e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const pts = Math.ceil(Math.random() * 9) * 10; // 10..90, wie zufällige Spielpunkte
  bursts.push(new PointBurst(pts, x, y));
});

function loop(now) {
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#5b6b7d";
  ctx.font = "13px 'JetBrains Mono'";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Irgendwo hinklicken →", 14, 24);

  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].update(now);
    bursts[i].draw(ctx);
    if (bursts[i].done) bursts.splice(i, 1);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
hint.textContent = "Jeder Klick erzeugt eine neue, unabhängige PointBurst-Instanz.";
