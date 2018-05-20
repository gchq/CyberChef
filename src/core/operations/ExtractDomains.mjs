/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract domains operation
 */
class ExtractDomains extends Operation {

    /**
     * ExtractDomains constructor
     */
    constructor() {
        super();

        this.name = "Extract domains";
        this.module = "Regex";
        this.description = "Extracts domain names.<br>Note that this will not include paths. Use <strong>Extract URLs</strong> to find entire URLs.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Display total",
                "type": "boolean",
                "value": "Extract.DISPLAY_TOTAL"
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
            regex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/ig;

        return search(input, regex, null, displayTotal);
    }

}

export default ExtractDomains;
