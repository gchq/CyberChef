/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {INFLATE_BUFFER_TYPE} from "../lib/Zlib";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min";

const Zlib = zlibAndGzip.Zlib;

const ZLIB_BUFFER_TYPE_LOOKUP = {
    "Adaptive": Zlib.Inflate.BufferType.ADAPTIVE,
    "Block":    Zlib.Inflate.BufferType.BLOCK,
};

/**
 * Zlib Inflate operation
 */
class ZlibInflate extends Operation {

    /**
     * ZlibInflate constructor
     */
    constructor() {
        super();

        this.name = "Zlib Inflate";
        this.module = "Compression";
        this.description = "Decompresses data which has been compressed using the deflate algorithm with zlib headers.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Start index",
                type: "number",
                value: 0
            },
            {
                name: "Initial output buffer size",
                type: "number",
                value: 0
            },
            {
                name: "Buffer expansion type",
                type: "option",
                value: INFLATE_BUFFER_TYPE
            },
            {
                name: "Resize buffer after decompression",
                type: "boolean",
                value: false
            },
            {
                name: "Verify result",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        // Deal with character encoding issues
        input = Utils.strToByteArray(Utils.byteArrayToUtf8(input));
        const inflate = new Zlib.Inflate(input, {
            index: args[0],
            bufferSize: args[1],
            bufferType: ZLIB_BUFFER_TYPE_LOOKUP[args[2]],
            resize: args[3],
            verify: args[4]
        });
        return Array.prototype.slice.call(inflate.decompress());
    }

}

export default ZlibInflate;
