/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import jwt from "jsonwebtoken";

/**
 * JWT Sign operation
 */
class JWTSign extends Operation {

    /**
     * JWTSign constructor
     */
    constructor() {
        super();

        this.name = "JWT Sign";
        this.module = "Crypto";
        this.description = "Signs a JSON object as a JSON Web Token using a provided secret / private key.";
        this.infoURL = "https://jwt.io/";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Private / Secret Key",
                type: "text",
                value: "secret_cat"
            },
            {
                name: "Signing Algorithm",
                type: "option",
                value: [
                    "HS256",
                    "HS384",
                    "HS512",
                    "RS256",
                    "RS384",
                    "RS512",
                    "ES256",
                    "ES384",
                    "ES512",
                    "None"
                ]
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [key, algorithm] = args;
        return jwt.sign(input, key, { algorithm: algorithm === "None" ? "none" : algorithm });
    }

}

export default JWTSign;
