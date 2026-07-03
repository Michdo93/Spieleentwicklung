/**
 * Chapter 13 · Blackjack
 * Portierung von A3GPU213_Blackjack/Blackjack.as
 *
 * Kartenwerte werden — wie im Original — als kurze Strings kodiert
 * ("h1" = Herz Ass, "s13" = Pik König). Karten wurden im Original als
 * Bibliothekssymbol mit 52 Frames + "back" gezeichnet; hier als HTML-
 * Elemente mit Rang/Symbol gerendert. Die komplette Spiellogik
 * (Deck erzeugen, Timed-Event-Queue, Handwert-Berechnung inkl. Ass,
 * Dealer-KI, Gewinnermittlung) ist 1:1 aus dem Original übernommen.
 */

const dealerRow = document.getElementById("dealer-row");
const playerRow = document.getElementById("player-row");
const dealerValueEl = document.getElementById("dealer-value");
const playerValueEl = document.getElementById("player-value");
const cashEl = document.getElementById("cash");
const betEl = document.getElementById("bet");
const resultEl = document.getElementById("result");
const btnAddBet = document.getElementById("btn-addbet");
const btnDeal = document.getElementById("btn-deal");
const btnHit = document.getElementById("btn-hit");
const btnStay = document.getElementById("btn-stay");
const btnContinue = document.getElementById("btn-continue");

const SUITS = { c: { sym: "♣", color: "dark" }, d: { sym: "♦", color: "red" }, s: { sym: "♠", color: "dark" }, h: { sym: "♥", color: "red" } };
function rankLabel(n) { return n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : String(n); }

