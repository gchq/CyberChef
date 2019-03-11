/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract Hash Values operation
 */
class ExtractHashes extends Operation {

    /**
     * ExtractHashValues constructor
     */
    constructor() {
        super();

        this.name = "Extract Hashes";
        this.module = "Default";
        this.description = "Extracts hash values based on hash byte length";
        this.infoURL = "https://en.wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Hash length",
                type: "number",
                value: 32
            },
            {
                name: "All hashes",
                type: "boolean",
                value: false
            },
            {
                name: "Display Total",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let results = [];
        let hashCount = 0;

        const hashLength = args[0];
        const searchAllHashes = args[1];
        const showDisplayTotal = args[2];

        let hashLengths = [hashLength];
        if (searchAllHashes) hashLengths = [4, 8, 16, 32, 64, 128, 160, 192, 224, 256, 320, 384, 512, 1024];

        for (let hashLength of hashLengths) {
            const regex = new RegExp(`(\\b|^)[a-f0-9]{${hashLength}}(\\b|$)`, "g");
            const searchResults = search(input, regex, null, false);

            hashCount += searchResults.split("\n").length - 1;
            results.push(searchResults);
        }

        let output = "";
        if (showDisplayTotal) {
            output = `Total Results: ${hashCount}\n\n`;
        }

        output = output + results.join("");
        return output;
    }

}

export default ExtractHashes;
