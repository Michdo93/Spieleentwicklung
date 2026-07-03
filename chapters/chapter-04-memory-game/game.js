/**
 * Chapter 04 · Memory Game
 * Portierung von A3GPU204_MemoryGame/MemoryGame.as — ein "Simon"-Klon.
 *
 * Original: 5 "Light"-Bibliothekssymbole mit 2 Frames (aus/an) pro Farbe.
 * Hier: 5 gezeichnete Kreise, deren Füllung sich beim Aufleuchten ändert.
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const numLights = 5;
const LIGHT_COLORS = ["#ff6b6b", "#ffb84d", "#5fe0c9", "#a78bfa", "#7cd992"];
const lightRadius = 40;
const lightSpacing = 90;
const lightY = 150;
const lightStartX = 70;

const notes = Array.from({ length: 5 }, (_, i) => new Audio(`assets/note${i + 1}.mp3`));
function playNote(i) { notes[i].currentTime = 0; notes[i].play().catch(() => {}); }

class MemoryGame {
  constructor() {
    canvas.addEventListener("click", e => this.handleClick(e));
  }

  start() {
    this.playOrder = [];
    this.repeatOrder = [];
    this.gameMode = "play";
    this.currentSelection = null;
    this.lit = new Array(numLights).fill(false);
    overlay.style.display = "none";
    this.nextTurn();
  }

  nextTurn() {
    const r = Math.floor(Math.random() * numLights);
    this.playOrder.push(r);
    messageEl.textContent = "Zuschauen und zuhören.";
    scoreEl.textContent = `Sequenzlänge: ${this.playOrder.length}`;
    this.playSequence(0);
  }

  playSequence(step) {
    if (step >= this.playOrder.length) {
      this.startPlayerRepeat();
      return;
    }
    this.lightOn(this.playOrder[step]);
    setTimeout(() => this.playSequence(step + 1), 700);
  }

  startPlayerRepeat() {
    this.currentSelection = null;
    messageEl.textContent = "Jetzt du: wiederholen.";
    this.gameMode = "replay";
    this.repeatOrder = [...this.playOrder];
  }

  lightOn(i) {
    playNote(i);
    this.currentSelection = i;
    this.lit[i] = true;
    this.render();
    clearTimeout(this._offTimer);
    this._offTimer = setTimeout(() => this.lightOff(), 400);
  }

  lightOff() {
    if (this.currentSelection !== null) {
      this.lit[this.currentSelection] = false;
      this.currentSelection = null;
      this.render();
    }
  }

  handleClick(e) {
    if (this.gameMode !== "replay") return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (let i = 0; i < numLights; i++) {
      const x = i * lightSpacing + lightStartX;
      if (Math.hypot(mx - x, my - lightY) < lightRadius) {
        this.clickLight(i);
        return;
      }
    }
  }

  clickLight(lightNum) {
    this.lightOff();
    const expected = this.repeatOrder.shift();
    if (lightNum === expected) {
      this.lightOn(lightNum);
      if (this.repeatOrder.length === 0) {
        setTimeout(() => this.nextTurn(), 700);
      }
    } else {
      messageEl.textContent = "Game Over!";
      this.gameMode = "gameover";
      this.endGame();
    }
  }

  endGame() {
    overlayText.textContent = `Game Over — geschaffte Sequenzlänge: ${this.playOrder.length - 1}`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }

  render() {
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < numLights; i++) {
      const x = i * lightSpacing + lightStartX;
      ctx.beginPath();
      ctx.arc(x, lightY, lightRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.lit[i] ? LIGHT_COLORS[i] : "#141a22";
      ctx.fill();
      ctx.strokeStyle = LIGHT_COLORS[i];
      ctx.lineWidth = this.lit[i] ? 4 : 2;
      ctx.stroke();
    }
  }
}

const game = new MemoryGame();
startBtn.addEventListener("click", () => game.start());

ctx.fillStyle = "#05070a";
ctx.fillRect(0, 0, W, H);
for (let i = 0; i < numLights; i++) {
  const x = i * lightSpacing + lightStartX;
  ctx.beginPath();
  ctx.arc(x, lightY, lightRadius, 0, Math.PI * 2);
  ctx.strokeStyle = LIGHT_COLORS[i];
  ctx.lineWidth = 2;
  ctx.stroke();
}
