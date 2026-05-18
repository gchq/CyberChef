/**
 * @author Joshua [ebert.joshua@protonmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Print operation
 */
class Print extends Operation {

    /**
     * Print constructor
     */
    constructor() {
        super();

        this.name = "Print";
        this.module = "Other";
        this.description = "Prints a text to the output.";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Text to print",
                type: "string",
                value: ""
            },
            {
                name: "Replace",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [text, replace] = args;
        if (replace) {
            return text.toString();
        }
        return input + text.toString();
    }

}

export default Print;
