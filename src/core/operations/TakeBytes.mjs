/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Take bytes operation
 */
class TakeBytes extends Operation {

    /**
     * TakeBytes constructor
     */
    constructor() {
        super();

        this.name = "Take bytes";
        this.module = "Default";
        this.description = "Takes a slice of the specified number of bytes from the data.";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                "name": "Start",
                "type": "number",
                "value": 0
            },
            {
                "name": "Length",
                "type": "number",
                "value": 5
            },
            {
                "name": "Apply to each line",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     *
     * @throws {OperationError} if invalid value
     */
    run(input, args) {
        const start = args[0],
            length = args[1],
            applyToEachLine = args[2];

        if (start < 0 || length < 0)
            throw new OperationError("Error: Invalid value");

        if (!applyToEachLine)
            return input.slice(start, start+length);

        // Split input into lines
        const data = new Uint8Array(input);
        const lines = [];
        let line = [],
            i;

        for (i = 0; i < data.length; i++) {
            if (data[i] === 0x0a) {
                lines.push(line);
                line = [];
            } else {
                line.push(data[i]);
            }
        }
        lines.push(line);

        let output = [];
        for (i = 0; i < lines.length; i++) {
            output = output.concat(lines[i].slice(start, start+length));
            output.push(0x0a);
        }
        return new Uint8Array(output.slice(0, output.length-1)).buffer;
    }

}

export default TakeBytes;
