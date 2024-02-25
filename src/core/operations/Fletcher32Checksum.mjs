/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Fletcher-32 Checksum operation
 */
class Fletcher32Checksum extends Operation {
    /**
     * Fletcher32Checksum constructor
     */
    constructor() {
        super();

        this.name = "Fletcher-32 Checksum";
        this.module = "Crypto";
        this.description =
            "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
        this.infoURL =
            "https://wikipedia.org/wiki/Fletcher%27s_checksum#Fletcher-32";
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
        let a = 0,
            b = 0;
        if (ArrayBuffer.isView(input)) {
            input = new DataView(
                input.buffer,
                input.byteOffset,
                input.byteLength,
            );
        } else {
            input = new DataView(input);
        }

        for (let i = 0; i < input.byteLength - 1; i += 2) {
            a = (a + input.getUint16(i, true)) % 0xffff;
            b = (b + a) % 0xffff;
        }
        if (input.byteLength % 2 !== 0) {
            a = (a + input.getUint8(input.byteLength - 1)) % 0xffff;
            b = (b + a) % 0xffff;
        }

        return Utils.hex(((b << 16) | a) >>> 0, 8);
    }
}

export default Fletcher32Checksum;
