/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {compress} from "../lib/LZNT1.mjs";

/**
 * LZNT1 Compress operation
 */
class LZNT1Compress extends Operation {

    /**
     * LZNT1 Compress constructor
     */
    constructor() {
        super();

        this.name = "LZNT1 Compress";
        this.module = "Compression";
        this.description = "Compresses data using the LZNT1 algorithm.<br><br>Similar to the Windows API <code>RtlCompressBuffer</code>.";
        this.infoURL = "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/5655f4a3-6ba4-489b-959f-e1f407c52f15";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return compress(input);
    }

}

export default LZNT1Compress;
