/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";

/**
 * Extract dates operation
 */
class ExtractDates extends Operation {
    /**
     * ExtractDates constructor
     */
    constructor() {
        super();

        this.name = "Extract dates";
        this.module = "Regex";
        this.description
            = "Extracts dates in the following formats<ul><li><code>yyyy-mm-dd</code></li><li><code>dd/mm/yyyy</code></li><li><code>mm/dd/yyyy</code></li></ul>Dividers can be any of /, -, . or space";
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
            date1 = "(?:19|20)\\d\\d[- /.](?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])", // yyyy-mm-dd
            date2 = "(?:0[1-9]|[12][0-9]|3[01])[- /.](?:0[1-9]|1[012])[- /.](?:19|20)\\d\\d", // dd/mm/yyyy
            date3 = "(?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])[- /.](?:19|20)\\d\\d", // mm/dd/yyyy
            regex = new RegExp(date1 + "|" + date2 + "|" + date3, "ig");

        const results = search(input, regex);

        if (displayTotal) {
            return `Total found: ${results.length}\n\n${results.join("\n")}`;
        } else {
            return results.join("\n");
        }
    }
}

export default ExtractDates;
