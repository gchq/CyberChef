/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation";

/**
 * JSON Minify operation
 */
class JSONMinify extends Operation {

    /**
     * JSONMinify constructor
     */
    constructor() {
        super();

        this.name = "JSON Minify";
        this.module = "Code";
        this.description = "Compresses JavaScript Object Notation (JSON) code.";
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
        if (!input) return "";
        return vkbeautify.jsonmin(input);
    }

}

export default JSONMinify;
