/**
 * @author mikecat
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Swap case operation
 */
class SwapCase extends Operation {

    /**
     * SwapCase constructor
     */
    constructor() {
        super();

        this.name = "Swap case";
        this.module = "Default";
        this.description = "Converts uppercase letters to lowercase ones, and lowercase ones to uppercase ones.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let result = "";
        for (let i = 0; i < input.length; i++) {
            const c = input.charAt(i);
            const upper = c.toUpperCase();
            if (c === upper) {
                result += c.toLowerCase();
            } else {
                result += upper;
            }
        }
        return result;
    }

    /**
     * Highlight Swap case
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Swap case in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

export default SwapCase;
