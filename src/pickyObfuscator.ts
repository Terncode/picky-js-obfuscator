import * as JavaScriptObfuscator from "javascript-obfuscator";

import { Compiler, Compilation, sources } from "webpack";


type OmittedObfuscatorOptionsI = Omit<
JavaScriptObfuscator.ObfuscatorOptions, 
"inputFileName" | "sourceMapBaseUrl" | "sourceMapFileName" | "sourceMapMode" | "sourceMapSourcesMode"
>;
export interface OmittedObfuscatorOptions extends OmittedObfuscatorOptionsI { 
    ignoreWarning: boolean;
}


type PickyObfuscatorCustom = ((code: string, name: string) => string);
interface PickyObfuscatorOptionsExtras {
    default: OmittedObfuscatorOptions | PickyObfuscatorCustom;
    [hash: string]: OmittedObfuscatorOptions | PickyObfuscatorCustom;
}

export type PickyObfuscatorOptions = OmittedObfuscatorOptions | PickyObfuscatorOptionsExtras | PickyObfuscatorCustom;

export class PickyObfuscator {
    private readonly name = "Picky Obfuscator";
    private startComment = / *\/\/ *obfuscate:start ?([\w|-]*)[ |\n|\t]*/;
    private endComment = / *\/\/ *obfuscate:end[ |\n|\t]*/;

    constructor(private options?: PickyObfuscatorOptions) {
        if(typeof options === "object") {
            if (this.isExtraOptions(options)) {
                Object.entries(options).forEach(e => this.checkSettings(e[1] as any, e[0]));
            }
        }
    }
    private checkSettings(opt: JavaScriptObfuscator.ObfuscatorOptions & OmittedObfuscatorOptions, key?: string) {
        if (!opt.ignoreWarning) {
            if (opt.disableConsoleOutput) {
                console.warn(`Usage of property "disableConsoleOutput" ${key ? `[${key}]` : ""} is discouraged as it can break the rest of the code!`);
            }
            if (opt.debugProtection) {
                console.warn(`Usage of property "debugProtection" ${key ? `[${key}]` : ""} is discouraged as it can break the rest of the code!`);
            }
        }
    }

    public apply(compiler: Compiler): void {
        const isDevServer = process.argv.find(v => v.includes("webpack-dev-server"));

        if (isDevServer) {
            console.info(`${this.name} is disabled on webpack-dev-server `);
            return;
        }

        compiler.hooks.compilation.tap(this.name, compilation => {
            compilation.hooks.processAssets.tap(
                {
                    name: this.name,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                },
                () => {
                    compilation.chunks.forEach(chunk => {
                        chunk.files.forEach(file => {
                            compilation.updateAsset(file, old => {
                                const lines = old.source().toString().split("\n");

                                while(true) {
                                    let startLine: number | undefined;
                                    let hash = "";
                                    let shouldBreak = true;
                                    for (let i = 0; i < lines.length; i++) {
                                        const line = lines[i];
                                        
                                        if (this.startComment.test(line)) {
                                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                            hash = line.match(this.startComment)![1] || "default";
                                            if (startLine) {
                                                throw new Error("Malformed code");
                                            }
                                            startLine = i;
                                            lines[i] = ""; // remove comment
                                        } else if (this.endComment.test(line)) { 
                                            if (startLine === undefined) {
                                                throw new Error("Missing start comment");
                                            }
                                            lines[i] = ""; // remove comment

                                            const code: string[] = [];

                                            for (let j = startLine + 1; j < i; j++) {
                                                code.push(lines[j]);
                                                lines[j] = ""; // remove existing code
                                            }
                                            const obsfucated = this.obfuscate(code.join("\n"), hash);
                                            
                                            // it should be okay to write in one the will be mapped back to new line when the obsfucation is done  
                                            lines[startLine] = obsfucated; 
                                            startLine = undefined;
                                            shouldBreak = false;
                                            hash = "";
                                            continue;

                                        }
                                    }
                                    if (shouldBreak) break;
                                }
                                const newCode = lines.join("\n");
                                return new sources.RawSource(newCode);
                            });
                        });
                    });
                });
        });
    }
    private isFn(options: PickyObfuscatorOptions): options is PickyObfuscatorCustom {
        return typeof options === "function";
    }
    private isExtraOptions(options: PickyObfuscatorOptions): options is PickyObfuscatorOptionsExtras {
        return "default" in options;
    }
    
    private obfuscate(code: string, hash: string) {
        if (this.options) {
            if (this.isFn(this.options)) {
                return this.options(code, hash);
            } else if (this.isExtraOptions(this.options)) {
                let selectedOptions = this.options[hash];
                if (!selectedOptions && hash) {
                    console.warn(`Missing hash ${selectedOptions} in options. Falling back to default`);
                    selectedOptions = this.options.default;
                }
                if(this.isFn(selectedOptions)) {
                    return selectedOptions(code, hash);
                } else {
                    return JavaScriptObfuscator.obfuscate(code, selectedOptions).getObfuscatedCode();
                }
            } else {
                return JavaScriptObfuscator.obfuscate(code, this.options).getObfuscatedCode();
            }
        }
        return JavaScriptObfuscator.obfuscate(code).getObfuscatedCode();
    }
}
