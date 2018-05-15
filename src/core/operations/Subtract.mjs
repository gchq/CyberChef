/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Arithmetic from "./baseClasses/Arithmetic";
import BigNumber from "bignumber.js";

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
        const val = Arithmetic._sub(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    }

}

export default Subtract;
