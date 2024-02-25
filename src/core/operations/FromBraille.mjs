/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {BRAILLE_LOOKUP} from "../lib/Braille.mjs";

/**
 * From Braille operation
 */
class FromBraille extends Operation {

    /**
     * FromBraille constructor
     */
    constructor() {
        super();

        this.name = "From Braille";
        this.module = "Default";
        this.description = "Converts six-dot braille symbols to text.";
        this.infoURL = "https://wikipedia.org/wiki/Braille";
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
        return input.split("").map(b => {
            const idx = BRAILLE_LOOKUP.dot6.indexOf(b);
            return idx < 0 ? b : BRAILLE_LOOKUP.ascii[idx];
        }).join("");
    }

    /**
     * Highlight From Braille
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
     * Highlight From Braille in reverse
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

export default FromBraille;
