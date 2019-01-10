/**
 * @author masq [github.cyberchef@masq.cc]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * To Case Insensitive Regex operation
 */
class ToCaseInsensitiveRegex extends Operation {

    /**
     * ToCaseInsensitiveRegex constructor
     */
    constructor() {
        super();

        this.name = "To Case Insensitive Regex";
        this.module = "Default";
        this.description = "Converts a case-sensitive regex string into a case-insensitive regex string in case /i flag is unavailable to you.";
        this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
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
        return input.replace(/[a-z]/ig, m => `[${m.toLowerCase()}${m.toUpperCase()}]`);
    }
}

export default ToCaseInsensitiveRegex;
