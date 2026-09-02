/**
 * @author Imantas Lukenskas [imantas@lukenskas.dev]
 * @copyright Imantas Lukenskas 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {fromCobs} from "../lib/COBS.mjs";

/**
 * From COBS operation
 */
class FromCOBS extends Operation {
    /**
     * FromCOBS constructor
     */
    constructor() {
        super();

        this.name = "From COBS";
        this.module = "Default";
        this.description = "Decodes COBS encoded bytes";
        this.infoURL = "https://wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return fromCobs(input);
    }
}

export default FromCOBS;