function renderCard(cardVal, faceDown = false) {
  const el = document.createElement("div");
  el.className = "playing-card" + (faceDown ? " face-down" : "");
  if (faceDown) { el.innerHTML = `<div class="card-back"></div>`; return el; }
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

class BlackjackGame {
  constructor() {
    btnAddBet.addEventListener("click", () => this.addToBet());
    btnDeal.addEventListener("click", () => this.dealCards());
    btnHit.addEventListener("click", () => this.hit());
    btnStay.addEventListener("click", () => this.stay());
    btnContinue.addEventListener("click", () => this.newDeal());
  }

  start() {
    this.cash = 100;
    this.showCash();
    this.createDeck();
    this.startHand();
  }

  createDeck() {
    const suits = ["c", "d", "s", "h"];
    const temp = [];
    for (let i = 0; i < 6; i++)
      for (const suit of suits)
        for (let num = 1; num < 14; num++) temp.push(suit + num);

    this.deck = [];
    while (temp.length > 0) {
      const r = Math.floor(Math.random() * temp.length);
      this.deck.push(temp[r]);
      temp.splice(r, 1);
    }
  }

  startHand() {
    this.playerHand = []; this.dealerHand = [];
    this.playerCardsEls = []; this.dealerCardsEls = [];
    dealerRow.innerHTML = ""; playerRow.innerHTML = "";
    playerValueEl.textContent = ""; dealerValueEl.textContent = "";
    this.bet = 5;
    this.showBet();
    btnAddBet.style.display = "inline-block";
    btnDeal.style.display = "inline-block";
    btnHit.style.display = "none";
    btnStay.style.display = "none";
    btnContinue.style.display = "none";
    resultEl.textContent = "Setze deinen Einsatz, dann klicke auf Deal.";
  }

  addToBet() {
    this.bet += 5;
    if (this.bet > 25) this.bet = 25;
    this.showBet();
  }

  dealCards() {
    this.cash -= this.bet;
    this.showCash();
    btnAddBet.style.display = "none";
    btnDeal.style.display = "none";

    this.timedEventsList = ["deal card to dealer", "deal card to player", "deal card to dealer", "deal card to player", "end deal"];
    this.startTimedEvents();
  }

  startTimedEvents() {
    clearInterval(this.timedEvents);
    this.timedEvents = setInterval(() => this.playTimedEvents(), 700);
  }
  stopTimedEvents() { clearInterval(this.timedEvents); this.timedEvents = null; }

  playTimedEvents() {
    const thisEvent = this.timedEventsList.shift();
    if (thisEvent === "deal card to dealer") this.dealCard("dealer");
    else if (thisEvent === "deal card to player") { this.dealCard("player"); this.showPlayerHandValue(); }
    else if (thisEvent === "end deal") { if (!this.checkForBlackjack()) this.waitForHitOrStay(); }
    else if (thisEvent === "show dealer card") this.showDealerCard();
    else if (thisEvent === "dealer move") this.dealerMove();
  }

  dealCard(toWho) {
    const newCardVal = this.deck.pop();
    if (toWho === "player") { this.playerHand.push(newCardVal); this.showCard(newCardVal, "player"); }
    else { this.dealerHand.push(newCardVal); this.showCard(newCardVal, "dealer"); }
  }

  showCard(cardVal, whichHand) {
    let el;
    if (whichHand === "dealer") {
      const faceDown = this.dealerHand.length === 1;
      el = renderCard(cardVal, faceDown);
      if (faceDown) this.dealerHoleCardEl = el;
      dealerRow.appendChild(el);
      this.dealerCardsEls.push(el);
    } else {
      el = renderCard(cardVal, false);
      playerRow.appendChild(el);
      this.playerCardsEls.push(el);
    }
  }

  waitForHitOrStay() {
    btnHit.style.display = "inline-block";
    btnStay.style.display = "inline-block";
    this.stopTimedEvents();
  }

  hit() {
    this.dealCard("player");
    this.showPlayerHandValue();
    if (this.handValue(this.playerHand) >= 21) this.stay();
  }

  stay() {
    btnHit.style.display = "none";
    btnStay.style.display = "none";
    this.timedEventsList = ["show dealer card", "dealer move"];
    this.startTimedEvents();
  }

  showDealerCard() {
    const val = this.dealerHand[0];
    const newEl = renderCard(val, false);
    this.dealerHoleCardEl.replaceWith(newEl);
    this.dealerCardsEls[0] = newEl;
    this.showDealerHandValue();
  }

  dealerMove() {
    if (this.handValue(this.dealerHand) < 17) {
      this.dealCard("dealer");
      this.showDealerHandValue();
      this.timedEventsList.push("dealer move");
    } else {
      this.decideWinner();
      this.stopTimedEvents();
      this.showCash();
      btnContinue.style.display = "inline-block";
    }
  }

  handValue(hand) {
    let total = 0, ace = false;
    for (const c of hand) {
      let val = parseInt(c.substr(1), 10);
      if (val > 10) val = 10;
      total += val;
      if (val === 1) ace = true;
    }
    if (ace && total <= 11) total += 10;
    return total;
  }

  checkForBlackjack() {
    if (this.playerHand.length === 2 && this.handValue(this.playerHand) === 21) {
      this.cash += this.bet * 2.5;
      resultEl.textContent = "Blackjack!";
      this.stopTimedEvents();
      this.showCash();
      btnContinue.style.display = "inline-block";
      return true;
    }
    return false;
  }

  decideWinner() {
    const playerValue = this.handValue(this.playerHand);
    const dealerValue = this.handValue(this.dealerHand);
    if (playerValue > 21) resultEl.textContent = "Überkauft — Verloren!";
    else if (dealerValue > 21) { this.cash += this.bet * 2; resultEl.textContent = "Dealer überkauft. Gewonnen!"; }
    else if (dealerValue > playerValue) resultEl.textContent = "Verloren!";
    else if (dealerValue === playerValue) { this.cash += this.bet; resultEl.textContent = "Unentschieden!"; }
    else { this.cash += this.bet * 2; resultEl.textContent = "Gewonnen!"; }
  }

  newDeal() {
    btnContinue.style.display = "none";
    if (this.deck.length < 26) this.createDeck();
    this.startHand();
  }

  showPlayerHandValue() { playerValueEl.textContent = this.handValue(this.playerHand); }
  showDealerHandValue() { dealerValueEl.textContent = this.handValue(this.dealerHand); }
  showCash() { cashEl.textContent = `Cash: $${this.cash}`; }
  showBet() { betEl.textContent = `Bet: $${this.bet}`; }
}

const game = new BlackjackGame();
game.start();
