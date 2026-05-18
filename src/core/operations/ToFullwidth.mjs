/**
 * @author jyeu [chen@jyeu.xyz]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Fullwidth operation
 */
class ToFullwidth extends Operation {
    /**
     * ToFullwidth constructor
     */
    constructor() {
        super();

        this.name = "To Fullwidth";
        this.module = "Encodings";
        this.description =
            "Converts ASCII (halfwidth) characters to their fullwidth Unicode equivalents (U+FF01–U+FF5E). Commonly used in security testing to bypass WAF keyword filters, evade regex-based blocklists, and exploit Unicode normalization (NFKC/NFKD) vulnerabilities in web applications and path parsers. For example, <code>/ａdmin</code> may bypass a WAF rule matching <code>/admin</code> if the backend normalises Unicode before routing.";
        this.infoURL =
            "https://wikipedia.org/wiki/Halfwidth_and_fullwidth_forms_(Unicode_block)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {never} _args
     * @returns {string}
     */
    run(input, _args) {
        let output = "";

        for (const char of input) {
            const code = char.codePointAt(0);

            if (code === 0x20) {
                // Regular space -> Ideographic space (U+3000)
                output += "\u3000";
            } else if (code >= 0x21 && code <= 0x7e) {
                // Visible ASCII characters -> Fullwidth equivalents (U+FF01–U+FF5E)
                output += String.fromCodePoint(code + 0xfee0);
            } else {
                // Non-ASCII characters (CJK, newlines, etc.) are passed through unchanged
                output += char;
            }
        }

        return output;
    }
}

export default ToFullwidth;
