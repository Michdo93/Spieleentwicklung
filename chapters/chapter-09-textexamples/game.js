/**
 * Chapter 09 · Text Examples
 * Portierung von A3GPU209_TextExamples (StringExamples-Frameskript + TextFly.as)
 */

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const outputEl = document.getElementById("output");
const buttons = document.querySelectorAll("[data-demo]");

function trace(...args) { outputEl.textContent += args.join(" ") + "\n"; outputEl.scrollTop = outputEl.scrollHeight; }
function clearOutput() { outputEl.textContent = ""; }
function clearStage() { ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H); }

/* ================================================================== */
/*  Demo 1: StringExamples — AS3-String-Methoden im direkten Vergleich */
/* ================================================================== */
const demoStrings = {
  run() {
    clearStage(); clearOutput();
    ctx.fillStyle = "#5b6b7d"; ctx.font = "13px 'JetBrains Mono'";
    ctx.fillText("Ergebnisse unten im Ausgabe-Panel ↓", 14, 24);

    let myString = "Why is a raven like a writing desk?";
    trace("myString =", myString);
    trace("myString.charAt(9) =", myString.charAt(9));
    trace("myString.substr(9,5) =", myString.substr(9, 5));
    trace("myString.substring(9,14) =", myString.substring(9, 14));
    trace("myString.substring(9) =", myString.substring(9));
    // AS3: substring(14,9) tauscht Start/Ende automatisch, wenn start > end
    trace("myString.substring(14,9) =", myString.substring(Math.min(14, 9), Math.max(14, 9)));
    trace("myString.slice(9,-21) =", myString.slice(9, -21));

    const testString = "raven";
    trace('testString == "raven" =', testString === "raven");
    trace('testString == "Raven" =', testString === "Raven");
    trace('testString.toLowerCase() == "Raven".toLowerCase() =', testString.toLowerCase() === "Raven".toLowerCase());

    trace('myString.indexOf("raven") =', myString.indexOf("raven"));
    trace('myString.indexOf("a") =', myString.indexOf("a"));
    trace('myString.lastIndexOf("a") =', myString.lastIndexOf("a"));
    trace('myString.indexOf("raven") != -1 =', myString.indexOf("raven") !== -1);

    trace('myString.search("raven") =', myString.search("raven"));
    trace("myString.search(/raven/) =", myString.search(/raven/));
    trace("myString.search(/Raven/i) =", myString.search(/Raven/i));
    trace("myString.search(/r...n/) =", myString.search(/r...n/));
    trace("myString.search(/r.*n/) =", myString.search(/r.*n/));

    myString = "Why is a raven like";
    myString += " a writing desk?";
    trace(myString);

    myString = "a writing desk?";
    myString = "Why is a raven like " + myString;
    trace(myString);

    trace('myString.replace("raven","door mouse") =', myString.replace("raven", "door mouse"));
    trace(myString.replace(/(raven)(.*)(writing desk)/g, "$3$2$1"));

    const myList = "apple,orange,banana";
    const myArray = myList.split(",");
    const myList2 = myArray.join(";");
    trace(myList2);

    trace(String.fromCharCode(65));

    return null;
  },
};

/* ================================================================== */
/*  Demo 2: TextFly — Buchstaben fliegen ein, drehen und skalieren     */
/* ================================================================== */
const demoTextFly = {
  run() {
    clearOutput();
    trace("Buchstaben fliegen von der Startposition zur Endposition,");
    trace("während sie sich drehen und aufskalieren — reine Interpolation.");

    const phrase = "FlashGameU";
    const spacing = 34;
    const numSteps = 50, stepTime = 20; // ms, wie im Original
    const startLoc = { x: W / 2, y: 10 };
    const endLoc = { x: 40, y: H / 2 + 10 };
    const startScale = 0, endScale = 1.4;
    const totalRotation = 360;

    let step = 0;
    let raf;
    const frame = () => {
      const percentDone = Math.min(step / numSteps, 1);
      clearStage();
      for (let i = 0; i < phrase.length; i++) {
        const x = startLoc.x * (1 - percentDone) + (endLoc.x + spacing * i) * percentDone;
        const y = startLoc.y * (1 - percentDone) + endLoc.y * percentDone;
        const scale = startScale * (1 - percentDone) + endScale * percentDone;
        const rotation = totalRotation * (percentDone - 1);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffb84d";
        ctx.font = "bold 28px 'JetBrains Mono'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(phrase[i], 0, 0);
        ctx.restore();
      }
      if (step < numSteps) { step++; raf = setTimeout(frame, stepTime); }
    };
    step = 0;
    frame();
    return () => clearTimeout(raf);
  },
};

const DEMOS = { strings: demoStrings, textfly: demoTextFly };
let cleanup = null;
function load(key) {
  if (cleanup) cleanup();
  cleanup = DEMOS[key].run() || null;
}
buttons.forEach(b => b.addEventListener("click", () => {
  buttons.forEach(x => x.classList.remove("btn-active"));
  b.classList.add("btn-active");
  load(b.dataset.demo);
}));
load("strings");
