/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { cryptNotice } from "../lib/Crypt.mjs";
import r from "jsrsasign";

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

        return new Promise((resolve, reject) => {
            let internalCurveName;
            switch (curveName) {
                case "P-256":
                    internalCurveName = "secp256r1";
                    break;
                case "P-384":
                    internalCurveName = "secp384r1";
                    break;
                case "P-521":
                    internalCurveName = "secp521r1";
                    break;
            }
            const keyPair = r.KEYUTIL.generateKeypair("EC", internalCurveName);

            let pubKey;
            let privKey;
            let result;
            switch (outputFormat) {
                case "PEM":
                    pubKey = r.KEYUTIL.getPEM(keyPair.pubKeyObj).replace(/\r/g, "");
                    privKey = r.KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS8PRV").replace(/\r/g, "");
                    result = pubKey + "\n" + privKey;
                    break;
                case "DER":
                    result = keyPair.prvKeyObj.prvKeyHex;
                    break;
                case "JWK":
                    pubKey = r.KEYUTIL.getJWKFromKey(keyPair.pubKeyObj);
                    pubKey.key_ops = ["verify"]; // eslint-disable-line camelcase
                    pubKey.kid = "PublicKey";
                    privKey = r.KEYUTIL.getJWKFromKey(keyPair.prvKeyObj);
                    privKey.key_ops = ["sign"]; // eslint-disable-line camelcase
                    privKey.kid = "PrivateKey";
                    result = JSON.stringify({keys: [privKey, pubKey]}, null, 4);
                    break;
            }

            resolve(result);
        });
    }

}

export default GenerateECDSAKeyPair;
