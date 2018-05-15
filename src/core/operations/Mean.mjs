/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { mean, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";
import BigNumber from "bignumber.js";

/**
 * Mean operation
 */
class Mean extends Operation {

    /**
     * Mean constructor
     */
    constructor() {
        super();

        this.name = "Mean";
        this.module = "Default";
        this.description = "Computes the mean (average) of a number list. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5 .5</code> becomes <code>4.75</code>";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": ARITHMETIC_DELIM_OPTIONS,
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const val = mean(createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    }

}

export default Mean;
