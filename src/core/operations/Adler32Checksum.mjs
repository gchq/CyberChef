/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Adler-32 Checksum operation
 */
class Adler32Checksum extends Operation {
    /**
     * Adler32Checksum constructor
     */
    constructor() {
        super();

        this.name = "Adler-32 Checksum";
        this.module = "Crypto";
        this.description
            = "Adler-32 is a checksum algorithm which was invented by Mark Adler in 1995, and is a modification of the Fletcher checksum. Compared to a cyclic redundancy check of the same length, it trades reliability for speed (preferring the latter).<br><br>Adler-32 is more reliable than Fletcher-16, and slightly less reliable than Fletcher-32.";
        this.infoURL = "https://wikipedia.org/wiki/Adler-32";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const MOD_ADLER = 65521;
        let a = 1,
            b = 0;
        input = new Uint8Array(input);

        for (let i = 0; i < input.length; i++) {
            a += input[i];
            b += a;
        }

        a %= MOD_ADLER;
        b %= MOD_ADLER;

        return Utils.hex(((b << 16) | a) >>> 0, 8);
    }
}

export default Adler32Checksum;
