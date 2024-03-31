/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import unzip from "zlibjs/bin/unzip.min.js";

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
        this.infoURL = "https://wikipedia.org/wiki/Zip_(file_format)";
        this.inputType = "ArrayBuffer";
        this.outputType = "List<File>";
        this.presentType = "html";
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
        this.checks = [
            {
                pattern: "^\\x50\\x4b(?:\\x03|\\x05|\\x07)(?:\\x04|\\x06|\\x08)",
                flags: "",
                args: ["", false]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {File[]}
     */
    run(input, args) {
        const options = {
                password: Utils.strToByteArray(args[0]),
                verify: args[1]
            },
            unzip = new Zlib.Unzip(new Uint8Array(input), options),
            filenames = unzip.getFilenames();

        return filenames.map(fileName => {
            const bytes = unzip.decompress(fileName);
            return new File([bytes], fileName);
        });
    }

    /**
     * Displays the files in HTML for web apps.
     *
     * @param {File[]} files
     * @returns {html}
     */
    async present(files) {
        return await Utils.displayFilesAsHTML(files);
    }

}

export default Unzip;
