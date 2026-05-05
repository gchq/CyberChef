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
        this.description = "Add the specified character to the start or end of each line. Padding can use either a fixed character count or a target final line length."
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
            },
            {
                "name": "Mode",
                "type": "option",
                "value": ["Fixed Count", "Target Length"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [position, len, chr, mode] = args,
            lines = input.split("\n");
        let output = "",
            i = 0;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let targetLength = mode == "Fixed Count" ? line.length + len : len;

            if (position === "Start") {
                lines[i] = line.padStart(targetLength, chr);
            } else if (position === "End") {
                lines[i] = line.padEnd(targetLength, chr);
            }
        }

        return lines.join('\n');
    }

}

export default PadLines;
