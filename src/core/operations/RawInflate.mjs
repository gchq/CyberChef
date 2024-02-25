/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { INFLATE_BUFFER_TYPE } from "../lib/Zlib.mjs";
import rawinflate from "zlibjs/bin/rawinflate.min.js";

const Zlib = rawinflate.Zlib;

const RAW_BUFFER_TYPE_LOOKUP = {
    "Adaptive": Zlib.RawInflate.BufferType.ADAPTIVE,
    "Block": Zlib.RawInflate.BufferType.BLOCK
};

/**
 * Raw Inflate operation
 */
class RawInflate extends Operation {
    /**
     * RawInflate constructor
     */
    constructor() {
        super();

        this.name = "Raw Inflate";
        this.module = "Compression";
        this.description = "Decompresses data which has been compressed using the deflate algorithm with no headers.";
        this.infoURL = "https://wikipedia.org/wiki/DEFLATE";
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
                entropyRange: [7.5, 8],
                args: [0, 0, INFLATE_BUFFER_TYPE, false, false]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const inflate = new Zlib.RawInflate(new Uint8Array(input), {
                index: args[0],
                bufferSize: args[1],
                bufferType: RAW_BUFFER_TYPE_LOOKUP[args[2]],
                resize: args[3],
                verify: args[4]
            }),
            result = new Uint8Array(inflate.decompress());

        return result.buffer;
    }
}

export default RawInflate;
