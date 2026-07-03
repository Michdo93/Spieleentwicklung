/**
 * Chapter 10 · Trivia Game
 * Portierung von A3GPU210_TriviaGame/TriviaGame.as
 *
 * AS3 baute die komplette UI zur Laufzeit aus TextField/Sprite-Objekten
 * zusammen (createText(), Circle-Symbole für Antwort-Buttons). Für ein so
 * textlastiges, formularartiges UI ist im Web direktes DOM/HTML die
 * natürlichere Wahl als Canvas-Zeichnen — deshalb läuft dieses Kapitel
 * (und die beiden folgenden) über echte HTML-Elemente statt über einen
 * Zeichenkontext. Die Spiellogik selbst (Fragen laden, Antworten
 * mischen, Score führen) ist 1:1 aus dem Original übernommen.
 */

const messageEl = document.getElementById("message");
const questionCard = document.getElementById("question-card");
const scoreEl = document.getElementById("score");
const actionBtn = document.getElementById("action-btn");

let dataXML = [];
let questionNum = 0;
let numQuestionsAsked = 0;
let numCorrect = 0;
let correctAnswer = null;
let answers = [];

async function startTriviaGame() {
  messageEl.textContent = "Loading Questions…";
  actionBtn.style.display = "none";
  showGameScore();
  try {
    const res = await fetch("assets/trivia1.json");
    dataXML = await res.json();
    messageEl.textContent = "Get ready for the first question!";
    showGameButton("GO!");
  } catch (err) {
    messageEl.textContent = "Fehler beim Laden der Fragen: " + err.message;
  }
}

function showGameScore() {
  scoreEl.textContent = `Number of Questions: ${numQuestionsAsked}   Number Correct: ${numCorrect}`;
}

function showGameButton(label) {
  actionBtn.textContent = label;
  actionBtn.style.display = "inline-block";
  actionBtn.onclick = pressedGameButton;
}

function pressedGameButton() {
  questionCard.innerHTML = "";
  actionBtn.style.display = "none";

  if (questionNum >= dataXML.length) {
    endGame();
  } else {
    askQuestion();
  }
}

function askQuestion() {
  messageEl.textContent = "";
  const item = dataXML[questionNum];
  correctAnswer = item.answers[0];
  answers = shuffleAnswers(item.answers);

  const qEl = document.createElement("div");
  qEl.className = "quiz-question";
  qEl.textContent = item.question;
  questionCard.appendChild(qEl);

  const list = document.createElement("div");
  list.className = "quiz-answers";
  answers.forEach((answer, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer";
    btn.innerHTML = `<span class="quiz-letter">${String.fromCharCode(65 + i)}</span> ${answer}`;
    btn.addEventListener("click", () => clickAnswer(answer, btn));
    list.appendChild(btn);
  });
  questionCard.appendChild(list);
}

function shuffleAnswers(originalAnswers) {
  const pool = [...originalAnswers];
  const shuffled = [];
  while (pool.length > 0) {
    const r = Math.floor(Math.random() * pool.length);
    shuffled.push(pool[r]);
    pool.splice(r, 1);
  }
  return shuffled;
}

function clickAnswer(selected, btnEl) {
  if (selected === correctAnswer) {
    numCorrect++;
    messageEl.textContent = "You got it!";
    messageEl.className = "quiz-message good";
  } else {
    messageEl.textContent = "Incorrect! The correct answer was:";
    messageEl.className = "quiz-message bad";
  }
  finishQuestion();
}

function finishQuestion() {
  const buttons = questionCard.querySelectorAll(".quiz-answer");
  buttons.forEach((btn, i) => {
    btn.onclick = null;
    btn.disabled = true;
    if (answers[i] !== correctAnswer) {
      btn.style.display = "none";
    } else {
      btn.classList.add("correct");
    }
  });

  questionNum++;
  numQuestionsAsked++;
  showGameScore();
  showGameButton("Continue");
}

function endGame() {
  messageEl.className = "quiz-message";
  messageEl.textContent = `Fertig! ${numCorrect} von ${numQuestionsAsked} richtig.`;
  actionBtn.style.display = "inline-block";
  actionBtn.textContent = "Nochmal spielen";
  actionBtn.onclick = () => {
    questionNum = 0; numQuestionsAsked = 0; numCorrect = 0;
    startTriviaGame();
  };
}

startTriviaGame();
