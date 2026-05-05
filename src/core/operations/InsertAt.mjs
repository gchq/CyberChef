/**
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * Insert At operation.
 */
class InsertAt extends Operation {
    /**
     * InsertAt constructor.
     */
    constructor() {
        super();

        this.name = "Insert At";
        this.module = "Default";
        this.description = "Add characters to input string at a given index, optionally with respect to a delimeter.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Text",
                "type": "binaryString",
                "value": ""
            },
            {
                "name": "Index",
                "type": "number",
                "value": 0,
                "min": 0
            },
            {
                "name": "Delimiter",
                "type": "option",
                "value": ["None", ...DELIM_OPTIONS]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [text, index, delim] = args;

        if (delim === "None") {
            return InsertAt.performInsert(input, text, index);
        }

        const output = [],
            delimChar = Utils.charRep(delim),
            subs = input.split(Utils.charRep(delim));

        for (let i = 0; i < subs.length; i++) {
            output.push(InsertAt.performInsert(subs[i], text, index));
        }

        return output.join(delimChar);
    }

    /**
     * @param {string} input
     * @param {string} text
     * @param {number} index
     * @returns {string}
     */
    static performInsert(input, text, index) {
        if (index >= input.length) {
            return input + text;
        }

        if (index <= 0) {
            return text + input;
        }

        return input.slice(0, index) + text + input.slice(index);
    }
}

export default InsertAt;
