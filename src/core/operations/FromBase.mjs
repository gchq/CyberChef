/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import BigNumber from "bignumber.js";
import OperationError from "../errors/OperationError";

/**
 * From Base operation
 */
class FromBase extends Operation {

    /**
     * FromBase constructor
     */
    constructor() {
        super();

        this.name = "From Base";
        this.module = "Default";
        this.description = "Converts a number to decimal from a given numerical base.";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Radix",
                "type": "number",
                "value": 36
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const radix = args[0];
        if (radix < 2 || radix > 36) {
            throw new OperationError("Error: Radix argument must be between 2 and 36");
        }

        const number = input.replace(/\s/g, "").split(".");
        let result = new BigNumber(number[0], radix) || 0;

        if (number.length === 1) return result;

        // Fractional part
        for (let i = 0; i < number[1].length; i++) {
            const digit = new BigNumber(number[1][i], radix);
            result += digit.div(Math.pow(radix, i+1));
        }

        return result;
    }

}

export default FromBase;
