/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
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
                    "Concat HEX",
                    "JSON"
                ]
            },
            {
                name: "Output Format",
                type: "option",
                value: [
                    "ASN.1 HEX",
                    "Concat HEX",
                    "JSON"
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
        if (inputFormat === "Auto") {
            if (input.substr(0, 2) === "30" && r.ASN1HEX.isASN1HEX(input)) {
                inputFormat = "ASN.1 HEX";
            } else if (input.indexOf("{") !== -1) {
                inputFormat = "JSON";
            } else {
                inputFormat = "Concat HEX";
            }
        }

        // convert input to ASN.1 hex
        let signatureASN1Hex;
        switch (inputFormat) {
            case "ASN.1 HEX":
                signatureASN1Hex = input;
                break;
            case "Concat HEX":
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(input);
                break;
            case "JSON": {
                const inputJson = JSON.parse(input);
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
            case "Concat HEX":
                result = r.KJUR.crypto.ECDSA.asn1SigToConcatSig(signatureASN1Hex);
                break;
            case "JSON": {
                const signatureRS = r.KJUR.crypto.ECDSA.parseSigHexInHexRS(signatureASN1Hex);
                result = JSON.stringify(signatureRS);
                break;
            }
        }

        return result;
    }
}

export default ECDSASignatureConversion;
