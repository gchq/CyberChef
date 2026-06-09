/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { bytesToHex } from "@noble/hashes/utils.js";
import { cryptNotice } from "../lib/Crypt.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import {
    generateEcKeyPair,
    publicKeyToSpkiPem,
    privateKeyToPkcs8Pem,
} from "../lib/Ecdsa.mjs";

/**
 * Generate ECDSA Key Pair operation
 */
class GenerateECDSAKeyPair extends Operation {

    /**
     * GenerateECDSAKeyPair constructor
     */
    constructor() {
        super();

        this.name = "Generate ECDSA Key Pair";
        this.module = "Ciphers";
        this.description = `Generate an ECDSA key pair with a given Curve.<br><br>${cryptNotice}`;
        this.infoURL = "https://wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Elliptic Curve",
                type: "option",
                value: [
                    "P-256",
                    "P-384",
                    "P-521"
                ]
            },
            {
                name: "Output Format",
                type: "option",
                value: [
                    "PEM",
                    "DER",
                    "JWK"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [curveName, outputFormat] = args;
        const pair = generateEcKeyPair(curveName);

        switch (outputFormat) {
            case "PEM":
                return publicKeyToSpkiPem(pair) + privateKeyToPkcs8Pem(pair);
            case "DER":
                return bytesToHex(pair.d);
            case "JWK": {
                const pubJwk = {
                    kty: "EC",
                    crv: curveName,
                    x: b64url(pair.x),
                    y: b64url(pair.y),
                    "key_ops": ["verify"],
                    kid: "PublicKey",
                };
                const privJwk = {
                    kty: "EC",
                    crv: curveName,
                    x: b64url(pair.x),
                    y: b64url(pair.y),
                    d: b64url(pair.d),
                    "key_ops": ["sign"],
                    kid: "PrivateKey",
                };
                return JSON.stringify({ keys: [privJwk, pubJwk] }, null, 4);
            }
            default:
                throw new Error(`Unsupported output format: ${outputFormat}`);
        }
    }
}

/**
 * Base64url-encode a byte array (no padding, URL-safe alphabet).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function b64url(bytes) {
    return toBase64(bytes, "A-Za-z0-9-_");
}

export default GenerateECDSAKeyPair;
