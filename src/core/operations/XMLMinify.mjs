/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation.mjs";

/**
 * XML Minify operation
 */
class XMLMinify extends Operation {
    /**
     * XMLMinify constructor
     */
    constructor() {
        super();

        this.name = "XML Minify";
        this.module = "Code";
        this.description = "Compresses eXtensible Markup Language (XML) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Preserve comments",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const preserveComments = args[0];
        return vkbeautify.xmlmin(input, preserveComments);
    }
}

export default XMLMinify;
