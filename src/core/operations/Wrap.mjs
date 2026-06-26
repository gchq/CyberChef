/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

const MAX_LINE_WIDTH = 65536;

/**
 * Wrap operation
 */
class Wrap extends Operation {

    /**
     * Wrap constructor
     */
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
                "min": 1,
                "max": MAX_LINE_WIDTH,
                "integer": true,
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

        if (!Number.isInteger(lineWidth))
            throw new OperationError("Line Width must be an integer.");

        if (lineWidth < 1)
            throw new OperationError("Line Width must be greater than or equal to 1.");

        if (lineWidth > MAX_LINE_WIDTH)
            throw new OperationError(`Line Width must be less than or equal to ${MAX_LINE_WIDTH}.`);

        const regex = new RegExp(`.{1,${lineWidth}}`, "g");
        return input.match(regex).join("\n");
    }
}

export default Wrap;
