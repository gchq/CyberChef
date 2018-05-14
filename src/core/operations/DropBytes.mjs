/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Drop bytes operation
 */
class DropBytes extends Operation {

    /**
     * DropBytes constructor
     */
    constructor() {
        super();

        this.name = "Drop bytes";
        this.module = "Default";
        this.description = "Cuts a slice of the specified number of bytes out of the data.";
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
     */
    run(input, args) {
        const start = args[0],
            length = args[1],
            applyToEachLine = args[2];

        if (start < 0 || length < 0)
            throw "Error: Invalid value";

        if (!applyToEachLine) {
            const left = input.slice(0, start),
                right = input.slice(start + length, input.byteLength);
            const result = new Uint8Array(left.byteLength + right.byteLength);
            result.set(new Uint8Array(left), 0);
            result.set(new Uint8Array(right), left.byteLength);
            return result.buffer;
        }

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
            output = output.concat(lines[i].slice(0, start).concat(lines[i].slice(start+length, lines[i].length)));
            output.push(0x0a);
        }
        return new Uint8Array(output.slice(0, output.length-1)).buffer;
    }

}

export default DropBytes;
