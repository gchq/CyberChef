/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { toYEnc } from "../lib/YEnc.mjs";

/**
 * To yEnc operation
 */
class ToYEnc extends Operation {

    /**
     * ToYEnc constructor
     */
    constructor() {
        super();

        this.name = "To yEnc";
        this.module = "Default";
        this.description = "Encodes data using yEnc, an 8-bit binary-to-text encoding commonly used on Usenet.";
        this.infoURL = "http://www.yenc.org/yEnc1-formal1.txt";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Filename",
                type: "string",
                value: "file.bin"
            },
            {
                name: "Line length",
                type: "number",
                value: 128
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return toYEnc(input, args[1], args[0]);
    }

}

export default ToYEnc;
