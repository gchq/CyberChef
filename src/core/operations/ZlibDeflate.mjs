/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {COMPRESSION_TYPE, ZLIB_COMPRESSION_TYPE_LOOKUP} from "../lib/Zlib";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min";

const Zlib = zlibAndGzip.Zlib;

/**
 * Zlib Deflate operation
 */
class ZlibDeflate extends Operation {

    /**
     * ZlibDeflate constructor
     */
    constructor() {
        super();

        this.name = "Zlib Deflate";
        this.module = "Compression";
        this.description = "Compresses data using the deflate algorithm adding zlib headers.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Compression type",
                type: "option",
                value: COMPRESSION_TYPE
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const deflate = new Zlib.Deflate(input, {
            compressionType: ZLIB_COMPRESSION_TYPE_LOOKUP[args[0]]
        });
        return Array.prototype.slice.call(deflate.compress());
    }

}

export default ZlibDeflate;
