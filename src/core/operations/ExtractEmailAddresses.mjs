/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";
import { caseInsensitiveSort } from "../lib/Sort.mjs";

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
        const [displayTotal, sort, unique] = args,
            // email regex from: https://www.regextester.com/98066
            regex =
                /(?:[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9](?:[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9-]*[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9])?\.)+[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9](?:[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9-]*[\u00A0-\uD7FF\uE000-\uFFFFa-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}\])/gi;

        const results = search(
            input,
            regex,
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

export default ExtractEmailAddresses;
