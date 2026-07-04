/**
 * Chapter 05 · Animation
 * Portierung von A3GPU205_Animation (AnimatedObject.as + AnimationTest.as)
 *
 * Das denkbar einfachste Bewegungsbeispiel: 50 Objekte, jedes mit eigener
 * konstanter Geschwindigkeit, die sich zeitbasiert bewegen — dieselbe
 * getTimer()-Differenz-Technik, die im ganzen Buch (und diesem Repo)
 * immer wieder auftaucht.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

const COLORS = ["#ff6b6b", "#5fe0c9", "#ffb84d", "#a78bfa", "#7cd992"];

// entspricht AnimatedObject — Position + konstante Geschwindigkeit,
// bewegt sich selbst über update(dt)
class AnimatedObject {
  constructor(x, y, dx, dy) {
    this.x = x; this.y = y;
    this.speedX = dx; this.speedY = dy;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.radius = 6 + Math.random() * 6;
  }
  update(dt) {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    // Ergänzung ggü. Original: Objekte tauchen am gegenüberliegenden Rand
    // wieder auf, statt endgültig von der Bühne zu verschwinden — sonst
    // wäre die Demo nach wenigen Sekunden leer.
    if (this.x < -20) this.x = W + 20;
    if (this.x > W + 20) this.x = -20;
    if (this.y < -20) this.y = H + 20;
    if (this.y > H + 20) this.y = -20;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getRandomSpeed() {
  let speed = Math.random() * 70 + 30; // 30..100 px/s, wie im Original (dort 70-100, hier leicht erweitert)
  if (Math.random() > 0.5) speed *= -1;
  return speed;
}

const objects = [];
for (let i = 0; i < 50; i++) {
  objects.push(new AnimatedObject(Math.random() * W, Math.random() * H, getRandomSpeed(), getRandomSpeed()));
}

let lastTime = 0;
function loop(now) {
  if (lastTime === 0) lastTime = now;
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, W, H);
  objects.forEach(o => { o.update(dt); o.draw(ctx); });

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
