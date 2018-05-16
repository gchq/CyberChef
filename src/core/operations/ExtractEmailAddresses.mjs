/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract email addresses operation
 */
class ExtractEmailAddresses extends Operation {

    /**
     * ExtractEmailAddresses constructor
     */
    constructor() {
        super();

        this.name = "Extract email addresses";
        this.module = "Regex";
        this.description = "Extracts all email addresses from the input.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Display total",
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
        const displayTotal = args[0],
            regex = /\b\w[-.\w]*@[-\w]+(?:\.[-\w]+)*\.[A-Z]{2,4}\b/ig;

        return search(input, regex, null, displayTotal);
    }

}

export default ExtractEmailAddresses;
