/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import Operation from "../Operation.mjs";
import { jwtVerify, importSPKI, importX509, decodeProtectedHeader } from "jose";
import OperationError from "../errors/OperationError.mjs";
import {JWT_ALGORITHMS} from "../lib/JWT.mjs";
import {pkcs1ToSpki} from "../lib/RSA.mjs";


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
        this.description = "Verifies that a JSON Web Token is valid and has been signed with the provided secret / public key.<br><br>The key should be either the secret for HMAC algorithms or the PEM-encoded public key (or certificate) for RSA and ECDSA.<br><br>Expiry (<code>exp</code>) and not-before (<code>nbf</code>) claims are validated if present. Unsigned tokens (<code>alg: none</code>) are rejected; use 'JWT Decode' to view their payload.";
        this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Public/Secret Key",
                type: "text",
                value: "secret"
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    async run(input, args) {
        const [key] = args;
        const algorithms = JWT_ALGORITHMS.filter(a => a !== "None");

        let header;
        try {
            header = decodeProtectedHeader(input);
        } catch (err) {
            throw new OperationError(`Invalid JWT format.

${err}`);
        }

        if (!header.alg || header.alg === "none") {
            throw new OperationError("This token is unsigned (\"alg\": \"none\") and cannot be verified. Use the 'JWT Decode' operation to view its payload.");
        }

        if (!algorithms.includes(header.alg)) {
            throw new OperationError(`The token's algorithm "${header.alg}" is not supported. Supported algorithms are: ${algorithms.join(", ")}.`);
        }

        let secret;
        try {
            if (key.startsWith("-----BEGIN PUBLIC KEY-----")) {
                secret = await importSPKI(key, header.alg);
            } else if (key.startsWith("-----BEGIN RSA PUBLIC KEY-----")) {
                secret = await importSPKI(pkcs1ToSpki(key), header.alg);
            } else if (key.startsWith("-----BEGIN CERTIFICATE-----")) {
                secret = await importX509(key, header.alg);
            } else {
                secret = new TextEncoder().encode(key);
            }
        } catch (err) {
            throw new OperationError(`Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded public key for RSA and ECDSA.

${err}`);
        }

        try {
            const { payload } = await jwtVerify(input, secret, { algorithms });
            return payload;
        } catch (err) {
            switch (err.code) {
                case "ERR_JWT_EXPIRED":
                    throw new OperationError(`The token has expired.

${err.message}`);
                case "ERR_JWS_SIGNATURE_VERIFICATION_FAILED":
                    throw new OperationError("Invalid signature. Have you entered the correct key?");
                case "ERR_JWT_CLAIM_VALIDATION_FAILED":
                    throw new OperationError(`Token claim validation failed.

${err.message}`);
                default:
                    throw new OperationError(err.toString());
            }
        }
    }

}

export default JWTVerify;
