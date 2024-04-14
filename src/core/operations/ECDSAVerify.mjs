/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import r from "jsrsasign";

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
                    "JSON"
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
        const [, mdAlgo, keyPem, msg] = args;

        if (keyPem.replace("-----BEGIN PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("Please enter a public key.");
        }

        // detect input format
        if (inputFormat === "Auto") {
            if (input.substr(0, 2) === "30" && r.ASN1HEX.isASN1HEX(input)) {
                inputFormat = "ASN.1 HEX";
            } else if (input.indexOf("{") !== -1) {
                inputFormat = "JSON";
            } else {
                inputFormat = "P1363 HEX";
            }
        }

        // convert to ASN.1 signature
        let signatureASN1Hex;
        switch (inputFormat) {
            case "ASN.1 HEX":
                signatureASN1Hex = input;
                break;
            case "P1363 HEX":
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(input);
                break;
            case "JSON": {
                const inputJson = JSON.parse(input);
                signatureASN1Hex = r.KJUR.crypto.ECDSA.hexRSSigToASN1Sig(inputJson.r, inputJson.s);
                break;
            }
        }

        // verify signature
        const internalAlgorithmName = mdAlgo.replace("-", "") + "withECDSA";
        const sig = new r.KJUR.crypto.Signature({ alg: internalAlgorithmName });
        const key = r.KEYUTIL.getKey(keyPem);
        if (key.type !== "EC") {
            throw new OperationError("Provided key is not an EC key.");
        }
        if (!key.isPublic) {
            throw new OperationError("Provided key is not a public key.");
        }
        sig.init(key);
        sig.updateString(msg);
        const result = sig.verify(signatureASN1Hex);
        return result ? "Verified OK" : "Verification Failure";
    }
}

export default ECDSAVerify;
