/**
 * Chapter 13 · Higher or Lower
 * Portierung von A3GPU213_HigherOrLower/HighLow.as
 *
 * Bewusst simpel gehalten: keine echten Spielkarten mit Farben, sondern
 * 20 nummerierte Karten (numCards=20) — genau wie im Original, das dafür
 * ein eigenes, einfaches "Cards"-Bibliothekssymbol mit 20 Frames benutzte
 * statt eines vollständigen 52-Karten-Decks.
 */

const track = document.getElementById("card-track");
const messageEl = document.getElementById("message");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const btnHigher = document.getElementById("btn-higher");
const btnLower = document.getElementById("btn-lower");

const numCards = 20;

class HighLowGame {
  constructor() {
    btnHigher.addEventListener("click", () => this.guess("higher"));
    btnLower.addEventListener("click", () => this.guess("lower"));
  }

  start() {
    this.cards = [];
    track.innerHTML = "";
    overlay.style.display = "none";
    messageEl.textContent = "Wird die nächste Karte höher oder niedriger sein?";
    this.addCard();
    this.currentCard = this.newCard;
    this.setButtonsEnabled(true);
  }

  addCard() {
    this.newCard = Math.floor(Math.random() * numCards) + 1;
    const el = document.createElement("div");
    el.className = "playing-card";
    el.textContent = this.newCard;
    track.appendChild(el);
    this.cards.push(el);
    track.scrollLeft = track.scrollWidth;
    return el;
  }

  setButtonsEnabled(on) {
    btnHigher.disabled = !on;
    btnLower.disabled = !on;
  }

  guess(choice) {
    this.setButtonsEnabled(false);
    const newEl = this.addCard();

    let correct = true;
    if (choice === "higher" && this.newCard <= this.currentCard) correct = false;
    else if (choice === "lower" && this.newCard >= this.currentCard) correct = false;

    newEl.classList.add(correct ? "correct" : "wrong");

    if (correct) {
      if (this.cards.length === 6) {
        messageEl.textContent = "Alle 6 Karten richtig geraten!";
        this.endGame(true);
      } else {
        this.currentCard = this.newCard;
        messageEl.textContent = "Weiter geht's — höher oder niedriger?";
        this.setButtonsEnabled(true);
      }
    } else {
      messageEl.textContent = `Daneben — ${this.newCard} war nicht ${choice === "higher" ? "höher" : "niedriger"} als ${this.currentCard}.`;
      this.endGame(false);
    }
  }

  endGame(won) {
    overlayText.textContent = won
      ? `Gewonnen! Alle 6 Karten richtig geraten.`
      : `Verloren nach ${this.cards.length - 1} richtigen Karten.`;
    overlay.style.display = "flex";
    startBtn.textContent = "Nochmal spielen";
  }
}

const game = new HighLowGame();
startBtn.addEventListener("click", () => game.start());
