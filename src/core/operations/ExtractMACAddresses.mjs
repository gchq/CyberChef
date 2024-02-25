/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";
import { hexadecimalSort } from "../lib/Sort.mjs";

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
                name: "Display total",
                type: "boolean",
                value: false
            },
            {
                name: "Sort",
                type: "boolean",
                value: false
            },
            {
                name: "Unique",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [displayTotal, sort, unique] = args,
            regex = /[A-F\d]{2}(?:[:-][A-F\d]{2}){5}/gi,
            results = search(input, regex, null, sort ? hexadecimalSort : null, unique);

        if (displayTotal) {
            return `Total found: ${results.length}\n\n${results.join("\n")}`;
        } else {
            return results.join("\n");
        }
    }
}

export default ExtractMACAddresses;
