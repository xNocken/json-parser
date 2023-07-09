import solveMath from './solve-math';
import { StringParser } from './StringReader';
import { Config } from '../types/config';

interface JsonObjectWrapper<T> {
  [key: string]: T;
}

export type JsonObject = JsonObjectWrapper<JsonTypes>;
export type JsonTypes = string | number | boolean | null | JsonObject | Array<JsonTypes>;

const handleString = (string: StringParser) => {
  if (string.readChar() !== '"') {
    throw new Error(`Expected " (double quote) at ${string.getFormattedPos()}`);
  }

  return string.readUntil('"');
}

const handleArray = (string: StringParser) => {
  if (string.readChar() !== '[') {
    throw new Error(`Expected "[" at ${string.getFormattedPos()}`);
  }

  const array: Array<JsonTypes> = [];

  while (true) {
    string.skipWhitespaces();

    if (string.getChar() === ']') {
      string.skipChar();

      break;
    }

    array.push(handleValue(string));

    string.skipWhitespaces();

    if (string.getChar() === ',') {
      string.skipChar();
    } else {
      string.skipWhitespaces();

      if (string.readChar() !== ']') {
        throw new Error(`Expected "]" at ${string.getFormattedPos()}`);
      }

      break;
    }
  }

  return array;
}

const handleObject = (string: StringParser) => {
  const data: JsonObject = {};

  string.skipChar();

  while (true) {
    string.skipWhitespaces();

    if (string.getChar() === '}') {
      string.skipChar();

      break;
    }

    const key = handleString(string);

    string.skipWhitespaces();

    if (string.readChar() !== ':') {
      throw new Error(`Expected ":" at ${string.getFormattedPos()}`);
    }

    if (string.config.duplicateProps?.includes(key)) {
      if (data[key] === undefined) {
        data[key] = [];
      }

      (<JsonTypes[]>data[key]).push(handleValue(string));
    } else {
      if (data[key] !== undefined && string.config.throwOnDuplicate) {
        throw new Error(`Duplicate property "${key}" at ${string.getFormattedPos()}`);
      }

      data[key] = handleValue(string);
    }


    string.skipWhitespaces();

    if (string.getChar() === ',') {
      string.skipChar();
    } else {
      string.skipWhitespaces();

      if (string.readChar() !== '}') {
        throw new Error(`Expected "}" at ${string.getFormattedPos()}`);
      }

      break;
    }
  }

  return data;
}

const handlePrimitive = (string: StringParser) => {
  const value = string.readBefore([',', '}', ']', '\n'], true);

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value === 'null') {
    return null;
  }

  try {
    return solveMath(value);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`${e.message} at ${string.getFormattedPos()}`);
    }

    throw e;
  }
}

const handleValue = (string: StringParser): JsonTypes => {
  string.skipWhitespaces();

  switch (string.getChar()) {
    case '{':
      return handleObject(string);

    case '"':
      return handleString(string);

    case '[':
      return handleArray(string);

    default:
      return handlePrimitive(string);
  }
};

export default <T extends JsonTypes>(string: string, config?: Config): T => {
  const parser = new StringParser(string, config || {});

  return <T>handleValue(parser);
}
