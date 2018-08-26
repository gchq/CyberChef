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
                type: "shortString",
                value: "secret_cat"
            },
            {
                name: "Signing Algorithm",
                type: "populateOption",
                value: [
                    {
                        name: "HS256",
                        value: "HS256"
                    },
                    {
                        name: "HS384",
                        value: "HS384",
                    },
                    {
                        name: "HS512",
                        value: "HS512",
                    },
                    {
                        name: "RS256",
                        value: "RS256",
                    },
                    {
                        name: "RS384",
                        value: "RS384",
                    },
                    {
                        name: "RS512",
                        value: "RS512",
                    },
                    {
                        name: "ES256",
                        value: "ES256",
                    },
                    {
                        name: "ES384",
                        value: "ES384",
                    },
                    {
                        name: "ES512",
                        value: "ES512",
                    },
                    {
                        name: "None",
                        value: "none",
                    },
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
