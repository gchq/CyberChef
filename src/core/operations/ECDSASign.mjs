/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import r from "jsrsasign";

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

        const internalAlgorithmName = mdAlgo.replace("-", "") + "withECDSA";
        const sig = new r.KJUR.crypto.Signature({ alg: internalAlgorithmName });
        const key = r.KEYUTIL.getKey(keyPem);
        if (key.type !== "EC") {
            throw new OperationError("Provided key is not an EC key.");
        }
        if (!key.isPrivate) {
            throw new OperationError("Provided key is not a private key.");
        }
        sig.init(key);
        const signatureASN1Hex = sig.signString(input);

        let result;
        switch (outputFormat) {
            case "ASN.1 HEX":
                result = signatureASN1Hex;
                break;
            case "P1363 HEX":
                result = r.KJUR.crypto.ECDSA.asn1SigToConcatSig(signatureASN1Hex);
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

export default ECDSASign;
