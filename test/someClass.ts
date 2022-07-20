export class SomeClass {
    private readonly init = Date.now();
    constructor() {
        this.getCurrentTimeStamp();
        this.importantFunction();
    }

    getCurrentTimeStamp() {
        return Date.now() - this.init;
    }

    // Class methods
    importantFunction() {
        // obfuscate:start
        const str = "hello";
        const str2 = "class";
        const output = `${str} ${str2}`;
        this.getCurrentTimeStamp(); // You can use functions in this class

        const s = output.split("");
        let out = "";

        for (const a of s) {
            out += a.toUpperCase();
        }
        return out;
        // obfuscate:end
    }
}