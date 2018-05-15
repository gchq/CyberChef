/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Arithmetic from "./baseClasses/Arithmetic";
import BigNumber from "bignumber.js";

/**
 * Sum operation
 */
class Sum extends Operation {

    /**
     * Sum constructor
     */
    constructor() {
        super();

        this.name = "Sum";
        this.module = "Default";
        this.description = "Adds together a list of numbers. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5</code> becomes <code>18.5</code>";
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
        const val = Arithmetic._sum(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    }

}

export default Sum;
