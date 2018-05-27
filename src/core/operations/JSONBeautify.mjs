/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation";

/**
 * JSON Beautify operation
 */
class JSONBeautify extends Operation {

    /**
     * JSONBeautify constructor
     */
    constructor() {
        super();

        this.name = "JSON Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies JavaScript Object Notation (JSON) code.";
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
        if (!input) return "";
        return vkbeautify.json(input, indentStr);
    }

}

export default JSONBeautify;
