/**
 * @author Tan Zhen Yong [tzy@beyondthesprawl.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import argon2 from "argon2-browser";

/**
 * Argon2 compare operation
 */
class Argon2Compare extends Operation {
    /**
     * Argon2Compare constructor
     */
    constructor() {
        super();

        this.name = "Argon2 compare";
        this.module = "Crypto";
        this.description
            = "Tests whether the input matches the given Argon2 hash. To test multiple possible passwords, use the 'Fork' operation.";
        this.infoURL = "https://wikipedia.org/wiki/Argon2";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encoded hash",
                "type": "string",
                "value": ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const encoded = args[0];

        try {
            await argon2.verify({
                pass: input,
                encoded
            });

            return `Match: ${input}`;
        } catch (err) {
            return "No match";
        }
    }
}

export default Argon2Compare;
