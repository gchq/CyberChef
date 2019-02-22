/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {INPUT_DELIM_OPTIONS} from "../lib/Delim";

/**
 * Unique operation
 */
class Unique extends Operation {

    /**
     * Unique constructor
     */
    constructor() {
        super();

        this.name = "Unique";
        this.module = "Default";
        this.description = "Removes duplicate strings from the input.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": INPUT_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]);
        return input.split(delim).unique().join(delim);
    }

}

export default Unique;
