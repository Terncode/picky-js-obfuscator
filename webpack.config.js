/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { PickyObfuscator } = require("./dist/pickyObfuscator");
const isProduction = process.env.NODE_ENV == "production";
const TerserPlugin = require("terser-webpack-plugin");

const config = {
    entry: "./test/index.ts",
    output: {
        path: path.resolve(__dirname, "test_dist"),
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: {
                    condition: true,
                    banner: false,
                },
                terserOptions: {
                    sourceMap: true,
                    ecma: 5,
                    mangle: true,
                    output: { comments: false },
                },
            }),
        ],
    },
    plugins: [
        new PickyObfuscator({
            default: {},
            hard: { // High obfuscation, low performance preset
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 1,
                identifierNamesGenerator: "hexadecimal", // Doesn't make any since here since the Terser will rename most of them
                log: false,
                numbersToExpressions: true,
                renameGlobals: false, // Single functions usually don't have globals
                // selfDefending: true, // Enable only if you know what you are doing
                simplify: true,
                splitStrings: true,
                splitStringsChunkLength: 5,
                stringArray: true,
                stringArrayCallsTransform: true,
                stringArrayEncoding: ["rc4"],
                stringArrayIndexShift: true,
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayWrappersCount: 5,
                stringArrayWrappersChainedCalls: true,    
                stringArrayWrappersParametersMaxCount: 5,
                stringArrayWrappersType: "function",
                stringArrayThreshold: 1,
                transformObjectKeys: true,
                unicodeEscapeSequence: false
            },
            ["test-custom"]: (code) => {
                // This is just to test the custom obscuration. Consider using something else
                const randomNumber = Math.floor(Math.random() * 500) + 10000;
                const ranString = code.split("").map((e, i) => ((e.charCodeAt(0) + randomNumber)) + i);
                return `[${ranString.join(",")}].map((a,i)=>String.fromCharCode(a-${randomNumber}-i)).join('').slice(1,-1)`;
            }
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
        
        
    } else {
        config.mode = "development";
    }
    return config;
};
