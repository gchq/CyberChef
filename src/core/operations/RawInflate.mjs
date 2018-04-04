/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {INFLATE_BUFFER_TYPE} from "../lib/Zlib";
import rawinflate from "zlibjs/bin/rawinflate.min";

const Zlib = rawinflate.Zlib;

const RAW_BUFFER_TYPE_LOOKUP = {
    "Adaptive": Zlib.RawInflate.BufferType.ADAPTIVE,
    "Block":    Zlib.RawInflate.BufferType.BLOCK,
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
        const inflate = new Zlib.RawInflate(input, {
                index: args[0],
                bufferSize: args[1],
                bufferType: RAW_BUFFER_TYPE_LOOKUP[args[2]],
                resize: args[3],
                verify: args[4]
            }),
            result = Array.prototype.slice.call(inflate.decompress());

        // Raw Inflate somethimes messes up and returns nonsense like this:
        // ]....]....]....]....]....]....]....]....]....]....]....]....]....]...
        // e.g. Input data of [8b, 1d, dc, 44]
        // Look for the first two square brackets:
        if (result.length > 158 && result[0] === 93 && result[5] === 93) {
            // If the first two square brackets are there, check that the others
            // are also there. If they are, throw an error. If not, continue.
            let valid = false;
            for (let i = 0; i < 155; i += 5) {
                if (result[i] !== 93) {
                    valid = true;
                }
            }

            if (!valid) {
                throw "Error: Unable to inflate data";
            }
        }
        // This seems to be the easiest way...
        return result;
    }

}

export default RawInflate;
