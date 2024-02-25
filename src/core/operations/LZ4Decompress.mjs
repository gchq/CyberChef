/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import lz4 from "lz4js";

/**
 * LZ4 Decompress operation
 */
class LZ4Decompress extends Operation {
    /**
     * LZ4Decompress constructor
     */
    constructor() {
        super();

        this.name = "LZ4 Decompress";
        this.module = "Compression";
        this.description
            = "LZ4 is a lossless data compression algorithm that is focused on compression and decompression speed. It belongs to the LZ77 family of byte-oriented compression schemes.";
        this.infoURL = "https://wikipedia.org/wiki/LZ4_(compression_algorithm)";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const inBuf = new Uint8Array(input);
        const decompressed = lz4.decompress(inBuf);
        return decompressed.buffer;
    }
}

export default LZ4Decompress;
