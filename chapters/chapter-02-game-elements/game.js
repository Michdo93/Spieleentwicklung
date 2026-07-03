/**
 * Chapter 02 · Game Elements
 * Portierung von A3GPU202_GameElements (ca. 28 einzelne FLA-Demos im Original,
 * hier zu 12 thematischen Demos gebündelt — das Original hatte praktisch
 * keinen externen Code, sondern nur Timeline-Frame-Skripte pro FLA).
 *
 * Jede Demo ist ein Objekt { title, as3, run(ctx) -> cleanupFn }.
 * run() bekommt den 2D-Kontext, hängt seine eigenen Listener an window/canvas
 * und liefert eine cleanup()-Funktion zurück, die beim Wechseln der Demo
 * aufgerufen wird (Listener wieder entfernen etc.) — dasselbe Prinzip wie
 * removeEventListener() beim Verlassen eines AS3-Frames.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const outputEl = document.getElementById("output");

function trace(...args) {
  console.log(...args);
  outputEl.textContent += args.join(" ") + "\n";
  outputEl.scrollTop = outputEl.scrollHeight;
}
function clearOutput() { outputEl.textContent = ""; }

function clearStage(bg = "#05070a") {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

// kleiner wiederverwendbarer "Mascot" (das Original benutzte ein Library-Symbol
// namens Mascot in gut einem Drittel der Demos) — hier als gezeichnete Figur
function drawMascot(x, y, opts = {}) {
  const scale = opts.scale ?? 1;
  const rotation = ((opts.rotation ?? 0) * Math.PI) / 180;
  const alpha = opts.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffb84d";
  ctx.beginPath();
  ctx.roundRect(-14, -8, 28, 26, 6);
  ctx.fill();
  ctx.fillStyle = "#5fe0c9";
  ctx.beginPath();
  ctx.arc(0, -18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0e14";
  ctx.beginPath();
  ctx.arc(-4, -19, 2, 0, Math.PI * 2);
  ctx.arc(4, -19, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ================================================================== */
