/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min.js";
import magicObject from "../lib/MagicObject.mjs";

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
        this.infoURL = "https://wikipedia.org/wiki/Gzip";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
        this.checks = new magicObject([
            {
                match: "^\\x1f\\x8b\\x08",
                flags: "",
                magic:  true,
                args: []
            },
        ]);
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {File}
     */
    run(input, args) {
        const gunzip = new Zlib.Gunzip(new Uint8Array(input));
        return new Uint8Array(gunzip.decompress()).buffer;
    }

}

export default Gunzip;
