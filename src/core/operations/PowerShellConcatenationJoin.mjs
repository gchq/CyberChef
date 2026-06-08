/**
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PowerShell Concatenation Join operation
 */
class PowerShellConcatenationJoin extends Operation {

    constructor() {
        super();

        this.name = "PowerShell Concatenation Join";
        this.module = "Default";
        this.description = "Resolves PowerShell string concatenation obfuscation by joining adjacent static string literals separated by <code>+</code>. Only resolves runs where every operand is a quoted literal — expressions involving variables or sub-expressions are left untouched.<br><br><b>Example</b><br>Input: <code>'In'+'vo'+'ke'+'-'+'Item'</code><br>Output: <code>'Invoke-Item'</code><br><br>Handles single-quoted, double-quoted, and mixed-quote chains. Runs iteratively until no further reductions are possible.";
        this.infoURL = "https://learn.microsoft.com/en-us/powershell/scripting/lang-spec/chapter-07";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "(?:\"[^\"]*\"|'[^']*')\\s*\\+\\s*(?:\"[^\"]*\"|'[^']*')",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let result = input;
        let prev;

        // Iteratively collapse adjacent quoted-string pairs until stable.
        // Four passes per iteration to cover all quote-type combinations.
        do {
            prev = result;
            // "a" + "b"  →  "ab"
            result = result.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, (_, a, b) => `"${a}${b}"`);
            // 'a' + 'b'  →  'ab'
            result = result.replace(/'([^']*)'\s*\+\s*'([^']*)'/g, (_, a, b) => `'${a}${b}'`);
            // "a" + 'b'  →  "ab"  (normalise to leading quote style)
            result = result.replace(/"([^"]*)"\s*\+\s*'([^']*)'/g, (_, a, b) => `"${a}${b}"`);
            // 'a' + "b"  →  'ab'
            result = result.replace(/'([^']*)'\s*\+\s*"([^"]*)"/g, (_, a, b) => `'${a}${b}'`);
        } while (result !== prev);

        return result;
    }

}

export default PowerShellConcatenationJoin;
