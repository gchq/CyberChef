/**
 * @author homer.jonathan [homer.jonathan@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";

/**
 * Extract Bitcoin addresses operation
 */
class ExtractBitcoinAddresses extends Operation {

    /**
     * ExtractIPAddresses constructor
     */
    constructor() {
        super();

        this.name = "Extract Bitcoin Addresses";
        this.module = "Regex";
        this.description = "Extracts all Bitcoin addresses in input provided. ";
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
        const [displayTotal] = args,
            bitcoin = "(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})";

        const bitcoins  = bitcoin;

        if (bitcoins) {
            const regex = new RegExp(bitcoins, "ig");
            return search(input, regex, null, displayTotal);
        } else {
            return "";
        }
    }

}

export default ExtractBitcoinAddresses;
