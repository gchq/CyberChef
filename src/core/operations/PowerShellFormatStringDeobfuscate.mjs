/**
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PowerShell Format String Deobfuscate operation
 */
class PowerShellFormatStringDeobfuscate extends Operation {

    constructor() {
        super();

        this.name = "PowerShell Format String Deobfuscate";
        this.module = "Default";
        this.description = "Deobfuscates PowerShell strings that use the <code>-f</code> (format) operator with reordered index placeholders. Malware authors use this technique to scramble string fragments, hiding readable commands from static analysis.<br><br><b>Example</b><br>Input: <code>(\"{0}{3}{4}{1}{2}\" -f \"S\",\"Mo\",\"de\",\"et-Stri\",\"ct\")</code><br>Output: <code>Set-StrictMode</code><br><br>All matching expressions in the input are resolved in-place. Unresolvable placeholders (e.g. out-of-range indices) are left unchanged.";
        this.infoURL = "https://github.com/bobby-tablez/Format-String-Deobfuscator";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "\\(\\s*[\"'][^\"']*\\{\\d+\\}[^\"']*[\"']\\s*-f\\s*[\"']",
                flags: "i",
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
        // Match: ("<template>" -f "arg0", "arg1", ...) or single-quoted variants
        // Template captures: group 1 = double-quoted content, group 2 = single-quoted content
        // Args captures: group 3 = the full comma-separated argument list
        const exprRegex = /\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*-f\s*((?:(?:"[^"]*"|'[^']*')\s*(?:,\s*(?:"[^"]*"|'[^']*')\s*)*))\s*\)/g;

        return input.replace(exprRegex, (match, dqTemplate, sqTemplate, argsStr) => {
            try {
                const template = dqTemplate !== undefined ? dqTemplate : sqTemplate;

                // Extract all quoted argument values in order
                const argValues = [];
                const argRegex = /"([^"]*)"|'([^']*)'/g;
                let argMatch;
                while ((argMatch = argRegex.exec(argsStr)) !== null) {
                    argValues.push(argMatch[1] !== undefined ? argMatch[1] : argMatch[2]);
                }

                if (argValues.length === 0) return match;

                // Substitute {N} placeholders with the corresponding argument value
                return template.replace(/\{(\d+)\}/g, (placeholder, idx) => {
                    const i = parseInt(idx, 10);
                    return i < argValues.length ? argValues[i] : placeholder;
                });
            } catch (e) {
                return match;
            }
        });
    }

}

export default PowerShellFormatStringDeobfuscate;
