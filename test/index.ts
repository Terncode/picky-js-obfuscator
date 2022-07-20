import { stringify, fillArray, emptyArray, importantFunction } from "./utils";
import { SomeClass } from "./someClass";

const arr: string[] = [];
fillArray(arr, "something", 1000);

console.log(importantFunction());
const c = new SomeClass();
console.log(c.importantFunction());
stringify(c);

emptyArray(arr);

console.log(
// obfuscate:start test-custom
    "HELLO CUSTOM"
// obfuscate:end
);

