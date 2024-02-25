/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Remove line numbers operation
 */
class RemoveLineNumbers extends Operation {
    /**
     * RemoveLineNumbers constructor
     */
    constructor() {
        super();

        this.name = "Remove line numbers";
        this.module = "Default";
        this.description =
            "Removes line numbers from the output if they can be trivially detected.";
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
        return input.replace(/^[ \t]{0,5}\d+[\s:|\-,.)\]]/gm, "");
    }
}

export default RemoveLineNumbers;
