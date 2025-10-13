/**
 * @author Agent Mode
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Dancing Men Encode operation
 *
 * Encodes Latin letters a-z into textual Dancing Men tokens of the form char(97)..char(122).
 * Optionally, spaces can be represented by a flag marker appended to the previous token ("!")
 * to mimic the word-separator flag described in Conan Doyle's short story.
 */
class DancingMenEncode extends Operation {

    /**
     * DancingMenEncode constructor
     */
    constructor() {
        super();

        this.name = "Dancing Men Encode";
        this.module = "Ciphers";
        this.description = "Encode plaintext to Dancing Men token format using tokens like char(97)..char(122). Optionally mark word boundaries with a flag (!).";
        this.infoURL = "https://www.dcode.fr/dancing-men-cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Use flags as word separators",
                type: "boolean",
                value: false
            },
            {
                name: "Separator between tokens",
                type: "option",
                value: ["Space", "None"],
                defaultIndex: 0
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [useFlags, sepChoice] = args;
        const sep = sepChoice === "None" ? "" : " ";

        const out = [];
        let prevIdx = -1;

        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            const code = ch.toLowerCase().charCodeAt(0);
            if (code >= 97 && code <= 122) {
                out.push(`char(${code})`);
                prevIdx = out.length - 1;
            } else if (ch === " ") {
                if (useFlags && prevIdx >= 0) {
                    // Append a flag marker to the previous token to denote word boundary
                    out[prevIdx] = out[prevIdx] + "!";
                } else {
                    // Represent space explicitly in the stream
                    out.push(" ");
                    prevIdx = -1;
                }
            } else if (ch === "\n" || ch === "\r" || ch === "\t") {
                out.push(ch);
                prevIdx = -1;
            } else {
                // Pass-through other characters as-is
                out.push(ch);
                prevIdx = -1;
            }
        }

        // Join but preserve already injected spaces/newlines
        // We only join char(...) tokens using the chosen separator
        // Build final by inserting sep between adjacent char(...) tokens (and their optional !)
        const tokens = [];
        for (let i = 0; i < out.length; i++) {
            const cur = out[i];
            tokens.push(cur);
            const curIsToken = /^char\(\d{2,3}\)!?$/.test(cur);
            const next = out[i + 1];
            const nextIsToken = typeof next === "string" && /^char\(\d{2,3}\)!?$/.test(next);
            if (sep && curIsToken && nextIsToken) tokens.push(sep);
        }
        return tokens.join("");
    }
}

export default DancingMenEncode;
