/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * Count occurrences operation
 */
class CountOccurrences extends Operation {
    /**
     * CountOccurrences constructor
     */
    constructor() {
        super();

        this.name = "Count occurrences";
        this.module = "Default";
        this.description =
            "Counts the number of times the provided string occurs in the input.";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [
            {
                name: "Search string",
                type: "toggleString",
                value: "",
                toggleValues: [
                    "Regex",
                    "Extended (\\n, \\t, \\x...)",
                    "Simple string",
                ],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        let search = args[0].string;
        const type = args[0].option;

        if (type === "Regex" && search) {
            try {
                const regex = new RegExp(search, "gi"),
                    matches = input.match(regex);
                return matches.length;
            } catch (err) {
                return 0;
            }
        } else if (search) {
            if (type.indexOf("Extended") === 0) {
                search = Utils.parseEscapedChars(search);
            }
            return input.count(search);
        } else {
            return 0;
        }
    }
}

export default CountOccurrences;
