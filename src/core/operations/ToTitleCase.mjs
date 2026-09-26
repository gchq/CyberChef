/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Title Case operation
 */
class ToTitleCase extends Operation {

    /**
     * ToTitleCase constructor
     */
    constructor() {
        super();

        this.name = "To Title Case";
        this.module = "Default";
        this.description = "Converts the first letter of each word to upper case and the remaining letters to lower case, while preserving punctuation and spacing.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        return input.toLowerCase().replace(
            /(^|[^\p{L}\p{N}])(\p{L})/gu,
            (match, prefix, letter) => prefix + letter.toUpperCase()
        );
    }

}

export default ToTitleCase;
