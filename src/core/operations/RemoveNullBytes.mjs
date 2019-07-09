/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Remove null bytes operation
 */
class RemoveNullBytes extends Operation {

    /**
     * RemoveNullBytes constructor
     */
    constructor() {
        super();

        this.name = "Remove null bytes";
        this.module = "Default";
        this.description = "Removes all null bytes (<code>0x00</code>) from the input.";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const output = [];
        for (let i = 0; i < input.length; i++) {
            if (input[i] !== 0) output.push(input[i]);
        }
        return output;
    }

}

export default RemoveNullBytes;
