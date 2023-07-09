import { JsonTypes } from "../src";
import { Config } from './config';

declare global {
  interface JSON {
    customParse<T extends JsonTypes>(string: string, config?: Config): T;
  }
}
