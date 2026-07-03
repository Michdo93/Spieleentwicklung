/**
 * Chapter 11 · Platform Game
 * Portierung von A3GPU211_PlatformGame/PlatformGame.as
 *
 * Die komplette Bewegungs-/Kollisionsphysik (moveCharacter, gravity,
 * jumpSpeed, walkSpeed, die zwei Kollisionsschleifen fuer Landen und
 * Wand-Anstossen, scrollWithHero) ist 1:1 aus dem Original uebernommen -
 * inklusive der exakten Konstanten (gravity=.004, jumpSpeed=.8,
 * walkSpeed=.15), weil sie bereits in "Pixel pro Millisekunde" gerechnet
 * sind und sich dadurch unveraendert uebertragen lassen.
 *
 * Das Level selbst gab es im Original als handplatzierte Objekte auf der
 * Flash-Zeitleiste (gamelevel.hero, gamelevel.enemy1, Floor-/Wall-Symbole).
 * Da das keine wiederverwendbaren Daten sind, wurde hier ein eigenes,
 * kleines Beispiellevel von Hand gebaut - mit denselben Objektarten
 * (Floor/Wall, Treasure, Key, Door, Chest, Enemy).
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const VIEW_W = canvas.width, VIEW_H = canvas.height;
const scoreEl = document.getElementById("hud-score");
const livesEl = document.getElementById("hud-lives");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const dialogBox = document.getElementById("dialog");
const dialogText = document.getElementById("dialog-text");
const dialogBtn = document.getElementById("dialog-btn");

/* Konstanten - 1:1 aus PlatformGame.as */
const gravity = 0.004;
const edgeDistance = 100;
const LEVEL_WIDTH = 1450;
const LEVEL_HEIGHT = 400;

/* ---------------------------------------------------------------- */
/* Beispiellevel (ersetzt die handplatzierten Timeline-Objekte)      */
/* ---------------------------------------------------------------- */
function buildLevel() {
  const fixedObjects = [
    { x: 0, y: 360, w: LEVEL_WIDTH, h: 40, kind: "floor" },
    { x: 220, y: 280, w: 120, h: 16, kind: "floor" },
    { x: 480, y: 300, w: 20, h: 60, kind: "wall" },
    { x: 780, y: 300, w: 20, h: 60, kind: "wall" },
    { x: 950, y: 260, w: 120, h: 16, kind: "floor" },
  ].map(o => ({ ...o, leftside: o.x, rightside: o.x + o.w, topside: o.y, bottomside: o.y + o.h }));

  const items = [
    { type: "Treasure", x: 260, y: 260, w: 24, h: 24, points: 100 },
    { type: "Key", x: 1000, y: 220, w: 22, h: 22 },
    { type: "Door", x: 1250, y: 300, w: 30, h: 60, open: false },
    { type: "Chest", x: 1380, y: 330, w: 30, h: 30, open: false },
  ];

  return { fixedObjects, items };
}

/* ---------------------------------------------------------------- */
class PlatformGame {
  constructor() {
    window.addEventListener("keydown", e => this.keyDownFunction(e));
    window.addEventListener("keyup", e => this.keyUpFunction(e));
    dialogBtn.addEventListener("click", () => this.clickDialogButton());
  }

  startPlatformGame() {
    this.gameScore = 0;
    this.playerLives = 3;
    this.playerObjects = [];
    this.gameMode = "play";
    this.lastTime = 0;
    this.cameraX = 0;
    this.bursts = [];
    overlay.style.display = "none";

    const level = buildLevel();
    this.fixedObjects = level.fixedObjects;
    this.items = level.items;

    this.hero = {
      x: 50, y: 300, startx: 50, starty: 300,
      dx: 0, dy: 0, inAir: false, direction: 1,
      animstate: "stand", animstep: 0,
      jump: false, moveLeft: false, moveRight: false,
      jumpSpeed: 0.8, walkSpeed: 0.15, width: 20, height: 40,
    };

    this.enemies = [{
      x: 650, y: 320, dx: 0, dy: 0, inAir: false, direction: 1,
      animstate: "stand", animstep: 0, jump: false,
      moveLeft: false, moveRight: true,
      jumpSpeed: 1.0, walkSpeed: 0.08, width: 26, height: 30,
      patrolLeft: 500, patrolRight: 800,
    }];

    this.addScore(0);
    this.showLives();
    requestAnimationFrame(t => this.loop(t));
  }

