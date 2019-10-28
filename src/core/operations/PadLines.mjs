/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Pad lines operation
 */
class PadLines extends Operation {

    /**
     * PadLines constructor
     */
    constructor() {
        super();

        this.name = "Pad lines";
        this.module = "Default";
        this.description = "Add the specified number of the specified character to the beginning or end of each line";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Position",
                "type": "option",
                "value": ["Start", "End"]
            },
            {
                "name": "Length",
                "type": "number",
                "value": 5
            },
            {
                "name": "Character",
                "type": "binaryShortString",
                "value": " "
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [position, len, chr] = args,
            lines = input.split("\n");
        let output = "",
            i = 0;

        if (position === "Start") {
            for (i = 0; i < lines.length; i++) {
                output += lines[i].padStart(lines[i].length+len, chr) + "\n";
            }
        } else if (position === "End") {
            for (i = 0; i < lines.length; i++) {
                output += lines[i].padEnd(lines[i].length+len, chr) + "\n";
            }
        }

        return output.slice(0, output.length-1);
    }

}

export default PadLines;
