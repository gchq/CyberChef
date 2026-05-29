/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import { SignJWT, importPKCS8 } from "jose";
import { createPrivateKey } from "crypto";
import OperationError from "../errors/OperationError.mjs";
import {JWT_ALGORITHMS} from "../lib/JWT.mjs";


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
        this.description = "Signs a JSON object as a JSON Web Token using a provided secret / private key.<br><br>The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.";
        this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Private/Secret Key",
                type: "text",
                value: "secret"
            },
            {
                name: "Signing algorithm",
                type: "option",
                value: JWT_ALGORITHMS
            },
            {
                name: "Header",
                type: "text",
                value: "{}"
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [key, algorithm, header] = args;

        let secret;
        try {
            if (key.startsWith("-----BEGIN RSA PRIVATE KEY-----")) {
                secret = await createPrivateKey(key);
            } else if (key.startsWith("-----BEGIN PRIVATE KEY-----")) {
                secret = await importPKCS8(key, algorithm);
            } else {
                secret = new TextEncoder().encode(key);
            }
        } catch (err) {
            throw new OperationError(`Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.

${err}`);
        }

        const fullHeader = { alg: algorithm, typ: "JWT" };
        try {
            if (header !== "{}") {
                Object.assign(fullHeader, JSON.parse(header));
            }
        } catch (err) {
            throw new OperationError(`Header must be a valid (or empty) json object.

${err}`);
        }

        try {
            const token = await new SignJWT(input)
                .setProtectedHeader(fullHeader)
                .sign(secret);

            return token;
        } catch (err) {
            throw new OperationError(`Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.

${err}`);
        }
    };
}

export default JWTSign;
