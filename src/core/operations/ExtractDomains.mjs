/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search, DOMAIN_REGEX } from "../lib/Extract.mjs";
import { caseInsensitiveSort } from "../lib/Sort.mjs";

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
        this.description =
            "Extracts fully qualified domain names.<br>Note that this will not include paths. Use <strong>Extract URLs</strong> to find entire URLs.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Display total",
                type: "boolean",
                value: false,
            },
            {
                name: "Sort",
                type: "boolean",
                value: false,
            },
            {
                name: "Unique",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [displayTotal, sort, unique] = args;

        const results = search(
            input,
            DOMAIN_REGEX,
            null,
            sort ? caseInsensitiveSort : null,
            unique,
        );

        if (displayTotal) {
            return `Total found: ${results.length}\n\n${results.join("\n")}`;
        } else {
            return results.join("\n");
        }
    }
}

export default ExtractDomains;
