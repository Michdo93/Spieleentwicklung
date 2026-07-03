/**
 * Chapter 13 · Video Poker
 * Portierung von A3GPU213_VideoPoker/VideoPoker.as
 *
 * Die komplette Handbewertung (handValue: Straight, Flush, Paare,
 * Drillinge, ...) und die Auszahlungstabelle (winnings) sind 1:1 aus dem
 * Original übernommen — dieser Teil ist reine Datenverarbeitung und
 * unabhängig davon, wie die Karten gezeichnet werden.
 */

const cardRow = document.getElementById("card-row");
const cashEl = document.getElementById("cash");
const resultEl = document.getElementById("result");
const btnDeal = document.getElementById("btn-deal");
const btnDraw = document.getElementById("btn-draw");
const btnContinue = document.getElementById("btn-continue");
const payoutTable = document.getElementById("payout-table");

const SUITS = { c: { sym: "♣", color: "dark" }, d: { sym: "♦", color: "red" }, h: { sym: "♥", color: "red" }, s: { sym: "♠", color: "dark" } };
function rankLabel(n) { return n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : String(n); }

function renderCard(cardVal) {
  const el = document.createElement("div");
  el.className = "playing-card";
  const suit = cardVal[0];
  const num = parseInt(cardVal.substr(1), 10);
  const s = SUITS[suit];
  el.classList.add(s.color);
  el.innerHTML = `
    <span class="corner top">${rankLabel(num)}<br>${s.sym}</span>
    <span class="pip">${s.sym}</span>
    <span class="corner bottom">${rankLabel(num)}<br>${s.sym}</span>
  `;
  return el;
}

const PAYOUTS = [
  ["Royal Flush", 800], ["Straight Flush", 50], ["Four-Of-A-Kind", 25],
  ["Full House", 8], ["Flush", 5], ["Straight", 4], ["Three-Of-A-Kind", 3],
  ["Two Pair", 2], ["High Pair", 1], ["Low Pair / Nothing", 0],
];

class VideoPokerGame {
  constructor() {
    btnDeal.addEventListener("click", () => this.dealCards());
    btnDraw.addEventListener("click", () => this.drawCards());
    btnContinue.addEventListener("click", () => this.endTurn());
    payoutTable.innerHTML = PAYOUTS.map(([name, val]) => `<div><span>${name}</span><span>${val}x</span></div>`).join("");
  }

  start() {
    this.cash = 100;
    this.bet = 1;
    this.showCash();
    this.createDeck();
    this.startHand();
  }

  createDeck() {
    const suits = ["c", "d", "h", "s"];
    const temp = [];
    for (const suit of suits) for (let num = 1; num < 14; num++) temp.push(suit + num);
    this.deck = [];
    while (temp.length > 0) {
      const r = Math.floor(Math.random() * temp.length);
      this.deck.push(temp[r]);
      temp.splice(r, 1);
    }
  }

  startHand() {
    this.playerHand = [];
    this.playerCardsEls = [];
    this.marked = new Set();
    cardRow.innerHTML = "";
    resultEl.textContent = "Klicke DEAL, um zu starten.";
    btnDeal.style.display = "inline-block";
    btnDraw.style.display = "none";
    btnContinue.style.display = "none";
  }

  dealCards() {
    this.cash -= this.bet;
    this.showCash();
    btnDeal.style.display = "none";

    this.timedEventsList = ["deal", "deal", "deal", "deal", "deal", "end deal"];
    this.startTimedEvents();
  }

