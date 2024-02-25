/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation.mjs";

/**
 * SQL Minify operation
 */
class SQLMinify extends Operation {
    /**
     * SQLMinify constructor
     */
    constructor() {
        super();

        this.name = "SQL Minify";
        this.module = "Code";
        this.description = "Compresses Structured Query Language (SQL) code.";
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
        return vkbeautify.sqlmin(input);
    }
}

export default SQLMinify;
