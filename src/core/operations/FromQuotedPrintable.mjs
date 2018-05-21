/**
 * Some parts taken from mimelib (http://github.com/andris9/mimelib)
 * @author Andris Reinman
 * @license MIT
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * From Quoted Printable operation
 */
class FromQuotedPrintable extends Operation {

    /**
     * FromQuotedPrintable constructor
     */
    constructor() {
        super();

        this.name = "From Quoted Printable";
        this.module = "Default";
        this.description = "Converts QP-encoded text back to standard text.";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
        this.patterns = [
            {
                match: "^[\\x21-\\x3d\\x3f-\\x7e \\t]*(?:=[\\da-f]{2}|=\\r?\\n)(?:[\\x21-\\x3d\\x3f-\\x7e \\t]|=[\\da-f]{2}|=\\r?\\n)*$",
                flags: "i",
                args: []
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const str = input.replace(/=(?:\r?\n|$)/g, "");

        const encodedBytesCount = (str.match(/=[\da-fA-F]{2}/g) || []).length,
            bufferLength = str.length - encodedBytesCount * 2,
            buffer = new Array(bufferLength);
        let chr, hex,
            bufferPos = 0;

        for (let i = 0, len = str.length; i < len; i++) {
            chr = str.charAt(i);
            if (chr === "=" && (hex = str.substr(i + 1, 2)) && /[\da-fA-F]{2}/.test(hex)) {
                buffer[bufferPos++] = parseInt(hex, 16);
                i += 2;
                continue;
            }
            buffer[bufferPos++] = chr.charCodeAt(0);
        }

        return buffer;
    }

}

export default FromQuotedPrintable;
