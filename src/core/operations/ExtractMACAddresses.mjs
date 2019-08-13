/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";

/**
 * Extract MAC addresses operation
 */
class ExtractMACAddresses extends Operation {

    /**
     * ExtractMACAddresses constructor
     */
    constructor() {
        super();

        this.name = "Extract MAC addresses";
        this.module = "Regex";
        this.description = "Extracts all Media Access Control (MAC) addresses from the input.";
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
            regex = /[A-F\d]{2}(?:[:-][A-F\d]{2}){5}/ig;

        return search(input, regex, null, displayTotal);
    }

}

export default ExtractMACAddresses;
