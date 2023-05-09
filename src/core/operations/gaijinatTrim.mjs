/**
 * @author gaijinat [web@gaijin.at]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Trim operation
 */
class Trim extends Operation {

    /**
     * Trim constructor
     */
    constructor() {
        super();

        this.name = "Trim";
        this.module = "Default";
        this.description = "Removes all whitespaces and line breaks from the beginning, end or both of the input data.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Position",
                type: "option",
                value: ["Start", "End", "Both"],
                defaultIndex: 2
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [position] = args;
        let output = "";

        switch (position) {
            case "Start":
                output = input.trimStart();
                break;
            case "End":
                output = input.trimEnd();
                break;
            default:
                output = input.trim();
        }

        return output;
    }

}

export default Trim;
