// very simple test deal with it

const expected = [
    "HELLO FUNCTION",
    "HELLO CLASS",
    "HELLO CUSTOM",
];

console.log = (txt) => {
    const check = expected.shift();
    if (check !== txt) {
        throw new Error(`Expected ${check} got ${txt}`);
    }
};

require("../test_dist/main");
console.info("PASSED");