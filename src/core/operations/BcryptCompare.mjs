/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import bcrypt from "bcryptjs";

/**
 * Bcrypt compare operation
 */
class BcryptCompare extends Operation {

    /**
     * BcryptCompare constructor
     */
    constructor() {
        super();

        this.name = "Bcrypt compare";
        this.module = "Hashing";
        this.description = "Tests whether the input matches the given bcrypt hash. To test multiple possible passwords, use the 'Fork' operation.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Hash",
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
        const hash = args[0];

        const match = await bcrypt.compare(input, hash, null, p => {
            // Progress callback
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage(`Progress: ${(p * 100).toFixed(0)}%`);
        });

        return match ? "Match: " + input : "No match";

    }

}

export default BcryptCompare;
