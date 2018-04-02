/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import unzip from "zlibjs/bin/unzip.min";

const Zlib = unzip.Zlib;

/**
 * Unzip operation
 */
class Unzip extends Operation {

    /**
     * Unzip constructor
     */
    constructor() {
        super();

        this.name = "Unzip";
        this.module = "Compression";
        this.description = "Decompresses data using the PKZIP algorithm and displays it per file, with support for passwords.";
        this.inputType = "byteArray";
        this.outputType = "html";
        this.args = [
            {
                name: "Password",
                type: "binaryString",
                value: ""
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
     * @returns {html}
     */
    run(input, args) {
        const options = {
                password: Utils.strToByteArray(args[0]),
                verify: args[1]
            },
            unzip = new Zlib.Unzip(input, options),
            filenames = unzip.getFilenames(),
            files = [];

        filenames.forEach(function(fileName) {
            const bytes = unzip.decompress(fileName);
            const contents = Utils.byteArrayToUtf8(bytes);

            const file = {
                fileName: fileName,
                size: contents.length,
            };

            const isDir = contents.length === 0 && fileName.endsWith("/");
            if (!isDir) {
                file.bytes = bytes;
                file.contents = contents;
            }

            files.push(file);
        });

        return Utils.displayFilesAsHTML(files);
    }

}

export default Unzip;
