/**
 * @author Agent Mode
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Dancing Men Decode operation
 *
 * Decodes textual Dancing Men tokens like char(97)..char(122) back to letters a-z.
 * If a token is suffixed with '!' (flag), it can be interpreted as a word separator.
 */
class DancingMenDecode extends Operation {

    /**
     * DancingMenDecode constructor
     */
    constructor() {
        super();

        this.name = "Dancing Men Decode";
        this.module = "Ciphers";
        this.description = "Decode Dancing Men token format (char(97)..char(122), optional ! for flags) back to text.";
        this.infoURL = "https://www.dcode.fr/dancing-men-cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Flags indicate spaces",
                type: "boolean",
                value: false
            }
        ];
        // Magic detection: sequence of 3+ char(ddd) tokens optionally with trailing '!'
        this.checks = [
            {
                pattern: "^(?:\\s*char\\(\\d{2,3}\\)!?\\s*){3,}$",
                args: [false],
                useful: true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [flagsAsSpaces] = args;
        const tokenRe = /char\((\d{2,3})\)(!?)/g;
        let out = "";
        let lastIndex = 0;
        let m;
        while ((m = tokenRe.exec(input)) !== null) {
            // Append any intermediary non-token text unchanged
            if (m.index > lastIndex) {
                out += input.slice(lastIndex, m.index);
            }
            const code = parseInt(m[1], 10);
            let ch = "";
            if (code >= 97 && code <= 122) ch = String.fromCharCode(code);
            else if (code >= 65 && code <= 90) ch = String.fromCharCode(code).toLowerCase();
            else ch = ""; // Unknown token range -> drop
            out += ch;
            if (flagsAsSpaces && m[2] === "!") out += " ";
            lastIndex = tokenRe.lastIndex;
        }
        // Append any remainder
        if (lastIndex < input.length) out += input.slice(lastIndex);
        return out;
    }
}

export default DancingMenDecode;
