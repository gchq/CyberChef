/**
 * ROR13 Hash operation (Windows API hashing convention)
 * @author fufu_btw
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Implements a ROR13 hash used for API name hashing techniques.
 */
class ROR13 extends Operation {

    /**
     * Constructor
     */
    constructor() {
        super();

        this.name = "ROR13";
        this.module = "Default";
        this.description = "Computes a ROR13 hash used in API hashing techniques.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "string";

        this.args = [];
    }

    /**
     * Rotate right (32-bit)
     *
     * @param {number} value - input value
     * @param {number} bits - rotation bits
     * @returns {number} rotated value
     */
    ror(value, bits) {
        return ((value >>> bits) | (value << (32 - bits))) >>> 0;
    }

    /**
     * Execute ROR13 hash
     *
     * @param {byteArray} input - input bytes
     * @param {Object[]} args - operation arguments
     * @returns {string} hex hash
     */
    run(input, args) {
        let hash = 0;

        for (let i = 0; i < input.length; i++) {
            const chr = input[i] & 0xFF;

            hash = this.ror(hash, 13);
            hash = (hash + chr) >>> 0;
        }

        return "0x" + hash.toString(16).padStart(8, "0").toUpperCase();
    }

    /**
     * Highlight input
     *
     * @param {Object[]} pos
     * @param {Object[]} args
     * @returns {Object[]}
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Reverse highlight
     *
     * @param {Object[]} pos
     * @param {Object[]} args
     * @returns {Object[]}
     */
    highlightReverse(pos, args) {
        return pos;
    }
}

export default ROR13;
