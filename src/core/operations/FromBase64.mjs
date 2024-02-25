/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { fromBase64, ALPHABET_OPTIONS } from "../lib/Base64.mjs";

/**
 * From Base64 operation
 */
class FromBase64 extends Operation {
    /**
     * FromBase64 constructor
     */
    constructor() {
        super();

        this.name = "From Base64";
        this.module = "Default";
        this.description =
            "Base64 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers.<br><br>This operation decodes data from an ASCII Base64 string back into its raw format.<br><br>e.g. <code>aGVsbG8=</code> becomes <code>hello</code>";
        this.infoURL = "https://wikipedia.org/wiki/Base64";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "editableOption",
                value: ALPHABET_OPTIONS,
            },
            {
                name: "Remove non-alphabet chars",
                type: "boolean",
                value: true,
            },
            {
                name: "Strict mode",
                type: "boolean",
                value: false,
            },
        ];
        this.checks = [
            {
                pattern:
                    "^\\s*(?:[A-Z\\d+/]{4})+(?:[A-Z\\d+/]{2}==|[A-Z\\d+/]{3}=)?\\s*$",
                flags: "i",
                args: ["A-Za-z0-9+/=", true, false],
            },
            {
                pattern: "^\\s*[A-Z\\d\\-_]{20,}\\s*$",
                flags: "i",
                args: ["A-Za-z0-9-_", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z\\d+\\-]{4}){5,}(?:[A-Z\\d+\\-]{2}==|[A-Z\\d+\\-]{3}=)?\\s*$",
                flags: "i",
                args: ["A-Za-z0-9+\\-=", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z\\d./]{4}){5,}(?:[A-Z\\d./]{2}==|[A-Z\\d./]{3}=)?\\s*$",
                flags: "i",
                args: ["./0-9A-Za-z=", true, false],
            },
            {
                pattern: "^\\s*[A-Z\\d_.]{20,}\\s*$",
                flags: "i",
                args: ["A-Za-z0-9_.", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z\\d._]{4}){5,}(?:[A-Z\\d._]{2}--|[A-Z\\d._]{3}-)?\\s*$",
                flags: "i",
                args: ["A-Za-z0-9._-", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z\\d+/]{4}){5,}(?:[A-Z\\d+/]{2}==|[A-Z\\d+/]{3}=)?\\s*$",
                flags: "i",
                args: ["0-9a-zA-Z+/=", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z\\d+/]{4}){5,}(?:[A-Z\\d+/]{2}==|[A-Z\\d+/]{3}=)?\\s*$",
                flags: "i",
                args: ["0-9A-Za-z+/=", true, false],
            },
            {
                pattern: "^[ !\"#$%&'()*+,\\-./\\d:;<=>?@A-Z[\\\\\\]^_]{20,}$",
                flags: "",
                args: [" -_", false, false],
            },
            {
                pattern: "^\\s*[A-Z\\d+\\-]{20,}\\s*$",
                flags: "i",
                args: ["+\\-0-9A-Za-z", true, false],
            },
            {
                pattern:
                    "^\\s*[!\"#$%&'()*+,\\-0-689@A-NP-VX-Z[`a-fh-mp-r]{20,}\\s*$",
                flags: "",
                args: ["!-,-0-689@A-NP-VX-Z[`a-fh-mp-r", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[N-ZA-M\\d+/]{4}){5,}(?:[N-ZA-M\\d+/]{2}==|[N-ZA-M\\d+/]{3}=)?\\s*$",
                flags: "i",
                args: ["N-ZA-Mn-za-m0-9+/=", true, false],
            },
            {
                pattern: "^\\s*[A-Z\\d./]{20,}\\s*$",
                flags: "i",
                args: ["./0-9A-Za-z", true, false],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z=\\d\\+/]{4}){5,}(?:[A-Z=\\d\\+/]{2}CC|[A-Z=\\d\\+/]{3}C)?\\s*$",
                flags: "i",
                args: [
                    "/128GhIoPQROSTeUbADfgHijKLM+n0pFWXY456xyzB7=39VaqrstJklmNuZvwcdEC",
                    true,
                    false,
                ],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z=\\d\\+/]{4}){5,}(?:[A-Z=\\d\\+/]{2}55|[A-Z=\\d\\+/]{3}5)?\\s*$",
                flags: "i",
                args: [
                    "3GHIJKLMNOPQRSTUb=cdefghijklmnopWXYZ/12+406789VaqrstuvwxyzABCDEF5",
                    true,
                    false,
                ],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z=\\d\\+/]{4}){5,}(?:[A-Z=\\d\\+/]{2}22|[A-Z=\\d\\+/]{3}2)?\\s*$",
                flags: "i",
                args: [
                    "ZKj9n+yf0wDVX1s/5YbdxSo=ILaUpPBCHg8uvNO4klm6iJGhQ7eFrWczAMEq3RTt2",
                    true,
                    false,
                ],
            },
            {
                pattern:
                    "^\\s*(?:[A-Z=\\d\\+/]{4}){5,}(?:[A-Z=\\d\\+/]{2}55|[A-Z=\\d\\+/]{3}5)?\\s*$",
                flags: "i",
                args: [
                    "HNO4klm6ij9n+J2hyf0gzA8uvwDEq3X1Q7ZKeFrWcVTts/MRGYbdxSo=ILaUpPBC5",
                    true,
                    false,
                ],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [alphabet, removeNonAlphChars, strictMode] = args;

        return fromBase64(
            input,
            alphabet,
            "byteArray",
            removeNonAlphChars,
            strictMode,
        );
    }

    /**
     * Highlight to Base64
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        pos[0].start = Math.ceil((pos[0].start / 4) * 3);
        pos[0].end = Math.floor((pos[0].end / 4) * 3);
        return pos;
    }

    /**
     * Highlight from Base64
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        pos[0].start = Math.floor((pos[0].start / 3) * 4);
        pos[0].end = Math.ceil((pos[0].end / 3) * 4);
        return pos;
    }
}

export default FromBase64;
