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
import {decodeQuotedPrintable} from "../lib/QuotedPrintable";

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
        this.infoURL = "https://wikipedia.org/wiki/Quoted-printable";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
        this.patterns = [
            {
                match: "^[\\x21-\\x3d\\x3f-\\x7e \\t]{0,76}(?:=[\\da-f]{2}|=\\r?\\n)(?:[\\x21-\\x3d\\x3f-\\x7e \\t]|=[\\da-f]{2}|=\\r?\\n)*$",
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
        return decodeQuotedPrintable(input);
    }

}

export default FromQuotedPrintable;
