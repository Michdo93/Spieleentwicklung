/**
 * Chapter 10 · XML Examples
 * Portierung von A3GPU210_XMLExamples/xmlimport.as
 *
 * AS3 lädt externe Daten als XML per URLLoader. Im Web ist JSON der
 * natürliche Ersatz — fetch() übernimmt das Laden, JSON.parse() (intern
 * schon in fetch().json() enthalten) das Parsen. Die Originaldaten
 * (xmltestdata.xml) wurden 1:1 nach JSON konvertiert, keine Frage/Antwort
 * wurde verändert.
 */

const outputEl = document.getElementById("output");
function trace(...args) { outputEl.textContent += args.join(" ") + "\n"; }

async function loadTriviaData() {
  trace("Lade xmltestdata.json …");
  try {
    const response = await fetch("assets/xmltestdata.json");
    const data = await response.json();
    // entspricht: trace(xmldata.item.answers.answer[1]);
    trace("data[0].answers[1] =", data[0].answers[1]);
    trace("Data loaded successfully.");
    renderQuestions(data);
  } catch (err) {
    trace("Fehler beim Laden:", err.message);
  }
}

function renderQuestions(data) {
  const container = document.getElementById("questions");
  container.innerHTML = "";
  data.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "xml-item";
    div.innerHTML = `
      <div class="xml-q">Frage ${i + 1}: ${item.question}</div>
      <ul>${item.answers.map(a => `<li>${a}</li>`).join("")}</ul>
    `;
    container.appendChild(div);
  });
}

loadTriviaData();
