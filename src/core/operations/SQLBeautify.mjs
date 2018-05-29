/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation";

/**
 * SQL Beautify operation
 */
class SQLBeautify extends Operation {

    /**
     * SQLBeautify constructor
     */
    constructor() {
        super();

        this.name = "SQL Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies Structured Query Language (SQL) code.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Indent string",
                "type": "binaryShortString",
                "value": "\\t"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const indentStr = args[0];
        return vkbeautify.sql(input, indentStr);
    }

}

export default SQLBeautify;
