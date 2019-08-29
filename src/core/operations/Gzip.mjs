/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {COMPRESSION_TYPE, ZLIB_COMPRESSION_TYPE_LOOKUP} from "../lib/Zlib.mjs";
import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min.js";

const Zlib = zlibAndGzip.Zlib;

/**
 * Gzip operation
 */
class Gzip extends Operation {

    /**
     * Gzip constructor
     */
    constructor() {
        super();

        this.name = "Gzip";
        this.module = "Compression";
        this.description = "Compresses data using the deflate algorithm with gzip headers.";
        this.infoURL = "https://wikipedia.org/wiki/Gzip";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Compression type",
                type: "option",
                value: COMPRESSION_TYPE
            },
            {
                name: "Filename (optional)",
                type: "string",
                value: ""
            },
            {
                name: "Comment (optional)",
                type: "string",
                value: ""
            },
            {
                name: "Include file checksum",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const filename = args[1],
            comment = args[2],
            options = {
                deflateOptions: {
                    compressionType: ZLIB_COMPRESSION_TYPE_LOOKUP[args[0]]
                },
                flags: {
                    fhcrc: args[3]
                }
            };

        if (filename.length) {
            options.flags.fname = true;
            options.filename = filename;
        }
        if (comment.length) {
            options.flags.fcommenct = true;
            options.comment = comment;
        }

        const gzip = new Zlib.Gzip(new Uint8Array(input), options);
        return new Uint8Array(gzip.compress()).buffer;
    }

}

export default Gzip;
