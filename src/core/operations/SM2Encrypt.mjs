/**
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

import { SM2 } from "../lib/SM2.mjs";

import { fromHex } from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";
import Sm3 from "crypto-api/src/hasher/sm3.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import r from "jsrsasign";

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
        this.module = "Ciphers";
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
                "value": ["C1C3C2", "C1C2C3"]
            },
            {
                name: "Curve",
                type: "option",
                "value": ["sm2p256v1"]
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

        var sm2 = new SM2(curveName, outputFormat);
        sm2.setPublicKey(publicKeyX, publicKeyY);

        var result = sm2.encrypt(new Uint8Array(input))
        return result
    }

    /**
     * Highlight SM2 Encrypt
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const [privateKeyX, privateKeyY, outputFormat, curveName] = args;
        var num = pos[0].end - pos[0].start
        var adjust = 128
        if (outputFormat == "C1C3C2") {
            adjust = 192
        }
        pos[0].start = Math.ceil(pos[0].start + adjust);
        pos[0].end = Math.floor(pos[0].end + adjust + num);
        return pos;
    }
}

export default SM2Encrypt;
