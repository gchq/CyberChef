/**
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import { SM2 } from "../lib/SM2.mjs";

/**
 * SM2Decrypt operation
 */
class SM2Decrypt extends Operation {

    /**
     * SM2Decrypt constructor
     */
    constructor() {
        super();

        this.name = "SM2 Decrypt";
        this.module = "Crypto";
        this.description = "Decrypts a message utilizing the SM2 standard";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "Private Key",
                type: "string",
                value: "DEADBEEF"
            },
            {
                "name": "Input Format",
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
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [privateKey, inputFormat, curveName] = args;

        var sm2 = new SM2(curveName, inputFormat);
        sm2.setPrivateKey(privateKey);

        
        var result = sm2.decrypt(input);
        return result
    }

}

export default SM2Decrypt;
