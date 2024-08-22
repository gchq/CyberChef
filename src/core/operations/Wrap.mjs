/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Wrap operation
 */
class Wrap extends Operation {
    constructor() {
        super();

        this.name = "Wrap";
        this.module = "Default";
        this.description = "Wraps the input text at a specified number of characters per line.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Line Width",
                "type": "number",
                "value": 64,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) return "";  // Handle empty input
        const lineWidth = args[0];
        const regex = new RegExp(`.{1,${lineWidth}}`, "g");
        return input.match(regex).join("\n");
    }
}

export default Wrap;
