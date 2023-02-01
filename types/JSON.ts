import { JsonTypes } from "../src";

declare global {
  interface JSON {
    customParse<T extends JsonTypes>(string: string): T;
  }
}
