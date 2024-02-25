/**
 * @author tedk [tedk@ted.do]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Caret/M-decode operation
 *
 * https://gist.githubusercontent.com/JaHIY/3c91bbf7bea5661e6abfbd1349ee81a2/raw/c7b480e9ff24bcb8f5287a8a8a2dcb9bf5628506/decode_m_notation.cpp
 */
class CaretMdecode extends Operation {

    /**
     * CaretMdecode constructor
     */
    constructor() {
        super();

        this.name = "Caret/M-decode";
        this.module = "Default";
        this.description = "Decodes caret or M-encoded strings, i.e. ^M turns into a newline, M-^] turns into 0x9d. Sources such as `cat -v`.\n\nPlease be aware that when using `cat -v` ^_ (caret-underscore) will not be encoded, but represents a valid encoding (namely that of 0x1f).";
        this.infoURL = "https://en.wikipedia.org/wiki/Caret_notation";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {

        const bytes = [];

        let prev = "";

        for (let i = 0; i < input.length; i++) {

            const charCode = input.charCodeAt(i);
            const curChar = input.charAt(i);

            if (prev === "M-^") {
                if (charCode > 63 && charCode <= 95) {
                    bytes.push(charCode + 64);
                } else if (charCode === 63) {
                    bytes.push(255);
                } else {
                    bytes.push(77, 45, 94, charCode);
                }
                prev = "";
            } else if (prev === "M-") {
                if (curChar === "^") {
                    prev = prev + "^";
                } else if (charCode >= 32 && charCode <= 126) {
                    bytes.push(charCode + 128);
                    prev = "";
                } else {
                    bytes.push(77, 45, charCode);
                    prev = "";
                }
            } else if (prev === "M") {
                if (curChar === "-") {
                    prev = prev + "-";
                } else {
                    bytes.push(77, charCode);
                    prev = "";
                }
            } else if (prev === "^") {
                if (charCode > 63 && charCode <= 126) {
                    bytes.push(charCode - 64);
                } else if (charCode === 63) {
                    bytes.push(127);
                } else {
                    bytes.push(94, charCode);
                }
                prev = "";
            } else {
                if (curChar === "M") {
                    prev = "M";
                } else if (curChar === "^") {
                    prev = "^";
                } else {
                    bytes.push(charCode);
                }
            }

        }
        return bytes;
    }

}

export default CaretMdecode;
