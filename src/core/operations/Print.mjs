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
        this.description = "Prints a register";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Text to print",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        console.log(args);

        //input = args[0].value;
        //return input;
        return args[0].toString();
    }

}

export default Print;
