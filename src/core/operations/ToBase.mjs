/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * To Base operation
 */
class ToBase extends Operation {

    /**
     * ToBase constructor
     */
    constructor() {
        super();

        this.name = "To Base";
        this.module = "Default";
        this.description = "Converts a decimal number to a given numerical base.";
        this.infoURL = "https://wikipedia.org/wiki/Radix";
        this.inputType = "BigNumber";
        this.outputType = "string";
        this.args = [
            {
                "name": "Radix",
                "type": "number",
                "value": 36,
                "min": 2,
                "max": 36,
                "integer": true,
            }
        ];
    }

    /**
     * @param {BigNumber} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) {
            throw new OperationError("Error: Input must be a number");
        }
        const radix = args[0];
        return input.toString(radix);
    }

}

export default ToBase;
