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
if (expected.length) {
    console.error("Not all messages has been logged");
} else {
    console.info("PASSED");
}