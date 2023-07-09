import fs from 'fs';

import customParse from './src';
import type { JsonObject } from './src';

interface GudeWie extends JsonObject {
  name: string;
  age: number;
  isCool: boolean;
  ok: undefined;
}

const string = fs.readFileSync('test3.json', 'utf8');

console.time();
const parsed = customParse<GudeWie>(string, {
  duplicateProps: ['TextureData'],
  throwOnDuplicate: true,
});
console.timeEnd();

// console.time();
// const parsed2 = JSON.parse(string);
// console.timeEnd();

console.log(parsed);

console
