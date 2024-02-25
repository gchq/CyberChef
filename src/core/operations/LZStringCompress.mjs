/**
 * @author crespyl [peter@crespyl.net]
 * @copyright Peter Jacobs 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import { COMPRESSION_OUTPUT_FORMATS, COMPRESSION_FUNCTIONS } from "../lib/LZString.mjs";

/**
 * LZString Compress operation
 */
class LZStringCompress extends Operation {
    /**
     * LZStringCompress constructor
     */
    constructor() {
        super();

        this.name = "LZString Compress";
        this.module = "Compression";
        this.description = "Compress the input with lz-string.";
        this.infoURL = "https://pieroxy.net/blog/pages/lz-string/index.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Compression Format",
                type: "option",
                defaultIndex: 0,
                value: COMPRESSION_OUTPUT_FORMATS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const compress = COMPRESSION_FUNCTIONS[args[0]];
        if (compress) {
            return compress(input);
        } else {
            throw new OperationError("Unable to find compression function");
        }
    }
}

export default LZStringCompress;
