/**
 * @author JasonYuan869 [github.com/JasonYuan869]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { MANCHESTER_IEEE_802_3, MANCHESTER_CONVENTIONS } from "../lib/Manchester.mjs";

/**
 * Manchester Encode operation
 */
class ManchesterEncode extends Operation {

    /**
     * ManchesterEncode constructor
     */
    constructor() {
        super();

        this.name = "Manchester Encode";
        this.module = "Default";
        this.description = "Encodes a string of binary digits using Manchester line coding, representing each bit with a transition between two signal levels.<br><br>Input must contain only 0, 1 and whitespace. Whitespace is ignored. Output contains two signal levels per input bit, with no separators. Use To Binary first to encode text or bytes.<br><br>Select the convention to choose the mapping of bits to signal levels.";
        this.infoURL = "https://wikipedia.org/wiki/Manchester_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Convention",
                type: "option",
                value: MANCHESTER_CONVENTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        input = input.replace(/\s/g, "");
        if (/[^01]/.test(input)) {
            throw new OperationError("Input must contain only binary digits (0 and 1) and whitespace.");
        }

        const zero = args[0] === MANCHESTER_IEEE_802_3 ? "10" : "01";
        return input.replace(/[01]/g, bit => bit === "0" ? zero : zero[1] + zero[0]);
    }
}

export default ManchesterEncode;
