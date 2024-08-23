/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * InsertDelimiter operation
 */
class InsertDelimiter extends Operation {

    /**
     * InsertDelimiter constructor
     */
    constructor() {
        super();
        this.name = "Insert Delimiter";
        this.module = "Default";
        this.description = "Inserts a given delimiter at regular intervals within the input string.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Interval",
                "type": "number",
                "value": 8,  // Default interval is 8
            },
            {
                "name": "Delimiter",
                "type": "string",
                "value": " ",  // Default delimiter is a space
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) return "";

        if (isNaN(args[0]) || args[0] <= 0) {
            return "Invalid interval: must be a positive integer.";
        }

        return input.match(new RegExp(`.{1,${parseInt(args[0], 10)}}`, "g")).join(args[1]);
    }
}

export default InsertDelimiter;
