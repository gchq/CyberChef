/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromBase64 } from "../lib/Base64.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";
import {
    loadEcKey,
    digestBytes,
    verifyEcdsa,
    strToBytesLatin1,
    concatHexToAsn1Sig,
    hexRSToAsn1Sig,
    isAsn1Hex,
} from "../lib/Ecdsa.mjs";

/**
 * ECDSA Verify operation
 */
class ECDSAVerify extends Operation {

    /**
     * ECDSAVerify constructor
     */
    constructor() {
        super();

        this.name = "ECDSA Verify";
        this.module = "Ciphers";
        this.description = "Verify a message against a signature and a public PEM encoded EC key.";
        this.infoURL = "https://wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input Format",
                type: "option",
                value: [
                    "Auto",
                    "ASN.1 HEX",
                    "P1363 HEX",
                    "JSON Web Signature",
                    "Raw JSON"
                ]
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
                name: "ECDSA Public Key (PEM)",
                type: "text",
                value: "-----BEGIN PUBLIC KEY-----"
            },
            {
                name: "Message",
                type: "text",
                value: ""
            },
            {
                name: "Message format",
                type: "option",
                value: ["Raw", "Hex", "Base64"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let inputFormat = args[0];
        const [, mdAlgo, keyPem, msg, msgFormat] = args;

        if (keyPem.replace("-----BEGIN PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("Please enter a public key.");
        }

        // detect input format
        let inputJson;
        if (inputFormat === "Auto") {
            try {
                inputJson = JSON.parse(input);
                if (typeof(inputJson) === "object") {
                    inputFormat = "Raw JSON";
                }
            } catch {}
        }

        if (inputFormat === "Auto") {
            const hexRegex = /^[a-f\d]{2,}$/gi;
            if (hexRegex.test(input)) {
                if (input.substring(0, 2) === "30" && isAsn1Hex(input)) {
                    inputFormat = "ASN.1 HEX";
                } else {
                    inputFormat = "P1363 HEX";
                }
            }
        }

        let inputBase64;
        if (inputFormat === "Auto") {
            try {
                inputBase64 = fromBase64(input, "A-Za-z0-9-_", false);
                inputFormat = "JSON Web Signature";
            } catch {}
        }

        // convert to ASN.1 signature
        let signatureASN1Hex;
        switch (inputFormat) {
            case "Auto":
                throw new OperationError("Signature format could not be detected");
            case "ASN.1 HEX":
                signatureASN1Hex = input;
                break;
            case "P1363 HEX":
                signatureASN1Hex = concatHexToAsn1Sig(input);
                break;
            case "JSON Web Signature":
                if (!inputBase64) inputBase64 = fromBase64(input, "A-Za-z0-9-_");
                signatureASN1Hex = concatHexToAsn1Sig(toHexFast(inputBase64));
                break;
            case "Raw JSON": {
                if (!inputJson) inputJson = JSON.parse(input);
                if (!inputJson.r) {
                    throw new OperationError('No "r" value in the signature JSON');
                }
                if (!inputJson.s) {
                    throw new OperationError('No "s" value in the signature JSON');
                }
                signatureASN1Hex = hexRSToAsn1Sig(inputJson.r, inputJson.s);
                break;
            }
        }

        const key = loadEcKey(keyPem);
        if (!key.isPublic) {
            throw new OperationError("Provided key is not a public key.");
        }

        const messageStr = Utils.convertToByteString(msg, msgFormat);
        const digest = digestBytes(mdAlgo, strToBytesLatin1(messageStr));
        const ok = verifyEcdsa(key, digest, signatureASN1Hex);
        return ok ? "Verified OK" : "Verification Failure";
    }
}

export default ECDSAVerify;
