/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import bzip2 from "../vendor/bzip2.js";
import OperationError from "../errors/OperationError";

/**
 * Bzip2 Decompress operation
 */
class Bzip2Decompress extends Operation {

    /**
     * Bzip2Decompress constructor
     */
    constructor() {
        super();

        this.name = "Bzip2 Decompress";
        this.module = "Compression";
        this.description = "Decompresses data using the Bzip2 algorithm.";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
        this.patterns = [
            {
                "match": "^\\x42\\x5a\\x68",
                "flags": "",
                "args": []
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const compressed = new Uint8Array(input);

        try {
            const bzip2Reader = bzip2.array(compressed);
            return bzip2.simple(bzip2Reader);
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default Bzip2Decompress;
