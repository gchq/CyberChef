/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {COMPRESSION_TYPE} from "../lib/Zlib";
import rawdeflate from "zlibjs/bin/rawdeflate.min";

const Zlib = rawdeflate.Zlib;

const RAW_COMPRESSION_TYPE_LOOKUP = {
    "Fixed Huffman Coding":   Zlib.RawDeflate.CompressionType.FIXED,
    "Dynamic Huffman Coding": Zlib.RawDeflate.CompressionType.DYNAMIC,
    "None (Store)":           Zlib.RawDeflate.CompressionType.NONE,
};

/**
 * Raw Deflate operation
 */
class RawDeflate extends Operation {

    /**
     * RawDeflate constructor
     */
    constructor() {
        super();

        this.name = "Raw Deflate";
        this.module = "Default";
        this.description = "Compresses data using the deflate algorithm with no headers.";
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
        const deflate = new Zlib.RawDeflate(input, {
            compressionType: RAW_COMPRESSION_TYPE_LOOKUP[args[0]]
        });
        return Array.prototype.slice.call(deflate.compress());
    }

}

export default RawDeflate;
