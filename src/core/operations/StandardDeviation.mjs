/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Arithmetic from "../lib/Arithmetic";
import BigNumber from "bignumber.js";

/**
 * Standard Deviation operation
 */
class StandardDeviation extends Operation {

    /**
     * StandardDeviation constructor
     */
    constructor() {
        super();

        this.name = "Standard Deviation";
        this.module = "Default";
        this.description = "Computes the standard deviation of a number list. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5</code> becomes <code>4.089281382128433</code>";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": Arithmetic.DELIM_OPTIONS,
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {
        const val = Arithmetic._stdDev(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);

    }

}

export default StandardDeviation;
