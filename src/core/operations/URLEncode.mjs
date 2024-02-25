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
        this.description
            = "Encodes problematic characters into percent-encoding, a format supported by URIs/URLs.<br><br>e.g. <code>=</code> becomes <code>%3d</code>";
        this.infoURL = "https://wikipedia.org/wiki/Percent-encoding";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encode all special chars",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const encodeAll = args[0];
        return encodeAll ? this.encodeAllChars(input) : encodeURI(input);
    }

    /**
     * Encode characters in URL outside of encodeURI() function spec
     *
     * @param {string} str
     * @returns {string}
     */
    encodeAllChars(str) {
        // TODO Do this programmatically
        return encodeURIComponent(str)
            .replace(/!/g, "%21")
            .replace(/#/g, "%23")
            .replace(/'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/\*/g, "%2A")
            .replace(/-/g, "%2D")
            .replace(/\./g, "%2E")
            .replace(/_/g, "%5F")
            .replace(/~/g, "%7E");
    }
}

export default URLEncode;
