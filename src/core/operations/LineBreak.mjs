/**
 * @author ThomasNotTom
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";


/**
 * Line Break operation
 */
class LineBreak extends Operation {

    /**
     * LineBreak constructor
     */
    constructor() {
        super();

        this.name = "Line Break";
        this.module = "Default";
        this.description = "Breaks the input text every <code>n</code> characters.";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Line break width",
                "type": "number",
                "value": 16,
                "min": 1
            }, {
                "name": "Remove leading whitespace",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const lines = [];
        const lineWidth = args[0];
        const removeLeading = args[1];
        const msg = Utils.arrayBufferToStr(input, false);
        let i = 0;

        while (i < msg.length) {
            let slice = msg.slice(i, i + lineWidth);
            let leadingWhitespace = 0;

            if (removeLeading) {
                const match = slice.match(/^\s*/);
                leadingWhitespace = match ? match[0].length : 0;
                slice = slice.trimStart();
            }

            slice = msg.slice(i, i + lineWidth + leadingWhitespace);

            if (removeLeading) {
                slice = slice.trimStart();
            }

            i += lineWidth + leadingWhitespace;

            if (slice.length === 0) continue;
            lines.push(slice);
        }

        return lines.join("\n");
    }
}

export default LineBreak;
