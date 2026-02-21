/**
 * @author sw5678
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {LETTER_DELIM_OPTIONS} from "../lib/Delim.mjs";
import {caseInsensitiveSort} from "../lib/Sort.mjs";


/**
 * Word Count operation
 */
class WordCount extends Operation {

    /**
     * Word Count constructor
     */
    constructor() {
        super();

        this.name = "Word Count";
        this.module = "Default";
        this.description = "Provides a count of each word in a given text";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: LETTER_DELIM_OPTIONS
            },
            {
                "name": "Include Total",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Order",
                "type": "option",
                "value": ["Alphabetical", "Count"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        const delimiter = Utils.charRep(args[0]);

        // Lower case and split
        const inputArray = input.replace(/(?:\r\n|\r|\n)/g, delimiter).toLowerCase().split(delimiter);

        // Count up the words
        const counter = {};
        let total = 0;
        for (let j = 0; j < inputArray.length; j++) {

            // Trim whitespace and replace punctuation
            const word = inputArray[j].replace(/[!"#$%&()*+,-./:;<=>?@[\\\]^_`{}~£|]/g, "").trim();

            // If empty string or ', then skip
            if (word === "" || /[']+/.test(word)) {
                continue;
            } else if (word in counter) {
                counter[word]++;
                total++;
            } else {
                counter[word] = 1;
                total++;
            }
        }

        // Sort results
        let order;
        if (args[2] === "Alphabetical") {
            // Sort alphabetically
            order = Object.keys(counter).sort(caseInsensitiveSort);
        } else if (args[2] === "Count") {
            // Sort by count
            // Create the array of key-value pairs
            order = Object.keys(counter).map((key) => {
                return [key, counter[key]];
            });
            // Sort the array based on the second element (i.e. the value)
            order.sort((first, second) => {
                return second[1] - first[1];
            });
            // Obtain the list of keys in sorted order of the values.
            order = order.map((e) => {
                return e[0];
            });
        }

        // Process output to string
        let output = "WORD,COUNT\n";
        output = output + order.map(entry => `${entry},${counter[entry]}`).join("\n");

        // Add total counter at the bottom
        if (args[1]) {
            output = output + "\nTOTAL," + total;
        }

        return output;
    }
}

export default WordCount;
