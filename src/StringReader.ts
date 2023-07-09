import { Config } from '../types/config';

export class StringParser {
  value: string;
  offset: number;
  ignoreEndOfFile: boolean;
  config: Config;

  constructor(value: string, config: Config, ignoreEndOfFile = false) {
    this.value = value;
    this.offset = 0;
    this.ignoreEndOfFile = ignoreEndOfFile;
    this.config = config;
  }

  skipChar() {
    this.offset++;
  }

  skipChars(count: number) {
    this.offset += count;
  }

  atEnd() {
    return this.offset >= this.value.length;
  }

  getFormattedPos() {
    let line = 1;
    let column = 1;

    for (let i = 0; i < this.offset; i++) {
      if (this.value[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return `line ${line}, column ${column}`;
  }

  skipWhitespaces() {
    let char = this.getChar();

    while (this.isWhitespace() || char === '/') {
      if (char === '/' && this.getNextChar() === '/') {
        this.skipUntil('\n');
      } else if (char === '/') {
        return;
      } else {
        this.skipChar();
      }

      char = this.getChar();
    }
  }

  /** gets the current character without increasing the offset */
  getChar() {
    if (this.offset >= this.value.length && !this.ignoreEndOfFile) {
      throw new Error(`Unexpected end of file at ${this.getFormattedPos()}`);
    }

    return this.value[this.offset];
  }

  getNextChar() {
    if (this.offset + 1 >= this.value.length && !this.ignoreEndOfFile) {
      throw new Error(`Unexpected end of file at ${this.getFormattedPos()}`);
    }

    return this.value[this.offset + 1];
  }

  getPrevChar() {
    if (this.offset - 1 >= this.value.length && !this.ignoreEndOfFile) {
      throw new Error(`Unexpected end of file at ${this.getFormattedPos()}`);
    }

    return this.value[this.offset - 1];
  }

  /** gets the current character while increasing the offset by 1 */
  readChar() {
    const char = this.getChar();

    this.offset++;

    return char;
  }

  isWhitespace() {
    const char = this.getChar();

    return char === ' ' || char === '\n' || char === '\r' || char === '\t';
  }


  isCurrentNewline() {
    const char = this.getChar();

    return char === '\n' || char === '\r';
  }

  readBefore(char: string | string[], allowNewline = false, dontCancelChars: string[] = []) {
    let result = '';
    let lastWasEscape = false;
    let toCheck: string[];

    if (typeof char === 'string') {
      toCheck = [char];
    } else {
      toCheck = char;
    }

    const containsNewline = toCheck.includes('\n') || toCheck.includes('\r');

    while (true) {
      if (this.isCurrentNewline()) {
        if (!allowNewline) {
          throw new Error(`Unexpected newline at ${this.getFormattedPos()}`);
        }

        if (containsNewline) {
          break;
        }
      }

      if (lastWasEscape) {
        result += this.readChar();
        lastWasEscape = false;

        continue;
      }

      if (this.getChar() === '\\') {
        lastWasEscape = true;

        this.skipChar();

        continue;
      }

      if (toCheck.includes(this.getChar()) && !dontCancelChars.includes(this.getPrevChar())) {
        break;
      }

      result += this.readChar();

      if (this.ignoreEndOfFile && this.atEnd()) {
        break;
      }
    }

    return result;
  }

  readUntil(char: string | string[], allowNewline = false) {
    let result = '';
    let toCheck: string[];

    if (typeof char === 'string') {
      toCheck = [char];
    } else {
      toCheck = char;
    }

    const containsNewline = toCheck.includes('\n') || toCheck.includes('\r');

    while (true) {
      if (this.isCurrentNewline()) {
        if (!allowNewline) {
          throw new Error(`Unexpected newline at ${this.getFormattedPos()}`);
        }

        if (containsNewline) {
          break;
        }
      }

      if (this.getChar() === '\\') {
        switch (this.getNextChar()) {
          case '"':
            result += '"';
            break;

          case '\\':
            result += '\\';

            break;

          case 'n':
            result += '\n';

            break;

          case 'r':
            result += '\r';

            break;

          case 't':
            result += '\t';

            break;

          case 'u':
            const code = parseInt(this.value.substr(this.offset + 2, 4), 16);

            if (isNaN(code)) {
              throw new Error(`Unexpected escape sequence at ${this.getFormattedPos()}`);
            }

            result += String.fromCharCode(code);

            this.skipChars(4);

            break;

          default:
            throw new Error(`Unexpected escape sequence at ${this.getFormattedPos()}`);
        }

        this.skipChars(2);

        continue;
      }

      if (toCheck.includes(this.getChar())) {
        this.skipChar();

        break;
      }

      result += this.readChar();

      if (this.ignoreEndOfFile && this.atEnd()) {
        break;
      }
    }

    return result;
  }

  skipUntil(char: string, allowNewline = false) {
    let lastWasEscape = false;

    while (true) {
      if (this.isCurrentNewline() && !allowNewline) {
        throw new Error(`Unexpected newline at ${this.getFormattedPos()}`);
      }

      if (lastWasEscape) {
        lastWasEscape = false;

        continue;
      }

      if (this.getChar() === '\\') {
        lastWasEscape = true;

        if (this.getNextChar() === '"') {
          this.skipChar();
        } else {
          this.skipChar();
        }

        continue;
      }

      this.skipChar();

      if (this.getChar() === char) {
        break;
      }

      if (this.ignoreEndOfFile && this.atEnd()) {
        break;
      }
    }
  }
}
