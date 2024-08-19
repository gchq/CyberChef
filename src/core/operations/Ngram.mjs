/**
 * @author benjcal [benj.calderon@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {JOIN_DELIM_OPTIONS} from "../lib/Delim.mjs";

/**
 * ngram operation
 */
class Ngram extends Operation {

    /**
     * Ngram constructor
     */
    constructor() {
        super();

        this.name = "N-gram";
        this.module = "Default";
        this.description = "Extracts n-grams from the input text. N-grams are contiguous sequences of n characters from a given text sample.";
        this.infoURL = "https://wikipedia.org/wiki/N-gram";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "N-gram size",
                type: "number",
                value: 3
            },
            {
                "name": "Join delimiter",
                "type": "editableOptionShort",
                "value": JOIN_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const nGramSize = args[0],
            joinDelim = args[1];

        const ngrams = [];
        for (let i = 0; i <= input.length - nGramSize; i++) {
            ngrams.push(input.slice(i, i + nGramSize));
        }

        return ngrams.join(joinDelim);
    }

}

export default Ngram;
