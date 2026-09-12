/**
 * @author scottdermott [scottdermott@outlook.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Basic Arithmetic operation
 */
class BasicArithmetic extends Operation {

    /**
     * BasicArithmetic constructor
     */
    constructor() {
        super();

        this.name = "Basic Arithmetic";
        this.module = "Default";
        this.description = "Evalutes Basic Arithmetic. <br><br>e.g. <code>1+2-1</code> becomes <code>2</code>";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [];
    }
    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        if (parseInt(input, 10).toString().length === input.length) {
            return parseInt(input, 10);
        } else if (input.match(/[+-]?([0-9.]+)/g)) {
            return (input.replace(/\s/g, "").match(/[+-]?([0-9.]+)/g) || [])
                .reduce(function (sum, value) {
                    return parseFloat(sum) + parseFloat(value);
                });
        } else {
            return NaN;
        }
    }

}

export default BasicArithmetic;
