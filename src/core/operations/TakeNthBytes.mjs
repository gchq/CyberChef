/**
 * @author Oshawk [oshawk@protonmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Take nth bytes operation
 */
class TakeNthBytes extends Operation {

    /**
     * TakeNthBytes constructor
     */
    constructor() {
        super();

        this.name = "Take nth bytes";
        this.module = "Default";
        this.description = "Takes every nth byte starting with a given byte.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Take every",
                type: "number",
                value: 4
            },
            {
                name: "Starting at",
                type: "number",
                value: 0
            },
            {
                name: "Apply to each line",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const n = args[0];
        const start = args[1];
        const eachLine = args[2];

        if (parseInt(n, 10) !== n || n <= 0) {
            throw new OperationError("'Take every' must be a positive integer.");
        }
        if (parseInt(start, 10) !== start || start < 0) {
            throw new OperationError("'Starting at' must be a positive or zero integer.");
        }

        let offset = 0;
        const output = [];
        for (let i = 0; i < input.length; i++) {
            if (eachLine && input[i] === 0x0a) {
                output.push(0x0a);
                offset = i + 1;
            } else if (i - offset >= start && (i - (start + offset)) % n === 0) {
                output.push(input[i]);
            }
        }

        return output;
    }

}

export default TakeNthBytes;
