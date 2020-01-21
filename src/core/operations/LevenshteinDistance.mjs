/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import levenshteinDistance from "../lib/Levenshtein.mjs";
import OperationError from "../errors/OperationError.mjs";


/**
 * Levenshtein Distance operation
 */
class LevenshteinDistance extends Operation {

    /**
     * LevenshteinDistance constructor
     */
    constructor() {
        super();

        this.name = "Levenshtein Distance";
        this.module = "Utils";
        this.description = "Computes the distance between two strings. For example 'the' and 'thy' have a distance of one since it takes one character substitution to transform one to the other. The two strings should be separated by a double newline.";
        this.infoURL = "https://wikipedia.org/wiki/Levenshtein_distance";
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
        const index = input.indexOf("\n\n");
        if (index === -1)
            throw new OperationError("Error: double newline not present.");
        return "Levenshtein Distance: " + levenshteinDistance(input.slice(0, index), input.slice(index+2)).toString(10);
    }

}

export default LevenshteinDistance;
