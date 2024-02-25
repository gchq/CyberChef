/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { INFLATE_BUFFER_TYPE } from "../lib/Zlib.mjs";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min.js";

const Zlib = zlibAndGzip.Zlib;

const ZLIB_BUFFER_TYPE_LOOKUP = {
    "Adaptive": Zlib.Inflate.BufferType.ADAPTIVE,
    "Block": Zlib.Inflate.BufferType.BLOCK
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
        this.infoURL = "https://wikipedia.org/wiki/Zlib";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
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
        this.checks = [
            {
                pattern: "^\\x78(\\x01|\\x9c|\\xda|\\x5e)",
                flags: "",
                args: [0, 0, "Adaptive", false, false]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const inflate = new Zlib.Inflate(new Uint8Array(input), {
            index: args[0],
            bufferSize: args[1],
            bufferType: ZLIB_BUFFER_TYPE_LOOKUP[args[2]],
            resize: args[3],
            verify: args[4]
        });
        return new Uint8Array(inflate.decompress()).buffer;
    }
}

export default ZlibInflate;
