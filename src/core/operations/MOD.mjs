/**
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation.mjs";
import { createNumArray } from "../lib/Arithmetic.mjs";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim.mjs";


/**
 * MOD operation
 */
class MOD extends Operation {

    /**
     * MOD constructor
     */
    constructor() {
        super();

        this.name = "MOD";
        this.module = "Default";
        this.description = "Computes the modulo of each number in a list with a given modulus value. Numbers are extracted from the input based on the delimiter, and non-numeric values are ignored.<br><br>e.g. <code>15 4 7</code> with modulus <code>3</code> becomes <code>0 1 1</code>";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Modulus",
                "type": "number",
                "value": 2
            },
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
     * @returns {string}
     */
    run(input, args) {
        const modulus = new BigNumber(args[0]);
        const delimiter = args[1];

        if (modulus.isZero()) {
            throw new Error("Modulus cannot be zero");
        }

        const numbers = createNumArray(input, delimiter);
        const results = numbers.map(num => num.mod(modulus));

        return results.join(" ");
    }

}

export default MOD;