  keyDownFunction(e) {
    if (this.gameMode !== "play") return;
    if (e.keyCode === 37) { this.hero.moveLeft = true; e.preventDefault(); }
    else if (e.keyCode === 39) { this.hero.moveRight = true; e.preventDefault(); }
    else if (e.keyCode === 32) { if (!this.hero.inAir) this.hero.jump = true; e.preventDefault(); }
  }
  keyUpFunction(e) {
    if (e.keyCode === 37) this.hero.moveLeft = false;
    else if (e.keyCode === 39) this.hero.moveRight = false;
  }

  loop(now) {
    if (this.lastTime === 0) this.lastTime = now;
    const timeDiff = Math.min(now - this.lastTime, 40);
    this.lastTime = now;

    if (this.gameMode === "play") {
      this.moveCharacter(this.hero, timeDiff);
      this.moveEnemies(timeDiff);
      this.checkCollisions();
      this.scrollWithHero();
    }
    this.render();
    requestAnimationFrame(t => this.loop(t));
  }

  moveEnemies(timeDiff) {
    this.enemies.forEach(enemy => {
      this.moveCharacter(enemy, timeDiff);
      // Vereinfachung ggue. Original: Umkehr an festen Patrouillegrenzen
      // statt physischer Wandkollision (das Beispiellevel hat keine
      // dedizierten Umkehr-Waende) - moveCharacter()s Physik selbst bleibt
      // unveraendert.
      if (enemy.x <= enemy.patrolLeft) { enemy.moveLeft = false; enemy.moveRight = true; }
      else if (enemy.x >= enemy.patrolRight) { enemy.moveLeft = true; enemy.moveRight = false; }
    });
  }

  // entspricht moveCharacter() - 1:1 aus dem Original
  moveCharacter(char, timeDiff) {
    if (timeDiff < 1) return;

    let verticalChange = char.dy * timeDiff + timeDiff * gravity;
    if (verticalChange > 15.0) verticalChange = 15.0;
    char.dy += timeDiff * gravity;

    let horizontalChange = 0;
    let newAnimState = "stand";
    let newDirection = char.direction;
    if (char.moveLeft) { horizontalChange = -char.walkSpeed * timeDiff; newAnimState = "walk"; newDirection = -1; }
    else if (char.moveRight) { horizontalChange = char.walkSpeed * timeDiff; newAnimState = "walk"; newDirection = 1; }
    if (char.jump) {
      char.jump = false;
      char.dy = -char.jumpSpeed;
      verticalChange = -char.jumpSpeed;
      newAnimState = "jump";
    }

    char.hitWallRight = false;
    char.hitWallLeft = false;
    char.inAir = true;

    let newY = char.y + verticalChange;
    for (const f of this.fixedObjects) {
      if (char.x + char.width / 2 > f.leftside && char.x - char.width / 2 < f.rightside) {
        if (char.y <= f.topside && newY > f.topside) {
          newY = f.topside; char.dy = 0; char.inAir = false;
          break;
        }
      }
    }

    let newX = char.x + horizontalChange;
    for (const f of this.fixedObjects) {
      if (newY > f.topside && newY - char.height < f.bottomside) {
        if (char.x - char.width / 2 >= f.rightside && newX - char.width / 2 <= f.rightside) {
          newX = f.rightside + char.width / 2; char.hitWallLeft = true; break;
        }
        if (char.x + char.width / 2 <= f.leftside && newX + char.width / 2 >= f.leftside) {
          newX = f.leftside - char.width / 2; char.hitWallRight = true; break;
        }
      }
    }

    char.x = newX;
    char.y = newY;

    if (char.inAir) newAnimState = "jump";
    char.animstate = newAnimState;
    if (char.animstate === "walk") {
      char.animstep += timeDiff / 60;
    } else {
      char.animstep = 0;
    }
    if (newDirection !== char.direction) char.direction = newDirection;
  }

