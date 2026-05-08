/**
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import Operation from "../Operation.mjs";

import { SM2 } from "../lib/SM2.mjs";

/**
 * SM2 Encrypt operation
 */
class SM2Encrypt extends Operation {

    /**
     * SM2Encrypt constructor
     */
    constructor() {
        super();

        this.name = "SM2 Encrypt";
        this.module = "Crypto";
        this.description = "Encrypts a message utilizing the SM2 standard";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "ArrayBuffer";
        this.outputType = "string";

        this.args = [
            {
                name: "Public Key X",
                type: "string",
                value: "DEADBEEF"
            },
            {
                name: "Public Key Y",
                type: "string",
                value: "DEADBEEF"
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": ["C1C3C2", "C1C2C3"],
                "defaultIndex": 0
            },
            {
                name: "Curve",
                type: "option",
                "value": ["sm2p256v1"],
                "defaultIndex": 0
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [publicKeyX, publicKeyY, outputFormat, curveName] = args;
        this.outputFormat = outputFormat;

        if (publicKeyX.length !== 64 || publicKeyY.length !== 64) {
            throw new OperationError("Invalid Public Key - Ensure each component is 32 bytes in size and in hex");
        }

        const sm2 = new SM2(curveName, outputFormat);
        sm2.setPublicKey(publicKeyX, publicKeyY);

        const result = sm2.encrypt(new Uint8Array(input));
        return result;
    }
}

export default SM2Encrypt;
