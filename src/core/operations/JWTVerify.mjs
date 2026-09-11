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
        const hmacAlgorithms = algorithms.filter(a => a.startsWith("HS"));
        const asymmetricAlgorithms = algorithms.filter(a => !a.startsWith("HS"));

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

        // Leading/trailing whitespace around a pasted PEM block is trimmed before
        // classification so it isn't mistaken for a raw HMAC secret (see below).
        const trimmedKey = key.trim();

        let secret, allowedAlgorithms;
        try {
            if (trimmedKey.startsWith("-----BEGIN PUBLIC KEY-----")) {
                secret = await importSPKI(trimmedKey, header.alg);
                allowedAlgorithms = asymmetricAlgorithms;
            } else if (trimmedKey.startsWith("-----BEGIN RSA PUBLIC KEY-----")) {
                secret = await importSPKI(pkcs1ToSpki(trimmedKey), header.alg);
                allowedAlgorithms = asymmetricAlgorithms;
            } else if (trimmedKey.startsWith("-----BEGIN CERTIFICATE-----")) {
                secret = await importX509(trimmedKey, header.alg);
                allowedAlgorithms = asymmetricAlgorithms;
            } else {
                secret = new TextEncoder().encode(key);
                allowedAlgorithms = hmacAlgorithms;
            }
        } catch (err) {
            throw new OperationError(`Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded public key for RSA and ECDSA.

${err}`);
        }

        // Constrain verification to the algorithm family matching the key that was
        // actually detected, so a public key/certificate can never be misused as an
        // HMAC secret (or vice versa) - this is the classic JWT "algorithm confusion"
        // attack, where a token forged with alg "HS256" is signed using bytes that
        // are public knowledge (e.g. a PEM public key) as the HMAC secret.
        if (!allowedAlgorithms.includes(header.alg)) {
            throw new OperationError(`The token's algorithm "${header.alg}" is not permitted for the provided key. Public keys/certificates only support ${asymmetricAlgorithms.join(", ")}; secrets only support ${hmacAlgorithms.join(", ")}.`);
        }

        try {
            const { payload } = await jwtVerify(input, secret, { algorithms: allowedAlgorithms });
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
