/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromBase64, toBase64 } from "../lib/Base64.mjs";
import { fromHex, toHexFast } from "../lib/Hex.mjs";
import r from "jsrsasign";

/**
 * ECDSA Sign operation
 */
class ECDSASignatureConversion extends Operation {

    /**
     * ECDSASignatureConversion constructor
     */
    constructor() {
        super();

        this.name = "ECDSA Signature Conversion";
        this.module = "Ciphers";
        this.description = "Convert an ECDSA signature between hex, asn1 and json.";
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
        let inputFormat = args[0];
        const outputFormat = args[1];

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
                if (input.substring(0, 2) === "30" && r.ASN1HEX.isASN1HEX(input)) {
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

        // convert input to ASN.1 hex
        let signatureASN1Hex;
        switch (inputFormat) {
            case "Auto":
                throw new OperationError("Signature format could not be detected");
            case "ASN.1 HEX":
                signatureASN1Hex = input;
                break;
            case "P1363 HEX":
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(input);
                break;
            case "JSON Web Signature":
                if (!inputBase64) inputBase64 = fromBase64(input, "A-Za-z0-9-_");
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(toHexFast(inputBase64));
                break;
            case "Raw JSON": {
                if (!inputJson) inputJson = JSON.parse(input);
                if (!inputJson.r) {
                    throw new OperationError('No "r" value in the signature JSON');
                }
                if (!inputJson.s) {
                    throw new OperationError('No "s" value in the signature JSON');
                }
                signatureASN1Hex = r.KJUR.crypto.ECDSA.hexRSSigToASN1Sig(inputJson.r, inputJson.s);
                break;
            }
        }

        // convert ASN.1 hex to output format
        let result;
        switch (outputFormat) {
            case "ASN.1 HEX":
                result = signatureASN1Hex;
                break;
            case "P1363 HEX":
                result = r.KJUR.crypto.ECDSA.asn1SigToConcatSig(signatureASN1Hex);
                break;
            case "JSON Web Signature":
                result = r.KJUR.crypto.ECDSA.asn1SigToConcatSig(signatureASN1Hex);
                result = toBase64(fromHex(result), "A-Za-z0-9-_");  // base64url
                break;
            case "Raw JSON": {
                const signatureRS = r.KJUR.crypto.ECDSA.parseSigHexInHexRS(signatureASN1Hex);
                result = JSON.stringify(signatureRS);
                break;
            }
        }

        return result;
    }
}

export default ECDSASignatureConversion;
