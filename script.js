const equationField = document.querySelector(".equation");
const inputField = document.querySelector(".result");
const keys = document.querySelector(".keys");

let equationResult,
  numberInput,
  equation,
  prevOperator,
  lockNumber,
  lockOperator;
initialize();

function initialize() {
  equationResult = 0;
  prevOperator = "+";

  // User input field, show result when clicking operator
  numberInput = "0";
  inputField.textContent = numberInput;

  // Equation of all number display
  equation = "";
  equationField.textContent = equation;

  // Use these variables to show that user input
  // Including number and operator can be changed (not locked) or fixed (locked)
  lockNumber = false;
  lockOperator = false;
}

// Calculator constructor function
// Provide operate methods to calculate result of a and b with operator op
function Calculator() {
  this.methods = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
  };

  this.operate = function (a, b, op) {
    if (!this.methods[op] || isNaN(a) || isNaN(b)) {
      return NaN;
    }

    return this.methods[op](a, b);
  };
}
let calc = new Calculator();

// Keyboard support: Simulate click event on screen
window.addEventListener("keydown", (e) => {
  const keyPressed = e.key;
  const key = document.querySelector(`.key[data-key='${keyPressed}']`);
  if (!key) return;
  key.click();
});

// Main logic
keys.addEventListener("click", (e) => {
  // Get value from data-key attribute
  const newKey = e.target.dataset.key;
  if (!newKey) return;

  // Set style to clicked button
  e.target.classList.remove("active");
  e.target.classList.add("active");
  setTimeout(() => {
    e.target.classList.remove("active");
  }, 100);

  // Reset all variables and display
  if (newKey === "C") {
    initialize();
    return;
  }

  // Reset all and display final result
  if (newKey === "=") {
    let finalResult = calc.operate(
      equationResult,
      parseFloat(numberInput),
      prevOperator
    );
    initialize();
    inputField.textContent = formatNumber(finalResult);
    return;
  }

  // Two cases divided by lockOperator and lockNumber
  // If operator +, -, *, / is clicked (lockNumber === true): numberInput is read once.
  // If Backspace, CE, ., +-, 0-9 is clicked (lockOperator === true): prevOperator is added once.
  if (isOperator(newKey)) {
    // Allow modifying operator
    lockOperator = false;

    if (!lockNumber) {
      equation += numberInput;

      // Calculate result using old operator only when operator clicked
      // For example: 12+7 only show 19 after clicking any operator, and old operator is +
      equationResult = calc.operate(
        equationResult,
        parseFloat(numberInput),
        prevOperator
      );

      // Temporarily show result when click operator after number (normally show input)
      inputField.textContent = formatNumber(equationResult);

      // Clear content for the next number input
      numberInput = "0";

      lockNumber = true;
    }

    // Operator not locked, let user modify
    equationField.textContent = equation + newKey;
    prevOperator = newKey;
  } else {
    // Allow modifying number
    lockNumber = false;

    // Logic to lock operator, avoid adding operator equation is empty (for example +0)
    if (!lockOperator && equationField.textContent !== "") {
      equation += prevOperator;
      equationField.textContent = equation;
      lockOperator = true;
    }

    if (isNumeric(newKey)) {
      // Allow only number added to input
      if (numberInput === "0") {
        numberInput = newKey;
      } else {
        numberInput += newKey;
      }
    } else if (newKey === "CE") {
      numberInput = "0";
    } else if (newKey === "Backspace") {
      if (numberInput.length === 1) {
        numberInput = "0";
      } else {
        numberInput = numberInput.slice(0, -1);
      }
    } else if (newKey === ".") {
      if (!numberInput.includes(".")) {
        numberInput += ".";
      }
    } else if (newKey === "+-") {
      if (!numberInput.includes("-")) {
        numberInput = "-" + numberInput;
      } else {
        numberInput = numberInput.slice(1);
      }
    }

    inputField.textContent = formatNumber(numberInput);
  }
});

function isOperator(key) {
  return key === "+" || key === "-" || key === "*" || key === "/";
}

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

function formatNumber(number) {
  // Format number: For example, 11111111.11111 will be 11,111,111.11111
  let stringNumber = number.toString();

  if (!stringNumber.includes(".")) {
    return stringNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    // Split the input into the integer and fractional parts using a period (.)
    let [integerPart, decimalPart] = stringNumber.split(".");

    // Format the integer part with commas using a regular expression
    let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // If there's a decimal part, concatenate it with the formatted integer
    if (decimalPart) {
      return `${formattedInteger}.${decimalPart}`;
    } else {
      return `${formattedInteger}.`;
    }
  }
}
