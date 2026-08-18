/**
 * @author rayane-ara []
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * From Base91 operation
 */
class FromBase91 extends Operation {

    /**
     * FromBase91 constructor
     */
    constructor() {
        super();

        this.name = "From Base91";
        this.module = "Default";
        this.description = "Decodes Base91 encoded data back into its original binary format.<br><br>Example:<br><code>fPNKd</code> becomes <code>test</code>";
        this.infoURL = "https://en.wikipedia.org/wiki/Binary-to-text_encoding";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

        if (TABLE.length !== 91) {
            throw new OperationError("Base91 table is invalid (must contain exactly 91 characters).");
        }

        const DECODE_TABLE = {};
        for (let i = 0; i < TABLE.length; i++) {
            DECODE_TABLE[TABLE[i]] = i;
        }

        let b = 0;   // Bit accumulator (buffer)
        let n = 0;   // Number of bits currently in the buffer
        let v = -1;  // Pending value waiting for its second character (-1 = none)
        const o = []; // Output byte array

        for (let i = 0; i < input.length; i++) {
            const c = input[i];

            // Skip characters that are not part of the Base91 alphabet
            if (!(c in DECODE_TABLE)) continue;

            const p = DECODE_TABLE[c];

            if (v < 0) {
                // First character of a pair: store the value and wait for the second
                v = p;
            } else {
                // Second character of a pair: reconstruct the encoded value
                v += p * 91;

                // Push the lower 13 bits into the bit buffer
                b |= v << n;
                n += (v & 8191) > 88 ? 13 : 14;

                // Reset v for the next pair
                v = -1;

                // Extract all complete bytes from the buffer
                do {
                    o.push(b & 255); // Extract the lowest 8 bits as a byte
                    b >>= 8;
                    n -= 8;
                } while (n > 7);
            }
        }

        // Handle the final leftover character (if the input had an odd length)
        if (v > -1) {
            o.push((b | v << n) & 255);
        }

        return o;
    }

}

export default FromBase91;

