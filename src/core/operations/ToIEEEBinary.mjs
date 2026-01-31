/**
 * @author atsiv1
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { ToIEEE754Float64 } from "../lib/IEEEBinary.mjs";

/**
 * To IEEEBinary operation
 */
class ToIEEEBinary extends Operation {
    /**
     *  ToIEEEBinary constructor
     */
    constructor() {
        super();

        this.name = "To IEEEBinary";
        this.module = "Default";
        this.description = `
            Converts a decimal number into IEEE-754 double-precision float64.<br><br>
            Example: <code>2</code> becomes
            <code>0 10000000000 0000000000000000000000000000000000000000000000000000</code>.`;
        this.infoURL = "https://en.wikipedia.org/wiki/IEEE_754";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input || input.trim().length === 0) {
            return "";
        }

        return ToIEEE754Float64(input);
    }
}

export default ToIEEEBinary;
