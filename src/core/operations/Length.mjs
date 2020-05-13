/**
 * @author David Byrne [davidribyrne@users.noreply.github.com]
 * @copyright David Byrne 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

const BYTES = "Bytes";
const CHARS = "Characters";
const UTF = "UTF-16 units";

/**
 * Length operation
 */
class Length extends Operation {


    /**
     * Length constructor
     */
    constructor() {
        super();

        this.name = "Length";
        this.module = "Default";
        this.description = "Returns the input length.<br/><br/>" +
                "<b>Bytes</b> - Number of bytes (Unicode characters may have up to 4 bytes)<br/>" +
                "<b>Characters</b> - Number of Unicode characters<br/>" +
                "<b>UTF-16 units</b> - See information URL for details ";
        this.infoURL = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [
            {
                name: "Units",
                type: "option",
                value: [BYTES, CHARS, UTF]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        switch (args[0]) {
            case BYTES:
                return new Blob([input]).size;
            case CHARS:
                return Array.from(input).length;
            case UTF:
                return input.length;
        }
    }

}

export default Length;
