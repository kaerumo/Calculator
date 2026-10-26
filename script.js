// ---------- 1. Math functions ----------
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

function operate(op, a, b) {
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
  }
}

// ---------- 2. State ----------
let firstNumber = null; // the number before the operator
let operator = null; // "+", "-", "*", "/"
let current = "0"; // what the user is typing / what's on screen
let waitingForSecond = false; // true right after an operator is pressed
let justEvaluated = false; // true right after "=" so the next digit starts fresh

const display = document.querySelector("#display");
const decimalBtn = document.querySelector("#decimal");

// ---------- 3. Display ----------
function updateDisplay(text = current) {
  display.textContent = text;
  // only disable "." while typing a number that already has one
  decimalBtn.disabled =
    current.includes(".") && !waitingForSecond && !justEvaluated;
}

// ---------- 4. Input ----------
function inputDigit(d) {
  if (justEvaluated || waitingForSecond) {
    current = d; // start a fresh number
    justEvaluated = false;
    waitingForSecond = false;
  } else {
    current = current === "0" ? d : current + d; // avoid "007"
  }
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated || waitingForSecond) {
    current = "0.";
    justEvaluated = false;
    waitingForSecond = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

function backspace() {
  if (justEvaluated || waitingForSecond) return;
  current =
    current.length <= 1 || (current.length === 2 && current[0] === "-")
      ? "0"
      : current.slice(0, -1);
  updateDisplay();
}

// ---------- 5. Calculating ----------
function evaluate() {
  const result = operate(operator, firstNumber, parseFloat(current));
  if (!isFinite(result)) return null; // divide by zero
  return Math.round(result * 1e8) / 1e8; // round long decimals
}

function chooseOperator(op) {
  if (waitingForSecond) {
    // consecutive operators: just swap, don't calculate
    operator = op;
    return;
  }
  if (operator !== null) {
    // e.g. 12 + 7 then "-" -> calculate 19 first
    const result = evaluate();
    if (result === null) return showError();
    firstNumber = result;
    current = String(result);
  } else {
    firstNumber = parseFloat(current);
  }
  operator = op;
  waitingForSecond = true;
  justEvaluated = false;
  updateDisplay();
}

function equals() {
  if (operator === null || waitingForSecond) return; // incomplete equation
  const result = evaluate();
  if (result === null) return showError();
  current = String(result);
  firstNumber = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function clearAll() {
  firstNumber = null;
  operator = null;
  current = "0";
  waitingForSecond = false;
  justEvaluated = false;
  updateDisplay();
}

function showError() {
  clearAll();
  updateDisplay("Nice try. 🙃");
}

// ---------- 6. Wire up buttons (once, outside any loop) ----------
document
  .querySelectorAll(".digit")
  .forEach((btn) =>
    btn.addEventListener("click", () => inputDigit(btn.textContent)),
  );

document
  .querySelectorAll(".operator")
  .forEach((btn) =>
    btn.addEventListener("click", () => chooseOperator(btn.dataset.op)),
  );

document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#clear").addEventListener("click", clearAll);
decimalBtn.addEventListener("click", inputDecimal);
document.querySelector("#backspace").addEventListener("click", backspace);

// ---------- 7. Keyboard support ----------
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if (["+", "-", "*", "/"].includes(e.key)) {
    e.preventDefault(); // stops "/" from opening browser quick-find
    chooseOperator(e.key);
  } else if (e.key === ".") inputDecimal();
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault(); // stops Enter from re-clicking a focused button
    equals();
  } else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") clearAll();
});

updateDisplay();
