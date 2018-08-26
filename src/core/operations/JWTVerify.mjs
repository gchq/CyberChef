/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import jwt from "jsonwebtoken";

/**
 * JWT Verify operation
 */
class JWTVerify extends Operation {

    /**
     * JWTVerify constructor
     */
    constructor() {
        super();

        this.name = "JWT Verify";
        this.module = "Crypto";
        this.description = "Verifies that a JSON Web Token is valid and has been signed with the provided secret / private key.";
        this.infoURL = "https://jwt.io/";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Private / Secret Key",
                type: "shortString",
                value: "secret_cat"
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [key] = args;

        try {
            return jwt.verify(input, key);
        } catch (err) {
            return err;
        }
    }

}

export default JWTVerify;
