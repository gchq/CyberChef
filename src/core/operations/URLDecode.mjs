/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * URL Decode operation
 */
class URLDecode extends Operation {

    /**
     * URLDecode constructor
     */
    constructor() {
        super();

        this.name = "URL Decode";
        this.module = "URL";
        this.description = "Converts URI/URL percent-encoded characters back to their raw values.<br><br>e.g. <code>%3d</code> becomes <code>=</code>";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = input.replace(/\+/g, "%20");
        try {
            return decodeURIComponent(data);
        } catch (err) {
            return unescape(data);
        }
    }

}

export default URLDecode;
