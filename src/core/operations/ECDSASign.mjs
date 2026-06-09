/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromHex } from "../lib/Hex.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import {
    loadEcKey,
    digestBytes,
    signEcdsa,
    strToBytesLatin1,
    asn1SigToConcatHex,
    parseAsn1SigToHexRS,
} from "../lib/Ecdsa.mjs";

/**
 * ECDSA Sign operation
 */
class ECDSASign extends Operation {

    /**
     * ECDSASign constructor
     */
    constructor() {
        super();

        this.name = "ECDSA Sign";
        this.module = "Ciphers";
        this.description = "Sign a plaintext message with a PEM encoded EC key.";
        this.infoURL = "https://wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "ECDSA Private Key (PEM)",
                type: "text",
                value: "-----BEGIN EC PRIVATE KEY-----"
            },
            {
                name: "Message Digest Algorithm",
                type: "option",
                value: [
                    "SHA-256",
                    "SHA-384",
                    "SHA-512",
                    "SHA-1",
                    "MD5"
                ]
            },
            {
                name: "Output Format",
                type: "option",
                value: [
                    "ASN.1 HEX",
                    "P1363 HEX",
                    "JSON Web Signature",
                    "Raw JSON"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [keyPem, mdAlgo, outputFormat] = args;

        if (keyPem.replace("-----BEGIN EC PRIVATE KEY-----", "").length === 0) {
            throw new OperationError("Please enter a private key.");
        }

        const key = loadEcKey(keyPem);
        if (!key.isPrivate) {
            throw new OperationError("Provided key is not a private key.");
        }

        const digest = digestBytes(mdAlgo, strToBytesLatin1(input));
        const signatureASN1Hex = signEcdsa(key, digest);

        switch (outputFormat) {
            case "ASN.1 HEX":
                return signatureASN1Hex;
            case "P1363 HEX":
                return asn1SigToConcatHex(signatureASN1Hex);
            case "JSON Web Signature": {
                const concat = asn1SigToConcatHex(signatureASN1Hex);
                return toBase64(fromHex(concat), "A-Za-z0-9-_");  // base64url
            }
            case "Raw JSON":
                return JSON.stringify(parseAsn1SigToHexRS(signatureASN1Hex));
            default:
                throw new OperationError(`Unsupported output format: ${outputFormat}`);
        }
    }
}

export default ECDSASign;
