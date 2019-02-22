/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {DELIM_OPTIONS} from "../lib/Delim";


/**
 * To Decimal operation
 */
class ToDecimal extends Operation {

    /**
     * ToDecimal constructor
     */
    constructor() {
        super();

        this.name = "To Decimal";
        this.module = "Default";
        this.description = "Converts the input data to an ordinal integer array.<br><br>e.g. <code>Hello</code> becomes <code>72 101 108 108 111</code>";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            },
            {
                "name": "Support signed values",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            signed = args[1];
        if (signed) {
            input = input.map(v => v > 0x7F ? v - 0xFF - 1 : v);
        }
        return input.join(delim);
    }

}

export default ToDecimal;