/*  1) Formen & Text zeichnen — DrawingShapes + DrawingText            */
/* ================================================================== */
const demoDrawing = {
  run(ctx) {
    clearStage();
    clearOutput();
    ctx.strokeStyle = "#8fa0b3";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(30, 220);
    ctx.lineTo(70, 260);
    ctx.quadraticCurveTo(110, 300, 150, 260);
    ctx.lineTo(190, 220);
    ctx.stroke();

    ctx.strokeRect(20, 20, 180, 130);
    roundRectPath(ctx, 10, 10, 200, 150, 20);
    ctx.stroke();

    ctx.beginPath(); ctx.arc(90, 60, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(150, 90, 40, 20, 0, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(230, 60, 20, 0, Math.PI * 2); ctx.fill();

    ctx.font = "24px 'Space Grotesk'";
    ctx.fillStyle = "#e8edf3";
    ctx.fillText("Check it out:", 260, 240);

    trace("this.graphics.* → ctx.* : gleiche Grundformen, andere API-Namen.");
    return null;
  },
};
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ================================================================== */
/*  2) Maus — MouseInput                                                */
/* ================================================================== */
const demoMouse = {
  run(ctx) {
    clearStage(); clearOutput();
    let mx = W / 2, my = H / 2, clicks = 0;
    const move = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const click = () => { clicks++; trace("Klick #" + clicks, "bei", Math.round(mx), Math.round(my)); };
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("click", click);

    let raf;
    const frame = () => {
      clearStage();
      drawMascot(mx, my);
      ctx.fillStyle = "#8fa0b3";
      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillText(`mouseX: ${Math.round(mx)}  mouseY: ${Math.round(my)}  clicks: ${clicks}`, 14, 20);
      raf = requestAnimationFrame(frame);
    };
    frame();
    trace("Maus über die Bühne bewegen, klicken für ein Event.");
    return () => { canvas.removeEventListener("mousemove", move); canvas.removeEventListener("click", click); cancelAnimationFrame(raf); };
  },
};

/* ================================================================== */
/*  3) Tastatur — KeyboardInput                                        */
/* ================================================================== */
const demoKeyboard = {
  run(ctx) {
    clearStage(); clearOutput();
    let lastKey = "–", spaceDown = false;
    const down = e => {
      lastKey = e.key === " " ? "Space" : e.key;
      if (e.code === "Space") { spaceDown = true; e.preventDefault(); }
      render();
    };
    const up = e => { if (e.code === "Space") spaceDown = false; render(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    function render() {
      clearStage();
      ctx.fillStyle = "#e8edf3";
      ctx.font = "16px 'JetBrains Mono'";
      ctx.fillText("Key Pressed: " + lastKey, 20, 40);
      ctx.fillStyle = spaceDown ? "#5fe0c9" : "#8fa0b3";
      ctx.fillText("Spacebar is " + (spaceDown ? "DOWN" : "UP") + ".", 20, 70);
    }
    render();
    trace("Beliebige Taste drücken. Leertaste zeigt einen zweiten Zustand.");
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  },
};

/* ================================================================== */
/*  4) Bewegen mit Pfeiltasten — MovingSprites                         */
/* ================================================================== */
const demoMove = {
  run(ctx) {
    clearStage(); clearOutput();
    const pos = { x: W / 2, y: H / 2 };
    const arrows = { left: false, right: false, up: false, down: false };
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const down = e => { if (map[e.key]) { arrows[map[e.key]] = true; e.preventDefault(); } };
    const up = e => { if (map[e.key]) arrows[map[e.key]] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    let raf;
    const speed = 3.2;
    const frame = () => {
      if (arrows.left) pos.x -= speed;
      if (arrows.right) pos.x += speed;
      if (arrows.up) pos.y -= speed;
      if (arrows.down) pos.y += speed;
      pos.x = Math.max(20, Math.min(W - 20, pos.x));
      pos.y = Math.max(20, Math.min(H - 20, pos.y));
      clearStage();
      drawMascot(pos.x, pos.y);
      raf = requestAnimationFrame(frame);
    };
    frame();
    trace("Pfeiltasten bewegen die Figur — jeden Frame um `speed` Pixel.");
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(raf); };
  },
};

/* ================================================================== */
/*  5) Ziehen mit der Maus — DraggingSprites                           */
/* ================================================================== */
const demoDrag = {
  run(ctx) {
    clearStage(); clearOutput();
    const pos = { x: W / 2, y: H / 2 };
    let offset = null;

    const toLocal = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = e => { const p = toLocal(e); if (Math.hypot(p.x - pos.x, p.y - pos.y) < 22) offset = { x: p.x - pos.x, y: p.y - pos.y }; };
    const move = e => { if (offset) { const p = toLocal(e); pos.x = p.x - offset.x; pos.y = p.y - offset.y; } };
    const up = () => { offset = null; };
    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    let raf;
    const frame = () => { clearStage(); drawMascot(pos.x, pos.y, { scale: offset ? 1.1 : 1 }); raf = requestAnimationFrame(frame); };
    frame();
    trace("Auf die Figur klicken und mit gedrückter Maustaste ziehen.");
    return () => {
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf);
    };
  },
};

/* ================================================================== */
/*  6) Zeitbasierte Bewegung & Schwerkraft — Physics/TimeBasedAnimation*/
/* ================================================================== */
const demoPhysics = {
  run(ctx) {
    clearStage(); clearOutput();
    let ball = { x: 40, y: 40, dx: 0.09, dy: -0.25 };
    const gravity = 0.00098;
    let lastTime = performance.now();
    let raf;

    const frame = now => {
      const dt = now - lastTime;
      lastTime = now;
      ball.dy += gravity * dt;
      ball.x += ball.dx * dt;
      ball.y += ball.dy * dt;
      if (ball.y > H - 12) { ball.y = H - 12; ball.dy *= -0.72; }
      if (ball.x > W - 12 || ball.x < 12) ball.dx *= -1;

      clearStage();
      ctx.fillStyle = "#ffb84d";
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5b6b7d";
      ctx.font = "12px 'JetBrains Mono'";
      ctx.fillText("dy += gravity * dt   (gleiche Formel wie im AS3-Original)", 14, H - 12);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    trace("Ball fällt mit konstanter Schwerkraft, prallt am Boden und den Rändern ab.");
    return () => cancelAnimationFrame(raf);
  },
};

/* ================================================================== */
/*  7) Kollisionserkennung — CollisionDetection                         */
/* ================================================================== */
const demoCollision = {
  run(ctx) {
    clearStage(); clearOutput();
    const box = { x: 260, y: 100, w: 120, h: 90 };
    let mx = 0, my = 0;
    const move = e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    canvas.addEventListener("mousemove", move);

    let raf;
    const frame = () => {
      clearStage();
      const starBox = { x: mx - 10, y: my - 10, w: 20, h: 20 };
      const hitPoint = mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h;
      const hitRect = rectsOverlap(starBox, box);

      ctx.strokeStyle = hitPoint ? "#5fe0c9" : "#263041";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = hitRect ? "rgba(95,224,201,0.25)" : "rgba(255,255,255,0.03)";
      ctx.fillRect(box.x, box.y, box.w, box.h);

      ctx.fillStyle = hitRect ? "#5fe0c9" : "#ff6b6b";
      ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.fill();

      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillStyle = "#8fa0b3";
      ctx.fillText("hitTestPoint: " + (hitPoint ? "YES" : "NO"), 14, 20);
      ctx.fillText("hitTestObject: " + (hitRect ? "YES" : "NO"), 14, 38);
      raf = requestAnimationFrame(frame);
    };
    frame();
    trace("Maus über das Rechteck bewegen — Punkt- und Rechteck-Kollision parallel.");
    return () => { canvas.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  },
};
function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

/* ================================================================== */
/*  8) Sprite-Tiefe / Z-Reihenfolge — SettingSpriteDepth                */
/* ================================================================== */
const demoDepth = {
  run(ctx) {
    clearStage(); clearOutput();
    const circles = [
      { x: 220, y: 150, color: "#ff6b6b" },
      { x: 260, y: 150, color: "#5fe0c9" },
      { x: 240, y: 185, color: "#ffb84d" },
    ];
    const click = e => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      for (let i = circles.length - 1; i >= 0; i--) {
        const c = circles[i];
        if (Math.hypot(mx - c.x, my - c.y) < 22) {
          circles.splice(i, 1);
          circles.push(c); // ganz nach oben = wie setChildIndex(..., numChildren-1)
          trace("Kreis nach vorne geholt (letztes Element = oberste Ebene).");
          render();
          break;
        }
      }
    };
    canvas.addEventListener("click", click);
    function render() {
      clearStage();
      circles.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.arc(c.x, c.y, 22, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "#8fa0b3";
      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillText("Zeichenreihenfolge = Array-Reihenfolge. Kreis anklicken.", 14, 20);
    }
    render();
    return () => canvas.removeEventListener("click", click);
  },
};

/* ================================================================== */
/*  9) Timer — UsingTimers + UsingTimers2                               */
/* ================================================================== */
const demoTimer = {
  run(ctx) {
    clearStage(); clearOutput();
    let count = 0;
    const dots = [];
    const id = setInterval(() => {
      dots.push(count * 10 % W);
      count++;
      trace("Timer-Tick #" + count);
      render();
    }, 500);
    function render() {
      clearStage();
      ctx.fillStyle = "#5fe0c9";
      dots.forEach(x => { ctx.beginPath(); ctx.arc(x + 10, 100, 4, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = "#8fa0b3";
      ctx.font = "13px 'JetBrains Mono'";
      ctx.fillText("setInterval(fn, 1000) ≈ AS3 Timer(1000)", 14, 20);
    }
    render();
    return () => clearInterval(id);
  },
};

/* ================================================================== */
/*  10) Zufall & Mischen — RandomNumbers + ShufflingAnArray            */
/* ================================================================== */
const demoRandom = {
  run(ctx) {
    clearStage(); clearOutput();
    let deck = [];
    function redraw() {
      trace("Math.random():", Math.random().toFixed(4));
      trace("Ganzzahl 1–100:", Math.floor(Math.random() * 100) + 1);

      deck = Array.from({ length: 13 }, (_, i) => i + 1);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      trace("Gemischt:", deck.join(", "));
      render();
    }
    function render() {
      clearStage();
      deck.forEach((v, i) => {
        const x = 16 + i * 34;
        ctx.fillStyle = "#12171f";
        ctx.strokeStyle = "#263041";
        ctx.beginPath(); ctx.roundRect(x, 40, 28, 40, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffb84d";
        ctx.font = "14px 'JetBrains Mono'";
        ctx.fillText(String(v), x + 8, 60);
      });
      ctx.fillStyle = "#8fa0b3";
      ctx.font = "12px 'JetBrains Mono'";
      ctx.fillText("Fisher-Yates-Mischen — dasselbe Prinzip wie im AS3-Original.", 14, 120);
    }
    redraw();
    document.getElementById("action-btn").style.display = "inline-block";
    document.getElementById("action-btn").textContent = "Neu mischen";
    const onClick = () => redraw();
    document.getElementById("action-btn").addEventListener("click", onClick);
    return () => {
      document.getElementById("action-btn").style.display = "none";
      document.getElementById("action-btn").removeEventListener("click", onClick);
    };
  },
};

/* ================================================================== */
/*  11) Sounds abspielen — PlayingSounds                                */
/* ================================================================== */
const demoSound = {
  run(ctx) {
    clearStage(); clearOutput();
    ctx.fillStyle = "#8fa0b3";
    ctx.font = "13px 'JetBrains Mono'";
    ctx.fillText("Zwei Buttons unten: synthetischer Ton vs. geladene mp3-Datei.", 14, 20);

    const btnRow = document.getElementById("sound-buttons");
    btnRow.style.display = "flex";
    const b1 = document.getElementById("sound-lib-btn");
    const b2 = document.getElementById("sound-ext-btn");

    let audioCtx;
    const playTone = () => {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
      trace("Synthetischer Ton gespielt (entspricht dem Library-Sound-Symbol im Original).");
    };
    const external = new Audio("assets/PlayingSounds.mp3");
    const playExternal = () => { external.currentTime = 0; external.play(); trace("Externe PlayingSounds.mp3 abgespielt (Original-Asset)."); };

    b1.addEventListener("click", playTone);
    b2.addEventListener("click", playExternal);

    return () => {
      btnRow.style.display = "none";
      b1.removeEventListener("click", playTone);
      b2.removeEventListener("click", playExternal);
    };
  },
};

/* ================================================================== */
/*  12) Texteingabe — TextInput                                         */
/* ================================================================== */
const demoTextInput = {
  run(ctx) {
    clearStage(); clearOutput();
    ctx.fillStyle = "#8fa0b3";
    ctx.font = "13px 'JetBrains Mono'";
    ctx.fillText("Eingabefeld unten, Enter bestätigt (wie KEY_UP + charCode 13 im Original).", 14, 20);

    const wrap = document.getElementById("text-input-wrap");
    const input = document.getElementById("text-input-field");
    wrap.style.display = "block";
    input.value = "";
    input.focus();
    const onKey = e => {
      if (e.key === "Enter") {
        trace("Eingabe akzeptiert:", input.value);
        input.value = "";
      }
    };
    input.addEventListener("keyup", onKey);
    return () => { wrap.style.display = "none"; input.removeEventListener("keyup", onKey); };
  },
};

/* ================================================================== */
const DEMOS = {
  drawing: { label: "1 · Formen & Text", demo: demoDrawing },
  mouse: { label: "2 · Maus", demo: demoMouse },
  keyboard: { label: "3 · Tastatur", demo: demoKeyboard },
  move: { label: "4 · Bewegen", demo: demoMove },
  drag: { label: "5 · Ziehen", demo: demoDrag },
  physics: { label: "6 · Physik & Zeit", demo: demoPhysics },
  collision: { label: "7 · Kollision", demo: demoCollision },
  depth: { label: "8 · Tiefe/Z-Order", demo: demoDepth },
  timer: { label: "9 · Timer", demo: demoTimer },
  random: { label: "10 · Zufall/Mischen", demo: demoRandom },
  sound: { label: "11 · Sound", demo: demoSound },
  textinput: { label: "12 · Texteingabe", demo: demoTextInput },
};

let currentCleanup = null;
function loadDemo(key) {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  document.getElementById("action-btn").style.display = "none";
  document.getElementById("sound-buttons").style.display = "none";
  document.getElementById("text-input-wrap").style.display = "none";
  currentCleanup = DEMOS[key].demo.run(ctx) || null;
}

const btnRow = document.getElementById("demo-buttons");
Object.entries(DEMOS).forEach(([key, { label }]) => {
  const b = document.createElement("button");
  b.className = "btn ghost";
  b.textContent = label;
  b.dataset.key = key;
  b.addEventListener("click", () => {
    btnRow.querySelectorAll("button").forEach(x => x.classList.remove("btn-active"));
    b.classList.add("btn-active");
    loadDemo(key);
  });
  btnRow.appendChild(b);
});
btnRow.firstChild.classList.add("btn-active");
loadDemo("drawing");
