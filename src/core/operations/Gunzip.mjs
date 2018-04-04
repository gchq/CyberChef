/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min";

const Zlib = zlibAndGzip.Zlib;

/**
 * Gunzip operation
 */
class Gunzip extends Operation {

    /**
     * Gunzip constructor
     */
    constructor() {
        super();

        this.name = "Gunzip";
        this.module = "Compression";
        this.description = "Decompresses data which has been compressed using the deflate algorithm with gzip headers.";
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
        // Deal with character encoding issues
        input = Utils.strToByteArray(Utils.byteArrayToUtf8(input));
        const gunzip = new Zlib.Gunzip(input);
        return Array.prototype.slice.call(gunzip.decompress());
    }

}

export default Gunzip;
