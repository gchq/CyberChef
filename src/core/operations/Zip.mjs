/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {COMPRESSION_TYPE, ZLIB_COMPRESSION_TYPE_LOOKUP} from "../lib/Zlib.mjs";
import zip from "zlibjs/bin/zip.min.js";

const Zlib = zip.Zlib;

const ZIP_COMPRESSION_METHOD_LOOKUP = {
    "Deflate":      Zlib.Zip.CompressionMethod.DEFLATE,
    "None (Store)": Zlib.Zip.CompressionMethod.STORE
};

const ZIP_OS_LOOKUP = {
    "MSDOS":     Zlib.Zip.OperatingSystem.MSDOS,
    "Unix":      Zlib.Zip.OperatingSystem.UNIX,
    "Macintosh": Zlib.Zip.OperatingSystem.MACINTOSH
};

/**
 * Zip operation
 */
class Zip extends Operation {

    /**
     * Zip constructor
     */
    constructor() {
        super();

        this.name = "Zip";
        this.module = "Compression";
        this.description = "Compresses data using the PKZIP algorithm with the given filename.<br><br>No support for multiple files at this time.";
        this.infoURL = "https://wikipedia.org/wiki/Zip_(file_format)";
        this.inputType = "ArrayBuffer";
        this.outputType = "File";
        this.args = [
            {
                name: "Filename",
                type: "string",
                value: "file.txt"
            },
            {
                name: "Comment",
                type: "string",
                value: ""
            },
            {
                name: "Password",
                type: "binaryString",
                value: ""
            },
            {
                name: "Compression method",
                type: "option",
                value: ["Deflate", "None (Store)"]
            },
            {
                name: "Operating system",
                type: "option",
                value: ["MSDOS", "Unix", "Macintosh"]
            },
            {
                name: "Compression type",
                type: "option",
                value: COMPRESSION_TYPE
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {File}
     */
    run(input, args) {
        const filename = args[0],
            password = Utils.strToByteArray(args[2]),
            options = {
                filename: Utils.strToByteArray(filename),
                comment: Utils.strToByteArray(args[1]),
                compressionMethod: ZIP_COMPRESSION_METHOD_LOOKUP[args[3]],
                os: ZIP_OS_LOOKUP[args[4]],
                deflateOption: {
                    compressionType: ZLIB_COMPRESSION_TYPE_LOOKUP[args[5]]
                },
            },
            zip = new Zlib.Zip();

        if (password.length)
            zip.setPassword(password);
        zip.addFile(new Uint8Array(input), options);
        return new File([zip.compress()], filename);
    }

}

export default Zip;
