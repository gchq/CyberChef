/**
 * @author n1474335
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import bcrypt from "bcrypt";
import { isWorkerEnvironment } from "../Utils.mjs";

/**
 * Bcrypt operation
 */
class Bcrypt extends Operation {

    /**
     * Bcrypt constructor
     */
    constructor() {
        super();

        this.name = "Bcrypt";
        this.module = "Crypto";
        this.description = "bcrypt is a password hashing function designed by Niels Provos and David Mazi\xe8res, based on the Blowfish cipher, and presented at USENIX in 1999. Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count (rounds) can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power.<br><br>Enter the password in the input to generate its hash.";
        this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Rounds",
                "type": "number",
                "value": 10
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Promise<string>}
     */
    async run(input, args) {
        const rounds = args[0];
        const salt = await bcrypt.genSalt(rounds);

        // The progress callback is not supported in the bcrypt library directly.
        // Removed the progress callback from bcrypt.hash as it is not supported.
        const hash = await bcrypt.hash(input, salt);

        // Optionally, you can manually send a status message once hashing is complete.
        if (isWorkerEnvironment()) {
            self.sendStatusMessage(`Hashing complete.`);
        }

        return hash;
    }
}

export default Bcrypt;
