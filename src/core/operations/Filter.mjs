/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {INPUT_DELIM_OPTIONS} from "../lib/Delim";
import OperationError from "../errors/OperationError";

/**
 * Filter operation
 */
class Filter extends Operation {

    /**
     * Filter constructor
     */
    constructor() {
        super();

        this.name = "Filter";
        this.module = "Default";
        this.description = "Splits up the input using the specified delimiter and then filters each branch based on a regular expression.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": INPUT_DELIM_OPTIONS
            },
            {
                "name": "Regex",
                "type": "string",
                "value": ""
            },
            {
                "name": "Invert condition",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            reverse = args[2];
        let regex;

        try {
            regex = new RegExp(args[1]);
        } catch (err) {
            throw new OperationError(`Invalid regex. Details: ${err.message}`);
        }

        const regexFilter = function(value) {
            return reverse ^ regex.test(value);
        };

        return input.split(delim).filter(regexFilter).join(delim);
    }

}

export default Filter;
