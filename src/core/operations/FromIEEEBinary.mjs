/**
 * @author atsiv1
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import Operation from "../Operation.mjs";
import { FromIEEE754Float64 } from "../lib/IEEEBinary.mjs";

/**
 * From IEEEBinary operation
 */
class FromIEEEBinary extends Operation {
    /**
     *  FromIEEEBinary constructor
     */
    constructor() {
        super();

        this.name = "From IEEEBinary";
        this.module = "Default";
        this.description = `
            Converts a 64-bit IEEE-754 binary64 representation (float64)
            into its exact decimal value.<br><br>
            Example: <code>0 10000000010 0100000000000000000000000000000000000000000000000000</code>
            becomes <code>10</code>.`;
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
    if (input === null || input === undefined)
        return "";

    input = String(input);

    if (input.trim().length === 0)
        return "";

    try {
        return FromIEEE754Float64(input);
    } catch (err) {
        throw new OperationError(err.message);
    }
} 
}

export default FromIEEEBinary;
