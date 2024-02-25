/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation.mjs";
import { div, createNumArray } from "../lib/Arithmetic.mjs";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * Divide operation
 */
class Divide extends Operation {
    /**
     * Divide constructor
     */
    constructor() {
        super();

        this.name = "Divide";
        this.module = "Default";
        this.description =
            "Divides a list of numbers. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5</code> becomes <code>2.5</code>";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: ARITHMETIC_DELIM_OPTIONS,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const val = div(createNumArray(input, args[0]));
        return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
    }
}

export default Divide;
