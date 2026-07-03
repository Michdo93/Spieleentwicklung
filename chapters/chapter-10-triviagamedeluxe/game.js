/**
 * Chapter 10 · Trivia Game Deluxe
 * Portierung von A3GPU210_TriviaGameDeluxe/TriviaGameDeluxe.as
 *
 * Baut auf Chapter 10b auf und fügt hinzu: zufällige Auswahl von 10 aus 42
 * Fragen, ein 25-Sekunden-Countdown mit sinkenden Punkten, einen Hinweis-
 * Button mit Punktabzug, und ein Faktum nach jeder Frage.
 */

const messageEl = document.getElementById("message");
const questionCard = document.getElementById("question-card");
const scoreEl = document.getElementById("score");
const actionBtn = document.getElementById("action-btn");
const hintBtn = document.getElementById("hint-btn");
const timerBar = document.getElementById("timer-bar");
const factEl = document.getElementById("fact");

let pool = [];
let dataXML = [];
let questionNum = 0;
let numQuestionsAsked = 0;
let numCorrect = 0;
let correctAnswer = null;
let answers = [];
let gameScore = 0;
let questionPoints = 0;
let timerInterval = null;
let secondsLeft = 25;

async function startTriviaGame() {
  messageEl.textContent = "Loading Questions…";
  messageEl.className = "quiz-message";
  actionBtn.style.display = "none";
  gameScore = 0; questionPoints = 0;
  showGameScore();
  try {
    const res = await fetch("assets/trivia2.json");
    pool = await res.json();
    dataXML = selectQuestions(pool, 10);
    messageEl.textContent = "Get ready for the first question!";
    showGameButton("GO!");
  } catch (err) {
    messageEl.textContent = "Fehler beim Laden der Fragen: " + err.message;
  }
}

// entspricht selectQuestions() — zieht zufällig N Fragen aus dem Gesamtpool
function selectQuestions(all, numToChoose) {
  const copy = [...all];
  const chosen = [];
  while (chosen.length < numToChoose && copy.length > 0) {
    const r = Math.floor(Math.random() * copy.length);
    chosen.push(copy[r]);
    copy.splice(r, 1);
  }
  return chosen;
}

function showGameScore() {
  const potential = questionPoints !== 0 ? questionPoints : "—";
  scoreEl.textContent = `Potential Points: ${potential}    Score: ${gameScore}`;
}

function showGameButton(label) {
  actionBtn.textContent = label;
  actionBtn.style.display = "inline-block";
  actionBtn.onclick = pressedGameButton;
}

function pressedGameButton() {
  questionCard.innerHTML = "";
  factEl.textContent = "";
  actionBtn.style.display = "none";
  hintBtn.style.display = "none";

  if (questionNum >= dataXML.length) {
    endGame();
  } else {
    askQuestion();
  }
}

function askQuestion() {
  messageEl.textContent = "";
  messageEl.className = "quiz-message";
  const item = dataXML[questionNum];
  correctAnswer = item.answers[0];
  answers = shuffleAnswers(item.answers);

  const qEl = document.createElement("div");
  qEl.className = "quiz-question";
  qEl.textContent = item.question;
  questionCard.appendChild(qEl);
  if (item.category) {
    const cat = document.createElement("div");
    cat.className = "quiz-category";
    cat.textContent = item.category;
    questionCard.prepend(cat);
  }

  const list = document.createElement("div");
  list.className = "quiz-answers";
  answers.forEach((answer, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer";
    btn.innerHTML = `<span class="quiz-letter">${String.fromCharCode(65 + i)}</span> ${answer}`;
    btn.addEventListener("click", () => clickAnswer(answer));
    list.appendChild(btn);
  });
  questionCard.appendChild(list);

  hintBtn.style.display = item.hint ? "inline-block" : "none";
  hintBtn.disabled = false;
  hintBtn.onclick = () => pressedHintButton(item.hint);

  startQuestionTimer();
}

function startQuestionTimer() {
  questionPoints = 1000;
  secondsLeft = 25;
  showGameScore();
  updateTimerBar();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsLeft--;
    questionPoints -= 25;
    if (questionPoints < 0) questionPoints = 0;
    showGameScore();
    updateTimerBar();
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      messageEl.textContent = "Out of time! The correct answer was:";
      messageEl.className = "quiz-message bad";
      finishQuestion();
    }
  }, 1000);
}

function updateTimerBar() {
  timerBar.style.width = `${Math.max(0, (secondsLeft / 25) * 100)}%`;
}

function shuffleAnswers(originalAnswers) {
  const pool2 = [...originalAnswers];
  const shuffled = [];
  while (pool2.length > 0) {
    const r = Math.floor(Math.random() * pool2.length);
    shuffled.push(pool2[r]);
    pool2.splice(r, 1);
  }
  return shuffled;
}

function pressedHintButton(hint) {
  hintBtn.style.display = "none";
  questionPoints -= 300;
  if (questionPoints < 0) questionPoints = 0;
  showGameScore();
  const hintEl = document.createElement("div");
  hintEl.className = "quiz-hint";
  hintEl.textContent = `Hinweis: ${hint}`;
  questionCard.appendChild(hintEl);
}

function clickAnswer(selected) {
  clearInterval(timerInterval);
  if (selected === correctAnswer) {
    numCorrect++;
    messageEl.textContent = "You got it!";
    messageEl.className = "quiz-message good";
    gameScore += questionPoints;
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
    if (answers[i] !== correctAnswer) btn.style.display = "none";
    else btn.classList.add("correct");
  });
  hintBtn.style.display = "none";

  const item = dataXML[questionNum];
  if (item.fact) factEl.textContent = item.fact;

  questionNum++;
  numQuestionsAsked++;
  questionPoints = 0;
  showGameScore();
  showGameButton("Continue");
}

function endGame() {
  messageEl.className = "quiz-message";
  messageEl.textContent = `Fertig! ${numCorrect} von ${numQuestionsAsked} richtig — Score: ${gameScore}`;
  factEl.textContent = "";
  timerBar.style.width = "0%";
  actionBtn.style.display = "inline-block";
  actionBtn.textContent = "Nochmal spielen";
  actionBtn.onclick = () => {
    questionNum = 0; numQuestionsAsked = 0; numCorrect = 0;
    startTriviaGame();
  };
}

startTriviaGame();