  startTimedEvents() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.playTimedEvents(), 220);
  }
  stopTimedEvents() { clearInterval(this.timer); this.timer = null; }

  playTimedEvents() {
    const ev = this.timedEventsList.shift();
    if (ev === "deal") this.dealCard();
    else if (ev === "end deal") { this.stopTimedEvents(); this.waitForDraw(); }
    else if (ev === "draw card") this.drawCard();
    else if (ev === "end draw") { this.stopTimedEvents(); this.drawComplete(); }
  }

  dealCard() {
    const newCardVal = this.deck.pop();
    this.playerHand.push(newCardVal);
    this.showCard(newCardVal);
  }

  showCard(cardVal) {
    const el = renderCard(cardVal);
    const pos = this.playerCardsEls.length;
    el.addEventListener("click", () => this.toggleMark(pos, el));
    cardRow.appendChild(el);
    this.playerCardsEls.push(el);
  }

  waitForDraw() {
    btnDraw.style.display = "inline-block";
    resultEl.textContent = "Klicke Karten an, die du abwerfen willst, dann DRAW.";
  }

  toggleMark(pos, el) {
    if (this.marked.has(pos)) { this.marked.delete(pos); el.classList.remove("marked"); }
    else { this.marked.add(pos); el.classList.add("marked"); }
  }

  drawCards() {
    btnDraw.style.display = "none";
    this.timedEventsList = [];
    this.drawQueue = [...this.marked].sort((a, b) => a - b);
    this.drawQueue.forEach(() => this.timedEventsList.push("draw card"));
    this.timedEventsList.push("end draw");
    this.startTimedEvents();
  }

  drawCard() {
    const pos = this.drawQueue.shift();
    const newCardVal = this.deck.pop();
    this.playerHand[pos] = newCardVal;
    const newEl = renderCard(newCardVal);
    this.playerCardsEls[pos].replaceWith(newEl);
    this.playerCardsEls[pos] = newEl;
  }

  drawComplete() {
    const handVal = this.handValue();
    const win = this.winnings(handVal) * this.bet;
    resultEl.textContent = `${handVal} — Gewinn: $${win}`;
    this.cash += win;
    this.showCash();
    btnContinue.style.display = "inline-block";
  }

  endTurn() {
    if (this.deck.length < 20) this.createDeck();
    this.startHand();
  }

  showCash() { cashEl.textContent = `Cash: $${this.cash}`; }

  // entspricht handValue() — 1:1 aus dem Original
  handValue() {
    const hand = [...this.playerHand].sort((a, b) => parseInt(a.substr(1), 10) - parseInt(b.substr(1), 10));
    const suits = hand.map(c => c[0]);
    const nums = hand.map(c => parseInt(c.substr(1), 10));

    let straight = true;
    for (let i = 0; i < 4; i++) if (nums[i] + 1 !== nums[i + 1]) straight = false;
    if (nums[0] === 1 && nums[1] === 10 && nums[2] === 11 && nums[3] === 12 && nums[4] === 13) straight = true;

    let flush = true;
    for (let i = 1; i < 5; i++) if (suits[i] !== suits[0]) flush = false;

    const counts = new Array(14).fill(0);
    nums.forEach(n => counts[n]++);

    let pair = false, twoPair = false, threeOfAKind = false, fourOfAKind = false;
    for (let i = 1; i < 14; i++) {
      if (counts[i] === 2) { if (pair) twoPair = true; else pair = true; }
      else if (counts[i] === 3) threeOfAKind = true;
      else if (counts[i] === 4) fourOfAKind = true;
    }

    let jackOrHigher = false;
    for (let i = 1; i < 14; i++) if ((i === 1 || i > 10) && counts[i] >= 2) jackOrHigher = true;

    const hasKingAndAce = counts[1] === 1 && counts[13] === 1;

    if (straight && flush && hasKingAndAce) return "Royal Flush";
    if (straight && flush) return "Straight Flush";
    if (fourOfAKind) return "Four-Of-A-Kind";
    if (pair && threeOfAKind) return "Full House";
    if (flush) return "Flush";
    if (straight) return "Straight";
    if (threeOfAKind) return "Three-Of-A-Kind";
    if (twoPair) return "Two Pair";
    if (pair && jackOrHigher) return "High Pair";
    if (pair) return "Low Pair";
    return "Nothing";
  }

  winnings(handVal) {
    const table = { "Royal Flush": 800, "Straight Flush": 50, "Four-Of-A-Kind": 25, "Full House": 8, "Flush": 5, "Straight": 4, "Three-Of-A-Kind": 3, "Two Pair": 2, "High Pair": 1, "Low Pair": 0, "Nothing": 0 };
    return table[handVal] ?? 0;
  }
}

const game = new VideoPokerGame();
game.start();
