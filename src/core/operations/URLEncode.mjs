/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * URL Encode operation
 */
class URLEncode extends Operation {

    /**
     * URLEncode constructor
     */
    constructor() {
        super();

        this.name = "URL Encode";
        this.module = "URL";
        this.description = "Encodes problematic characters into percent-encoding, a format supported by URIs/URLs.<br><br>e.g. <code>=</code> becomes <code>%3d</code>";
        this.infoURL = "https://wikipedia.org/wiki/Percent-encoding";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encode all special chars",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Encode all chars",
                "type": "boolean",
                "value": false
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const encodeSpecial = args[0];
        const encodeAll = args[1];
        return encodeAll ? this.encodeAllChars(input) : encodeSpecial ? this.encodeAllSpecialChars(input) : encodeURI(input);
    }

    /**
     * Pads a string from the front to a given length with a given char
     *
     * @param {string} str
     * @returns {string}
     */
    frontPad (str, length, char) {
        return str.length >= length ? str : (char * (length - str.length)) + str;
    }

    /**
     * Encode characters in URL outside of encodeURI() function spec
     *
     * @param {string} str
     * @returns {string}
     */
    encodeAllSpecialChars (str) {
        const SPECIAL_CHARS = "!#'()*-._~";
        let encoded = "";
        for (const char of str) {
            if (encodeURIComponent(char) === char && SPECIAL_CHARS.includes(char)) {
                encoded += "%" + this.frontPad(char.charCodeAt(0).toString(16).toUpperCase(), 2, "0");
            } else {
                encoded += encodeURIComponent(char);
            }
        }
        return encoded;
    }

    /**
     * Encode ALL characters in URL including alphanumeric based on char codes
     *
     * @param {string} str
     * @returns {string}
     */
    encodeAllChars (str) {
        let encoded = "";
        for (const char of str) {
            encoded += "%" + this.frontPad(char.charCodeAt(0).toString(16).toUpperCase(), 2, "0");
        }
        return encoded;
    }

}


export default URLEncode;
