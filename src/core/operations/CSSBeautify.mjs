/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import vkbeautify from "vkbeautify";
import Operation from "../Operation.mjs";

/**
 * CSS Beautify operation
 */
class CSSBeautify extends Operation {
    /**
     * CSSBeautify constructor
     */
    constructor() {
        super();

        this.name = "CSS Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies Cascading Style Sheets (CSS) code.";
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
        return vkbeautify.css(input, indentStr);
    }
}

export default CSSBeautify;
