/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { keyFromJwk, keyInfoToPem } from "../lib/KeyConvert.mjs";

/**
 * JWK to PEM operation
 */
class JWKToPem extends Operation {

    /**
     * JWKToPem constructor
     */
    constructor() {
        super();

        this.name = "JWK to PEM";
        this.module = "PublicKey";
        this.description = "Converts Keys in JSON Web Key format to PEM format (PKCS#8).";
        this.infoURL = "https://datatracker.ietf.org/doc/html/rfc7517";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                "pattern": "\"kty\":\\s*\"(EC|RSA)\"",
                "flags": "gm",
                "args": []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const inputJson = JSON.parse(input);

        let keys = [];
        if (Array.isArray(inputJson)) {
            keys = inputJson;
        } else if (Array.isArray(inputJson.keys)) {
            keys = inputJson.keys;
        } else if (typeof inputJson === "object" && inputJson !== null) {
            keys.push(inputJson);
        } else {
            throw new OperationError("Input is not a JSON Web Key");
        }

        let output = "";
        for (const jwk of keys) {
            if (!jwk || typeof jwk.kty !== "string") {
                throw new OperationError("Invalid JWK format");
            }
            if (jwk.kty !== "RSA" && jwk.kty !== "EC") {
                throw new OperationError(`Unsupported JWK key type '${jwk.kty}'`);
            }
            output += keyInfoToPem(keyFromJwk(jwk));
        }
        return output;
    }
}

export default JWKToPem;
