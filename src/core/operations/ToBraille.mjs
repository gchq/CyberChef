/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { BRAILLE_LOOKUP } from "../lib/Braille.mjs";

/**
 * To Braille operation
 */
class ToBraille extends Operation {
    /**
     * ToBraille constructor
     */
    constructor() {
        super();

        this.name = "To Braille";
        this.module = "Default";
        this.description = "Converts text to six-dot braille symbols.";
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
        return input
            .split("")
            .map((c) => {
                const idx = BRAILLE_LOOKUP.ascii.indexOf(c.toUpperCase());
                return idx < 0 ? c : BRAILLE_LOOKUP.dot6[idx];
            })
            .join("");
    }

    /**
     * Highlight To Braille
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
     * Highlight To Braille in reverse
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

export default ToBraille;
