# Picky obfuscator

Picky obfuscator is a webpack plugin that makes if very easy obfuscate parts of your code. By default it is using [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) but it also supports custom obfuscation.

## Why is this useful?

Obfuscating large bundles of code increases size and decreases performance. This plugin let's your control which part of the code you want to obfuscate.<br/>

Start of obfuscation `// obfuscate:start [NAME (OPTIONAL)]` <br/>
End of obfuscation `// obfuscate:end` <br/>
code between these comments will end obfuscated depends on settings<br/>

```js
export function importantFunction() {
    // obfuscate:start hard
    const str = "hello";
    const str2 = "function";
    const output = `${str} ${str2}`;

    const s = output.split('');
    let out = '';

    for (const a of s) {
        out += a.toUpperCase();
    }
    return out
    // obfuscate:end
}
```

## Webpack config

```js
const { PickyObfuscator } = require('pickyObfuscator');

const config = {
    plugins: [
        // Lazy and simple 
        new PickyObfuscator(),

        // Complicated
        new PickyObfuscator({
            default: {}, // https://github.com/javascript-obfuscator/javascript-obfuscator#obfuscatesourcecode-options
            hard: { // use custom settings eg // obfuscate:start hard
                numbersToExpressions: true,
            },
            ["test-custom"]: (code) => "", // you can use your own obfuscator  // obfuscate:start test-custom
        }),

        // Global settings
        new PickyObfuscator({ numbersToExpressions: true }/* javascript obfuscator options*/), // global settings
        // Custom
        new PickyObfuscator((code: string, hash: string) => "YOUR CODE"), // You own obfuscator
    ],
};
```

### Custom obfuscator
Pass a callback function to the constructor or as a value on complicated object. 
The function will be called with compiled code snipped and hash (if it is included in comment) 
Keep in mind that if you use TerserPlugin your obfuscated code might be changed
```js
// example
new PickyObfuscator((code: string, hash: string) => {
    if (hash === "hard") {
        return code; // return some weird transformed code
    }
    return code;
})

```
### Discourage obfuscator options
Options  | Reason
------------- | -------------
`disableConsoleOutput`  | Disables console output for entire application
`debugProtection` | Enable debug protection for entire application
`selfDefending` | Might break your code. Use only if you know what you are doing
