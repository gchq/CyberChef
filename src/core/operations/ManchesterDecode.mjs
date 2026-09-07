/**
 * @author JasonYuan869 [github.com/JasonYuan869]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { MANCHESTER_IEEE_802_3, MANCHESTER_CONVENTIONS } from "../lib/Manchester.mjs";

/**
 * Manchester Decode operation
 */
class ManchesterDecode extends Operation {

    /**
     * ManchesterDecode constructor
     */
    constructor() {
        super();

        this.name = "Manchester Decode";
        this.module = "Default";
        this.description = "Decodes Manchester line coding into a string of binary digits.<br><br>Input must contain only 0, 1 and whitespace. Whitespace is ignored before pairing signal levels from the start of the input. Incomplete pairs and pairs without a transition (00 or 11) cause an error. Output is a bit string, with no byte padding; use From Binary afterwards to convert complete bytes to text.<br><br>Select the same convention used to encode the signal.";
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

        if (input.length % 2 !== 0) {
            throw new OperationError("Manchester input must contain an even number of signal levels.");
        }

        const zero = args[0] === MANCHESTER_IEEE_802_3 ? "10" : "01";
        let output = "";
        for (let i = 0; i < input.length; i += 2) {
            const pair = input.slice(i, i + 2);
            if (pair[0] === pair[1]) {
                throw new OperationError(`Invalid Manchester pair '${pair}' at bit offset ${i} (whitespace excluded).`);
            }
            output += pair === zero ? "0" : "1";
        }
        return output;
    }
}

export default ManchesterDecode;
