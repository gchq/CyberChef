/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation";
import { sub, createNumArray } from "../lib/Arithmetic";
import { DELIM_OPTIONS } from "../lib/Delim";


/**
 * Subtract operation
 */
class Subtract extends Operation {

    /**
     * Subtract constructor
     */
    constructor() {
        super();

        this.name = "Subtract";
        this.module = "Default";
        this.description = "Subtracts a list of numbers. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5</code> becomes <code>1.5</code>";
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
        const val = sub(createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    }

}

export default Subtract;
