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
        this.inputType = "byteArray";
        this.outputType = "byteArray";
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
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
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

        const gzip = new Zlib.Gzip(input, options);
        return Array.prototype.slice.call(gzip.compress());
    }

}

export default Gzip;
