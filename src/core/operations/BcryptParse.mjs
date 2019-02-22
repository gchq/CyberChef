/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import bcrypt from "bcryptjs";

/**
 * Bcrypt parse operation
 */
class BcryptParse extends Operation {

    /**
     * BcryptParse constructor
     */
    constructor() {
        super();

        this.name = "Bcrypt parse";
        this.module = "Crypto";
        this.description = "Parses a bcrypt hash to determine the number of rounds used, the salt, and the password hash.";
        this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        try {
            return `Rounds: ${bcrypt.getRounds(input)}
Salt: ${bcrypt.getSalt(input)}
Password hash: ${input.split(bcrypt.getSalt(input))[1]}
Full hash: ${input}`;
        } catch (err) {
            throw new OperationError("Error: " + err.toString());
        }
    }

}

export default BcryptParse;
