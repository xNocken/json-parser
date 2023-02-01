import fs from 'fs';

import './src';
import type { JsonObject } from './src';

interface GudeWie extends JsonObject {
  name: string;
  age: number;
  isCool: boolean;
  ok: undefined;
}

const string = fs.readFileSync('replay.json', 'utf8');

console.time();
const parsed = JSON.customParse<test>(string);
console.timeEnd();

console.time();
const parsed2 = JSON.parse(string);
console.timeEnd();

console.log();

console
