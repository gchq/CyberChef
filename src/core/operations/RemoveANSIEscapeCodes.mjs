/**
 * @author Louis-Ladd [lewisharshman1@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Remove ANSI Escape Codes operation
 */
class RemoveANSIEscapeCodes extends Operation {

    /**
     * RemoveANSIEscapeCodes constructor
     */
    constructor() {
        super();

        this.name = "Remove ANSI Escape Codes";
        this.module = "Default";
        this.description = "Removes ANSI Escape Codes.";
        this.infoURL = "https://en.wikipedia.org/wiki/ANSI_escape_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const ansiRegex = /(?:\x1B|\\x1b|\\033|\\u001b|\\e)\[[0-?]*[ -/]*[@-~]/g;
        return input.replace(ansiRegex, "");
    }

}

export default RemoveANSIEscapeCodes;
