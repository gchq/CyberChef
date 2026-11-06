/**
 * @author MP Gowtham [gowthamrockerzzz@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {decompress} from "../lib/XPRESS.mjs";

/**
 * XPRESS Decompress operation
 */
class XPRESSDecompress extends Operation {

    /**
     * XPRESS Decompress constructor
     */
    constructor() {
        super();

        this.name = "XPRESS Decompress";
        this.module = "Compression";
        this.description = "Decompresses data using the XPRESS plain LZ77 algorithm (MS-XCA section 2.1).<br><br>Similar to the Windows API <code>RtlDecompressBuffer</code> with <code>COMPRESSION_FORMAT_XPRESS</code>.";
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
        return decompress(input);
    }

}

export default XPRESSDecompress;
