/**
 * @author DBHeise [david@heiseink.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
//import OperationError from "../errors/OperationError";

/**
 * Brace Matching operation
 */
class BraceMatching extends Operation {

    /**
     * BraceMatching constructor
     */
    constructor() {
        super();

        this.name = "Brace Matching";
        this.module = "Default";
        this.description = "Extracts nested grouping";
        this.infoURL = "https://wikipedia.org/wiki/Brace_matching";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Open Brace Character",
                type: "string",
                value: "("
            },
            {
                name: "Close Brace Character",
                type: "string",
                value: ")"
            },
            {
                name: "String Chars",
                type: "string",
                value: "\"'"
            },
            {
                name: "Escape Char",
                type: "string",
                value: "\\"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [openChar, closeChar, strChars, escChar] = args;
        let ans = "";
        let isInString = false;
        let nestLevel = 0;
        let stringChar = null;
        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (ch === openChar) {
                if (!isInString) {
                    nestLevel++;
                    if (nestLevel === 1) {
                        continue;
                    }
                }
            } else if (ch === closeChar) {
                if (!isInString) {
                    nestLevel--;
                    if (nestLevel < 1) {
                        break;
                    }
                }
            }
            if (ch === escChar) {
                ans += ch;
                ans += input[i + 1];
                i++;
                continue;
            } else if (stringChar && ch === stringChar) {
                isInString = false;
                stringChar = null;
            } else if (strChars.indexOf(ch) > -1) {
                if (!isInString) {
                    isInString = true;
                    stringChar = ch;
                }
            }
            if (nestLevel > 0) {
                ans += ch;
            }
        }
        return ans;
    }
}

export default BraceMatching;

