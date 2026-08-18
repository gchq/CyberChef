/**
 * @author rayane-ara []
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * To Base91 operation
 */
class ToBase91 extends Operation {

    /**
     * ToBase91 constructor
     */
    constructor() {
        super();

        this.name = "To Base91";
        this.module = "Default";
        this.description = "Encodes binary data into Base91 format. Base91 is an advanced method for encoding binary data as ASCII characters, resulting in a more compact string than Base64.<br><br>Example:<br><code>test</code> becomes <code>fPNKd</code>";
        this.infoURL = "https://en.wikipedia.org/wiki/Binary-to-text_encoding";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Base91 alphabet: 91 printable ASCII characters
        const TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

        if (TABLE.length !== 91) {
            throw new OperationError("Base91 table is invalid (must contain exactly 91 characters).");
        }

        let b = 0;  // Bit accumulator (buffer)
        let n = 0;  // Number of bits currently in the buffer
        let o = ""; // Output string

        for (let i = 0; i < input.length; i++) {
            // Append the current byte to the bit buffer (LSB first)
            b |= input[i] << n;
            n += 8;

            // We need at least 13 bits to attempt encoding
            if (n > 13) {
                // Extract the lower 13 bits
                let v = b & 8191; // 8191 = 0x1FFF = 2^13 - 1

                if (v > 88) {
                    // 13 bits are sufficient to encode this value:
                    // consume 13 bits from the buffer
                    b >>= 13;
                    n -= 13;
                } else {
                    // Value is too small (=< 88): a 14-bit encoding avoids
                    // wasting range, so we take one extra bit instead
                    v = b & 16383; // 16383 = 0x3FFF = 2^14 - 1
                    b >>= 14;
                    n -= 14;
                }

                // Each value is encoded as exactly 2 characters
                o += TABLE[v % 91] + TABLE[Math.floor(v / 91)];
            }
        }

        // Handle remaining bits in the buffer after the main loop
        if (n) {
            // Always emit at least one character for the leftover bits
            o += TABLE[b % 91];

            // Emit a second character only if needed:
            // more than 7 leftover bits (i.e. a full byte was split), OR
            // the remaining value exceeds the single-character range (> 90)
            if (n > 7 || b > 90) {
                o += TABLE[Math.floor(b / 91)];
            }
        }

        return o;
    }

}

export default ToBase91;

