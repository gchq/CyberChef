/**
 * @author tcode2k16 [tcode2k16@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import ieee754 from "ieee754";
import {DELIM_OPTIONS} from "../lib/Delim.mjs";

/**
 * To Float operation
 */
class ToFloat extends Operation {

    /**
     * ToFloat constructor
     */
    constructor() {
        super();

        this.name = "To Float";
        this.module = "Default";
        this.description = "Convert to EEE754 Floating Point Numbers";
        this.infoURL = "https://en.wikipedia.org/wiki/IEEE_754";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Endianness",
                "type": "option",
                "value": [
                    "Big Endian",
                    "Little Endian"
                ]
            },
            {
                "name": "Size",
                "type": "option",
                "value": [
                    "Float (4 bytes)",
                    "Double (8 bytes)"
                ]
            },
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [endianness, size, delimiterName] = args;
        const delim = Utils.charRep(delimiterName || "Space");
        const byteSize = size === "Double (8 bytes)" ? 8 : 4;
        const isLE = endianness === "Little Endian";
        const mLen = byteSize === 4 ? 23 : 52;

        if (input.length % byteSize !== 0) {
            throw new OperationError(`Input is not a multiple of ${byteSize}`);
        }

        const output = [];
        for (let i = 0; i < input.length; i+=byteSize) {
            output.push(ieee754.read(input, i, isLE, mLen, byteSize));
        }
        return output.join(delim);
    }

}

export default ToFloat;
