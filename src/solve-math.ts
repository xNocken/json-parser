import { StringParser } from "./StringReader";

const cancelChars = '+-*/^&) '.split('');
const validOps = '+-*/^&'.split('');
const order = [
  '^&',
  '*/',
  '+-',
]

const handleHex = (string: StringParser) => {
  const number = string.readBefore(cancelChars);

  return parseInt(number, 16);
}

const handleBin = (string: StringParser) => {
  const number = string.readBefore(cancelChars);

  return parseInt(number, 2);
}

const handleDecimal = (string: StringParser) => {
  const number = string.readBefore(cancelChars);

  return parseFloat(number);
}

const handleValue = (string: StringParser) => {
  string.skipWhitespaces();

  const char = string.getChar();

  if (char === '0' && string.getNextChar() === 'x') {
    string.skipChars(2);

    return handleHex(string);
  }

  if (char === '0' && string.getNextChar() === 'b') {
    string.skipChars(2);

    return handleBin(string);
  }

  if (char <= "9" && char >= "0") {
    return handleDecimal(string);
  }
}

const func = (string: StringParser) => {
  string.skipWhitespaces();

  let thingies: (number | [string, number])[] = [handleValue(string)];

  while (!string.atEnd()) {
    string.skipWhitespaces();

    const op = string.readChar();

    if (!validOps.includes(op)) {
      throw new Error(`Invalid operator "${op}"`);
    }

    string.skipWhitespaces();

    const b = handleValue(string);

    if (isNaN(b)) {
      throw new Error('Invalid number');
    }

    thingies.push([op, b]);
  }

  let orderIndex = 0;

  while (true) {
    const curr: (number | [string, number])[] = [];

    for (let i = 0; i < thingies.length; i++) {
      const theCurr = thingies[i];

      if (typeof theCurr === 'number') {
        curr.push(theCurr);

        continue;
      }

      if (typeof theCurr === 'object') {
        const [op, b] = theCurr;

        if (orderIndex === 0 && order[0].includes(op)) {
          const a: number | [string, number] = curr.pop();
          let val;
          let opp;

          if (typeof a !== 'number') {
            [opp, val] = a;
          } else {
            val = a;
          }

          if (op === '^') {
            if (opp) {
              curr.push([opp, val ** b]);
            } else {
              curr.push(val ** b);
            }
          }

          if (op === '&') {
            if (opp) {
              curr.push([opp, val & b]);
            } else {
              curr.push(val & b);
            }
          }

          continue;
        }

        if (orderIndex === 1 && order[1].includes(op)) {
          const a: number | [string, number] = curr.pop();
          let val;
          let opp;

          if (typeof a !== 'number') {
            [opp, val] = a;
          } else {
            val = a;
          }

          if (op === '*') {
            if (opp) {
              curr.push([opp, val * b]);
            } else {
              curr.push(val * b);
            }
          }

          if (op === '/') {
            if (opp) {
              curr.push([opp, val / b]);
            } else {
              curr.push(val / b);
            }
          }

          continue;
        }

        if (orderIndex === 2 && order[2].includes(op)) {
          const a: number | [string, number] = curr.pop();
          let val;
          let opp;

          if (typeof a !== 'number') {
            [opp, val] = a;
          } else {
            val = a;
          }

          if (op === '+') {
            if (opp) {
              curr.push([opp, val + b]);
            } else {
              curr.push(val + b);
            }
          }

          if (op === '-') {
            if (opp) {
              curr.push([opp, val - b]);
            } else {
              curr.push(val - b);
            }
          }

          continue;
        }

        curr.push(theCurr);
      }
    }

    orderIndex += 1;

    if (curr.length === 1) {
      return curr[0];
    }

    thingies = curr;
  }
}

export default (string: string) => {
  const stringParser = new StringParser(string, true);

  return func(stringParser);
}
