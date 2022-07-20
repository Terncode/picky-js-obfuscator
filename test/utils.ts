// Example / made up functions

export function stringify(any: unknown) {
    const type = typeof any;
    switch (type) {
    case "object": {
        if (type === null) return "null"; // thanks javascript
        return "toString" in (any as any) && any.toString();
    }
    case "symbol": {
        return "<symbol>";
    }
    case "boolean": 
    case "number": {
        return `${any}`;
    }
    case "function": {
        return "<function>";
    }
    case "undefined" : {
        return "<undefined>";
    }
    }
    return "<stringify failed>";
}

export function emptyArray(array: unknown[]) {
    while(array.length) {
        array.pop();
    }
}

export function fillArray<T = unknown>(array: T[], value: T, size: number) {
    while(array.length < size) {
        array.push(value);
    }
}

// let's pretend we are trying to hide something important
export function importantFunction() {
    // obfuscate:start hard
    const str = "hello";
    const str2 = "function";
    const output = `${str} ${str2}`;

    const s = output.split("");
    let out = "";

    for (const a of s) {
        out += a.toUpperCase();
    }

    return out;
    // obfuscate:end
}
