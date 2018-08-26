/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import jwt from "jsonwebtoken";

/**
 * JWT Decode operation
 */
class JWTDecode extends Operation {

    /**
     * JWTDecode constructor
     */
    constructor() {
        super();

        this.name = "JWT Decode";
        this.module = "Crypto";
        this.description = "Decodes a JSON Web Token without checking whether the provided secret / private key is valid.";
        this.infoURL = "https://jwt.io";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        try {
            return jwt.decode(input);
        } catch (err) {
            return err;
        }
    }

}

export default JWTDecode;
