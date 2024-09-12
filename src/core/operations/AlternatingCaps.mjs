/**
 * @author sw5678
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Alternating caps operation
 */
class AlternatingCaps extends Operation {

    /**
     * AlternatingCaps constructor
     */
    constructor() {
        super();

        this.name = "Alternating Caps";
        this.module = "Default";
        this.description = "Alternating caps, also known as studly caps, sticky caps, or spongecase is a form of text notation in which the capitalization of letters varies by some pattern, or arbitrarily. An example of this would be spelling 'alternative caps' as 'aLtErNaTiNg CaPs'.";
        this.infoURL = "https://en.wikipedia.org/wiki/Alternating_caps";
        this.inputType = "string";
        this.outputType = "string";
        this.args= [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let output = "";
        for (let i = 0; i < input.length; i++) {
            if (i % 2 === 0) {
                output += input[i].toLowerCase();
            } else {
                output += input[i].toUpperCase();
            }
        }
        return output;
    }
}

export default AlternatingCaps;
