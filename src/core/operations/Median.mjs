/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation";
import { median, createNumArray } from "../lib/Arithmetic";
import { DELIM_OPTIONS } from "../lib/Delim";

/**
 * Median operation
 */
class Median extends Operation {

    /**
     * Median constructor
     */
    constructor() {
        super();

        this.name = "Median";
        this.module = "Default";
        this.description = "Computes the median of a number list. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 1 .5</code> becomes <code>4.5</code>";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS,
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const val = median(createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    }

}

export default Median;
