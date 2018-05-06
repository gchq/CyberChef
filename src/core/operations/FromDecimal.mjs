/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {DELIM_OPTIONS} from "../lib/Delim";

/**
 * From Decimal operation
 */
class FromDecimal extends Operation {

    /**
     * FromDecimal constructor
     */
    constructor() {
        super();

        this.name = "From Decimal";
        this.module = "Default";
        this.description = "Converts the data from an ordinal integer array back into its raw form.<br><br>e.g. <code>72 101 108 108 111</code> becomes <code>Hello</code>";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            output = [];
        let byteStr = input.split(delim);
        if (byteStr[byteStr.length-1] === "")
            byteStr = byteStr.slice(0, byteStr.length-1);

        for (let i = 0; i < byteStr.length; i++) {
            output[i] = parseInt(byteStr[i], 10);
        }
        return output;
    }

}

export default FromDecimal;