  scrollWithHero() {
    const stagePosition = this.hero.x - this.cameraX;
    const rightEdge = VIEW_W - edgeDistance;
    const leftEdge = edgeDistance;
    if (stagePosition > rightEdge) {
      this.cameraX += (stagePosition - rightEdge);
      if (this.cameraX > LEVEL_WIDTH - VIEW_W) this.cameraX = LEVEL_WIDTH - VIEW_W;
    }
    if (stagePosition < leftEdge) {
      this.cameraX -= (leftEdge - stagePosition);
      if (this.cameraX < 0) this.cameraX = 0;
    }
  }

  checkCollisions() {
    const hx1 = this.hero.x - this.hero.width / 2, hx2 = this.hero.x + this.hero.width / 2;
    const hy1 = this.hero.y - this.hero.height, hy2 = this.hero.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      const ex1 = en.x - en.width / 2, ex2 = en.x + en.width / 2;
      const ey1 = en.y - en.height, ey2 = en.y;
      if (hx1 < ex2 && hx2 > ex1 && hy1 < ey2 && hy2 > ey1) {
        if (this.hero.inAir && this.hero.dy > 0) this.enemyDie(i);
        else this.heroDie();
      }
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.type === "Door" && it.open) continue;
      if (it.type === "Chest" && it.open) continue;
      const ix1 = it.x, ix2 = it.x + it.w, iy1 = it.y, iy2 = it.y + it.h;
      if (hx1 < ix2 && hx2 > ix1 && hy1 < iy2 && hy2 > iy1) this.getObject(i);
    }
  }

  enemyDie(i) {
    this.spawnBurst("Got 'em!", this.enemies[i].x, this.enemies[i].y - 20);
    this.enemies.splice(i, 1);
  }

  heroDie() {
    this.gameMode = this.playerLives === 0 ? "gameover" : "dead";
    this.showDialog(this.playerLives === 0 ? "Game Over!" : "He Got You!");
    if (this.playerLives > 0) this.playerLives--;
  }

  getObject(i) {
    const it = this.items[i];
    if (it.type === "Treasure") {
      this.spawnBurst(it.points, it.x, it.y);
      this.items.splice(i, 1);
      this.addScore(it.points);
    } else if (it.type === "Key") {
      this.spawnBurst("Got Key!", it.x, it.y);
      this.playerObjects.push("Key");
      this.items.splice(i, 1);
    } else if (it.type === "Door") {
      if (!this.playerObjects.includes("Key")) return;
      if (!it.open) { it.open = true; this.levelComplete(); }
    } else if (it.type === "Chest") {
      it.open = true;
      this.gameComplete();
    }
  }

  addScore(pts) { this.gameScore += pts; scoreEl.textContent = `Score: ${this.gameScore}`; }
  showLives() { livesEl.textContent = `Lives: ${this.playerLives}`; }

  levelComplete() { this.gameMode = "done"; this.showDialog("Level Complete! Auf zur Truhe."); }
  gameComplete() { this.gameMode = "gameover"; this.showDialog("You Got the Treasure!"); }

  showDialog(msg) {
    dialogText.textContent = msg;
    dialogBox.style.display = "flex";
  }

  clickDialogButton() {
    dialogBox.style.display = "none";
    if (this.gameMode === "dead") {
      this.showLives();
      this.hero.x = this.hero.startx;
      this.hero.y = this.hero.starty;
      this.hero.dx = 0; this.hero.dy = 0;
      this.gameMode = "play";
    } else if (this.gameMode === "gameover") {
      overlayText.textContent = `Runde beendet - Score: ${this.gameScore}`;
      overlay.style.display = "flex";
      startBtn.textContent = "Nochmal spielen";
    } else if (this.gameMode === "done") {
      this.gameMode = "play";
    }
    canvas.focus();
  }

  spawnBurst(text, x, y) {
    this.bursts.push({ text: String(text), x, y, start: performance.now(), done: false });
  }

  drawCharacter(ctx, char, color) {
    const sx = char.x - this.cameraX;
    const sy = char.y;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(char.direction, 1);

    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = "round";
    let legOffset = 0;
    if (char.animstate === "walk") legOffset = Math.sin(char.animstep * 3) * 8;
    else if (char.animstate === "jump") legOffset = 6;
    ctx.beginPath();
    ctx.moveTo(-4, -18); ctx.lineTo(-4 - legOffset * 0.4, -2);
    ctx.moveTo(4, -18); ctx.lineTo(4 + legOffset * 0.4, -2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-char.width / 2, -char.height, char.width, char.height - 16, 5);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -char.height + 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#05070a";
    ctx.beginPath();
    ctx.arc(4, -char.height, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawItem(ctx, it) {
    const sx = it.x - this.cameraX;
    if (it.type === "Treasure") {
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath(); ctx.arc(sx + it.w / 2, it.y + it.h / 2, it.w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#a67432"; ctx.lineWidth = 2; ctx.stroke();
    } else if (it.type === "Key") {
      ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx + 6, it.y + 6, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 11, it.y + 10); ctx.lineTo(sx + 22, it.y + 20); ctx.stroke();
    } else if (it.type === "Door") {
      ctx.fillStyle = it.open ? "#3a4657" : "#a67432";
      ctx.fillRect(sx, it.y, it.w, it.h);
      if (!it.open) { ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(sx + it.w - 7, it.y + it.h / 2, 2.5, 0, Math.PI * 2); ctx.fill(); }
    } else if (it.type === "Chest") {
      ctx.fillStyle = it.open ? "#5fe0c9" : "#a67432";
      ctx.beginPath(); ctx.roundRect(sx, it.y, it.w, it.h, 4); ctx.fill();
      ctx.strokeStyle = "#3a4657"; ctx.lineWidth = 2; ctx.strokeRect(sx, it.y, it.w, it.h);
    }
  }

  render() {
    ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = "#141a22";
    for (let i = 0; i < 12; i++) {
      const bx = (i * 140 - this.cameraX * 0.3) % (VIEW_W + 140);
      ctx.fillRect(bx, 60 + (i % 3) * 40, 60, 30);
    }

    this.fixedObjects.forEach(f => {
      const sx = f.x - this.cameraX;
      if (sx + f.w < 0 || sx > VIEW_W) return;
      ctx.fillStyle = f.kind === "wall" ? "#3a4657" : "#263041";
      ctx.fillRect(sx, f.y, f.w, f.h);
      ctx.strokeStyle = "#5b6b7d"; ctx.lineWidth = 1;
      ctx.strokeRect(sx, f.y, f.w, f.h);
    });

    this.items.forEach(it => this.drawItem(ctx, it));
    this.enemies.forEach(en => this.drawCharacter(ctx, en, "#ff6b6b"));
    this.drawCharacter(ctx, this.hero, "#5fe0c9");

    this.bursts.forEach(b => {
      const t = Math.min((performance.now() - b.start) / 600, 1);
      b.done = t >= 1;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = "#ffb84d";
      ctx.font = "bold 14px 'Space Grotesk'";
      ctx.textAlign = "center";
      ctx.fillText(b.text, b.x - this.cameraX, b.y - t * 20);
      ctx.restore();
    });
    this.bursts = this.bursts.filter(b => !b.done);
  }
}

const game = new PlatformGame();
startBtn.addEventListener("click", () => { game.startPlatformGame(); canvas.focus(); });
ctx.fillStyle = "#0a0e14"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
