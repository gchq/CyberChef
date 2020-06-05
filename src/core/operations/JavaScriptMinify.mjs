/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import Operation from "../Operation.mjs";
import Terser from "terser";

/**
 * JavaScript Minify operation
 */
class JavaScriptMinify extends Operation {

    /**
     * JavaScriptMinify constructor
     */
    constructor() {
        super();

        this.name = "JavaScript Minify";
        this.module = "Code";
        this.description = "Compresses JavaScript code.";
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
        const result = Terser.minify(input);
        if (result.error) {
            throw new OperationError(`Error minifying JavaScript. (${result.error})`);
        }
        return result.code;
    }

}

export default JavaScriptMinify;
