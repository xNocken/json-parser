export interface Config {
  /** if the parser encounters one of those properties it will stre them as an array. allows parsing json that has the same key multiple times */
  duplicateProps?: string[];
  /** throws an error if the parser encounters a duplicate property that has not been specified above */
  throwOnDuplicate?: boolean;
}
