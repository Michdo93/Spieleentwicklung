/**
 * Chapter 10 · Picture Trivia Game
 * Portierung von A3GPU210_PictureTriviaGame/PictureTriviaGame.as
 *
 * Das Original lud Fragen- UND Antwortbilder als externe SWF-Dateien
 * (triviaimages/*.swf) per Loader nach. Da wir keine SWFs im Browser laden
 * können (und die Originalgrafiken nicht als Bilddatei vorlagen), wurden
 * die fünf Bilder hier als kleine, selbst gezeichnete Inline-SVGs
 * nachgebaut: vier Dreiecksarten (gleichseitig/rechtwinklig/gleichschenklig/
 * ungleichseitig) und eine stark vereinfachte, stilisierte Silhouette
 * Italiens. Fragen-/Antwortstruktur (Text- vs. Bild-Fragen gemischt) ist
 * 1:1 aus trivia3.xml übernommen.
 */

const messageEl = document.getElementById("message");
const questionCard = document.getElementById("question-card");
const scoreEl = document.getElementById("score");
const actionBtn = document.getElementById("action-btn");

/* ---------------------------------------------------------------- */
/* Selbst gezeichnete Ersatzgrafiken für die Original-SWF-Bilder     */
/* ---------------------------------------------------------------- */
const IMAGES = {
  "equilateral.svg": `<svg viewBox="0 0 100 90"><polygon points="50,8 92,82 8,82" fill="none" stroke="#5fe0c9" stroke-width="4"/></svg>`,
  "right.svg": `<svg viewBox="0 0 100 90"><polygon points="10,10 10,82 92,82" fill="none" stroke="#ffb84d" stroke-width="4"/></svg>`,
  "isosceles.svg": `<svg viewBox="0 0 100 90"><polygon points="50,8 80,82 20,82" fill="none" stroke="#a78bfa" stroke-width="4"/></svg>`,
  "scalene.svg": `<svg viewBox="0 0 100 90"><polygon points="20,15 95,50 35,82" fill="none" stroke="#ff6b6b" stroke-width="4"/></svg>`,
  "italy.svg": `<svg viewBox="0 0 100 140"><path d="M52 6 C48 14 46 22 50 30 C54 36 60 40 58 48 C56 56 48 58 50 66 C52 76 62 82 60 92 C58 102 50 108 52 118 C53 124 58 128 56 134 L48 132 C44 122 40 116 42 106 C44 96 38 92 40 82 C42 72 36 66 38 56 C40 46 34 40 36 30 C38 20 44 10 52 6 Z" fill="none" stroke="#5fe0c9" stroke-width="3"/><text x="50" y="140" font-size="8" fill="#5b6b7d" text-anchor="middle">(stilisiert)</text></svg>`,
};

function imageHTML(file) {
  return `<div class="quiz-image">${IMAGES[file] || ""}</div>`;
}

/* ---------------------------------------------------------------- */
/* Fragedaten — Struktur 1:1 aus trivia3.xml, Bilder durch obige SVGs ersetzt */
/* ---------------------------------------------------------------- */
const QUESTIONS = [
  {
    question: { type: "text", value: "Who is known as the original drummer of the Beatles?" },
    answers: [
      { type: "text", value: "Pete Best" },
      { type: "text", value: "Ringo Starr" },
      { type: "text", value: "Stu Sutcliffe" },
      { type: "text", value: "George Harrison" },
    ],
  },
  {
    question: { type: "text", value: "Which one is an equilateral triangle?" },
    answers: [
      { type: "image", value: "equilateral.svg" },
      { type: "image", value: "right.svg" },
      { type: "image", value: "isosceles.svg" },
      { type: "image", value: "scalene.svg" },
    ],
  },
  {
    question: { type: "image", value: "italy.svg" },
    answers: [
      { type: "text", value: "Italy" },
      { type: "text", value: "France" },
      { type: "text", value: "Greece" },
      { type: "text", value: "Fenwick" },
    ],
  },
];

let questionNum = 0;
let numQuestionsAsked = 0;
let numCorrect = 0;
let correctAnswer = null;
let answers = [];

function startTriviaGame() {
  questionNum = 0; numQuestionsAsked = 0; numCorrect = 0;
  messageEl.textContent = "Get ready for the first question!";
  messageEl.className = "quiz-message";
  showGameScore();
  showGameButton("GO!");
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
  if (questionNum >= QUESTIONS.length) endGame();
  else askQuestion();
}

function askQuestion() {
  messageEl.textContent = "";
  const item = QUESTIONS[questionNum];
  correctAnswer = item.answers[0].value;
  answers = shuffleAnswers(item.answers);

  const qEl = document.createElement("div");
  qEl.className = "quiz-question";
  qEl.innerHTML = item.question.type === "text" ? item.question.value : imageHTML(item.question.value);
  questionCard.appendChild(qEl);

  const list = document.createElement("div");
  list.className = "quiz-answers quiz-answers-grid";
  answers.forEach((answer, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer";
    const label = `<span class="quiz-letter">${String.fromCharCode(65 + i)}</span>`;
    btn.innerHTML = answer.type === "text" ? `${label} ${answer.value}` : `${label} ${imageHTML(answer.value)}`;
    btn.addEventListener("click", () => clickAnswer(answer.value));
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

function clickAnswer(selectedValue) {
  if (selectedValue === correctAnswer) {
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
    if (answers[i].value !== correctAnswer) btn.style.display = "none";
    else btn.classList.add("correct");
  });

  questionNum++;
  numQuestionsAsked++;
  showGameScore();
  showGameButton("Continue");
}

function endGame() {
  messageEl.textContent = `Fertig! ${numCorrect} von ${numQuestionsAsked} richtig.`;
  messageEl.className = "quiz-message";
  actionBtn.textContent = "Nochmal spielen";
  actionBtn.style.display = "inline-block";
  actionBtn.onclick = startTriviaGame;
}

startTriviaGame();
