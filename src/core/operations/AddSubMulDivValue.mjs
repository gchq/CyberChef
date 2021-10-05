/**
 * @author BigYellowHammer
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation.mjs";
import { sum, sub, multi, div, createNumArrayFromTwoStrings } from "../lib/Arithmetic.mjs";

/**
 * Math operations
 */
const ARITMETIC_OPTIONS = ["Add", "Subtract", "Multiply", "Divide"];

/**
 * Sum operation
 */
class AddSubMulDivValue extends Operation {

    /**
     * Sum constructor
     */
    constructor() {
        super();

        this.name = "Add/Subtract/Multiply/Divide by value";
        this.module = "Default";
        this.description = "Performs aritmetical operation between the input and argument specified by the user";
        this.inputType = "string";
        this.outputType = "BigNumber";
        this.args = [
            {
                "name": "Operation",
                "type": "option",
                "value": ARITMETIC_OPTIONS,
            },
            {
                "name": "Value",
                "type": "shortString",
                "value": ""
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    run(input, args) {

        const arr = createNumArrayFromTwoStrings(input, args[1]);
        let val;

        switch (args[0]) {
            case "Add":
                val = sum(arr);
                break;
            case "Subtract":
                val = sub(arr);
                break;
            case "Multiply":
                val = multi(arr);
                break;
            case "Divide":
                val = div(arr);
                break;
            default:
                break;
        }

        return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
    }

}

export default AddSubMulDivValue;
