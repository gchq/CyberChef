/**
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * Prepend operation.
 */
class Prepend extends Operation {
    /**
     * Prepend constructor.
     */
    constructor() {
        super();

        this.name = "Prepend";
        this.module = "Default";
        this.description = "Add characters to the start of the input string, optionally with respect to a delimeter.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Text",
                "type": "binaryString",
                "value": ""
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
        const [text, delim] = args;

        if (delim === "None") {
            return input + text;
        }

        const output = [],
            delimChar = Utils.charRep(delim),
            subs = input.split(Utils.charRep(delim));

        for (let i = 0; i < subs.length; i++) {
            output.push(text + subs[i]);
        }

        return output.join(delimChar);
    }
}

export default Prepend;
