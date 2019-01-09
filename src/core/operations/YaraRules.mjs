/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Yara from "libyara-wasm";

/**
 * Yara Rules operation
 */
class YaraRules extends Operation {

    /**
     * YaraRules constructor
     */
    constructor() {
        super();

        this.name = "Yara Rules";
        this.module = "Yara";
        this.description = "Yara support";
        this.infoURL = "https://en.wikipedia.org/wiki/YARA";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Rules",
                type: "code",
                value: ""
            },
            {
                name: "Show strings",
                type: "boolean",
                value: false
            },
            {
                name: "Show string lengths",
                type: "boolean",
                value: false
            },
            {
                name: "Show metadata",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [rules, showStrings, showLengths, showMeta] = args;
        return new Promise((resolve, reject) => {
            Yara().then(yara => {
                let matchString = "";
                const inpArr = new Uint8Array(input); // I know this is garbage but it's like 1.5 times faster
                const inpVec = new yara.vectorChar();
                for (let i = 0; i < inpArr.length; i++) {
                    inpVec.push_back(inpArr[i]);
                }
                const resp = yara.run(inpVec, rules);
                if (resp.compileErrors.size() > 0) {
                    for (let i = 0; i < resp.compileErrors.size(); i++) {
                        const compileError = resp.compileErrors.get(i);
                        if (!compileError.warning) {
                            reject(new OperationError(`Error on line ${compileError.lineNumber}: ${compileError.message}`));
                        } else {
                            matchString += `Warning on line ${compileError.lineNumber}: ${compileError.message}`;
                        }
                    }
                }
                const matchedRules = resp.matchedRules;
                for (let i = 0; i < matchedRules.size(); i++) {
                    const rule = matchedRules.get(i);
                    const matches = rule.resolvedMatches;
                    let meta = "";
                    if (showMeta && rule.metadata.size() > 0) {
                        meta += " [";
                        for (let j = 0; j < rule.metadata.size(); j++) {
                            meta += `${rule.metadata.get(j).identifier}: ${rule.metadata.get(j).data}, `;
                        }
                        meta = meta.slice(0, -2) + "]";
                    }
                    if (matches.size() === 0 || !(showStrings || showLengths)) {
                        matchString += `Input matches rule "${rule.ruleName}"${meta}.\n`;
                    } else {
                        matchString += `Rule "${rule.ruleName}"${meta} matches:\n`;
                        for (let j = 0; j < matches.size(); j++) {
                            const match = matches.get(j);
                            if (showStrings || showLengths) {
                                matchString += `Pos ${match.location}, ${showLengths ? `length ${match.matchLength}, ` : ""}identifier ${match.stringIdentifier}${showStrings ? `, data: "${match.data}"` : ""}\n`;
                            }
                        }
                    }
                    
                }
                resolve(matchString);
            });
        });
    }

}

export default YaraRules;
