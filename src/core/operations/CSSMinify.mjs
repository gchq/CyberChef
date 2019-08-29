/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation.mjs";

/**
 * CSS Minify operation
 */
class CSSMinify extends Operation {

    /**
     * CSSMinify constructor
     */
    constructor() {
        super();

        this.name = "CSS Minify";
        this.module = "Code";
        this.description = "Compresses Cascading Style Sheets (CSS) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Preserve comments",
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
        const preserveComments = args[0];
        return vkbeautify.cssmin(input, preserveComments);
    }

}

export default CSSMinify;
