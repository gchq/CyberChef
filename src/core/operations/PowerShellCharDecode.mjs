/**
 * @author vigneshrajan94
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * PowerShell Char Decode operation
 */
class PowerShellCharDecode extends Operation {

    constructor() {
        super();

        this.name = "PowerShell Char Decode";
        this.module = "Default";
        this.description = "Resolves PowerShell <code>[char]</code> cast expressions to their character values. Handles decimal and hexadecimal operands, single casts, and array forms.<br><br><b>Supported patterns</b><br><code>[char]65</code> → <code>A</code><br><code>[char]0x41</code> → <code>A</code><br><code>[System.Char]65</code> → <code>A</code><br><code>[char[]](73,69,88)</code> → <code>\"IEX\"</code><br><code>-join [char[]](73,69,88)</code> → <code>\"IEX\"</code><br><br>Invalid or out-of-range values are left unchanged.";
        this.infoURL = "https://learn.microsoft.com/en-us/dotnet/api/system.char";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "\\[(?:System\\.)?[Cc]har\\]",
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

        // Resolve array form first: [char[]](65,66,67) or -join [char[]](65,66,67)
        result = result.replace(
            /(?:-join\s*)?\[(?:System\.)?[Cc]har\[\]\]\s*\(([^)]+)\)/g,
            (match, nums) => {
                try {
                    const chars = nums.split(",").map(n => {
                        const t = n.trim();
                        const code = /^0x/i.test(t) ? parseInt(t, 16) : parseInt(t, 10);
                        if (isNaN(code) || code < 0 || code > 0xFFFF) throw new RangeError();
                        return String.fromCharCode(code);
                    });
                    return `"${chars.join("")}"`;
                } catch (e) {
                    return match;
                }
            }
        );

        // Resolve single [char] or [System.Char] cast (decimal or hex)
        result = result.replace(
            /\[(?:System\.)?[Cc]har\]\s*(0x[0-9a-fA-F]+|\d+)/g,
            (match, code) => {
                try {
                    const num = /^0x/i.test(code) ? parseInt(code, 16) : parseInt(code, 10);
                    if (isNaN(num) || num < 0 || num > 0xFFFF) return match;
                    return String.fromCharCode(num);
                } catch (e) {
                    return match;
                }
            }
        );

        return result;
    }

}

export default PowerShellCharDecode;
