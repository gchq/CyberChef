/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import forge from "node-forge/dist/forge.min.js";
import BigNumber from "bignumber.js";

/**
 * Pseudo-Random Number Generator operation
 */
class PseudoRandomNumberGenerator extends Operation {

    /**
     * PseudoRandomNumberGenerator constructor
     */
    constructor() {
        super();

        this.name = "Pseudo-Random Number Generator";
        this.module = "Ciphers";
        this.description = "A cryptographically-secure pseudo-random number generator (PRNG).<br><br>This operation uses the browser's built-in <code>crypto.getRandomValues()</code> method if available. If this cannot be found, it falls back to a Fortuna-based PRNG algorithm.";
        this.infoURL = "https://wikipedia.org/wiki/Pseudorandom_number_generator";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Number of bytes",
                "type": "number",
                "value": 32
            },
            {
                "name": "Output as",
                "type": "option",
                "value": ["Hex", "Integer", "Byte array", "Raw"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [numBytes, outputAs] = args;

        let bytes;

        if (ENVIRONMENT_IS_WORKER() && self.crypto) {
            bytes = self.crypto.getRandomValues(new Uint8Array(numBytes));
            bytes = Utils.arrayBufferToStr(bytes.buffer);
        } else {
            bytes = forge.random.getBytesSync(numBytes);
        }

        let value = new BigNumber(0),
            i;

        switch (outputAs) {
            case "Hex":
                return forge.util.bytesToHex(bytes);
            case "Integer":
                for (i = bytes.length - 1; i >= 0; i--) {
                    value = value.times(256).plus(bytes.charCodeAt(i));
                }
                return value.toFixed();
            case "Byte array":
                return JSON.stringify(Utils.strToCharcode(bytes));
            case "Raw":
            default:
                return bytes;
        }
    }

}

export default PseudoRandomNumberGenerator;
