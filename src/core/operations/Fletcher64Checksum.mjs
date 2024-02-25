/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Fletcher-64 Checksum operation
 */
class Fletcher64Checksum extends Operation {
    /**
     * Fletcher64Checksum constructor
     */
    constructor() {
        super();

        this.name = "Fletcher-64 Checksum";
        this.module = "Crypto";
        this.description
            = "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
        this.infoURL = "https://wikipedia.org/wiki/Fletcher%27s_checksum#Fletcher-64";
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
            input = new DataView(input.buffer, input.byteOffset, input.byteLength);
        } else {
            input = new DataView(input);
        }

        for (let i = 0; i < input.byteLength - 3; i += 4) {
            a = (a + input.getUint32(i, true)) % 0xffffffff;
            b = (b + a) % 0xffffffff;
        }
        if (input.byteLength % 4 !== 0) {
            let lastValue = 0;
            for (let i = 0; i < input.byteLength % 4; i++) {
                lastValue = (lastValue << 8) | input.getUint8(input.byteLength - 1 - i);
            }
            a = (a + lastValue) % 0xffffffff;
            b = (b + a) % 0xffffffff;
        }

        return Utils.hex(b >>> 0, 8) + Utils.hex(a >>> 0, 8);
    }
}

export default Fletcher64Checksum;
