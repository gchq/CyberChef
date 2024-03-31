/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { search } from "../lib/Extract.mjs";

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
        this.module = "Regex";
        this.description = "Extracts potential hashes based on hash character length";
        this.infoURL = "https://en.wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Hash character length",
                type: "number",
                value: 40
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
        const results = [];
        let hashCount = 0;

        const hashLength = args[0];
        const searchAllHashes = args[1];
        const showDisplayTotal = args[2];

        // Convert character length to bit length
        let hashBitLengths = [(hashLength / 2) * 8];

        if (searchAllHashes) hashBitLengths = [4, 8, 16, 32, 64, 128, 160, 192, 224, 256, 320, 384, 512, 1024];

        for (const hashBitLength of hashBitLengths) {
            // Convert bit length to character length
            const hashCharacterLength = (hashBitLength / 8) * 2;

            const regex = new RegExp(`(\\b|^)[a-f0-9]{${hashCharacterLength}}(\\b|$)`, "g");
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
