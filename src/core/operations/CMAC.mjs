/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import { toHexFast } from "../lib/Hex.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * CMAC operation
 */
class CMAC extends Operation {
    /**
     * CMAC constructor
     */
    constructor() {
        super();

        this.name = "CMAC";
        this.module = "Crypto";
        this.description
            = "CMAC is a block-cipher based message authentication code algorithm.<br><br>RFC4493 defines AES-CMAC that uses AES encryption with a 128-bit key.<br>NIST SP 800-38B suggests usages of AES with other key lengths and Triple DES.";
        this.infoURL = "https://wikipedia.org/wiki/CMAC";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Encryption algorithm",
                "type": "option",
                "value": ["AES", "Triple DES"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option);
        const algo = args[1];

        const info = (function () {
            switch (algo) {
                case "AES":
                    if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
                        throw new OperationError(
                            "The key for AES must be either 16, 24, or 32 bytes (currently " + key.length + " bytes)"
                        );
                    }
                    return {
                        "algorithm": "AES-ECB",
                        "key": key,
                        "blockSize": 16,
                        "Rb": new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x87])
                    };
                case "Triple DES":
                    if (key.length !== 16 && key.length !== 24) {
                        throw new OperationError(
                            "The key for Triple DES must be 16 or 24 bytes (currently " + key.length + " bytes)"
                        );
                    }
                    return {
                        "algorithm": "3DES-ECB",
                        "key": key.length === 16 ? key + key.substring(0, 8) : key,
                        "blockSize": 8,
                        "Rb": new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0x1b])
                    };
                default:
                    throw new OperationError("Undefined encryption algorithm");
            }
        })();

        const xor = function (a, b, out) {
            if (!out) out = new Uint8Array(a.length);
            for (let i = 0; i < a.length; i++) {
                out[i] = a[i] ^ b[i];
            }
            return out;
        };

        const leftShift1 = function (a) {
            const out = new Uint8Array(a.length);
            let carry = 0;
            for (let i = a.length - 1; i >= 0; i--) {
                out[i] = (a[i] << 1) | carry;
                carry = a[i] >> 7;
            }
            return out;
        };

        const cipher = forge.cipher.createCipher(info.algorithm, info.key);
        const encrypt = function (a, out) {
            if (!out) out = new Uint8Array(a.length);
            cipher.start();
            cipher.update(forge.util.createBuffer(a));
            cipher.finish();
            const cipherText = cipher.output.getBytes();
            for (let i = 0; i < a.length; i++) {
                out[i] = cipherText.charCodeAt(i);
            }
            return out;
        };

        const L = encrypt(new Uint8Array(info.blockSize));
        const K1 = leftShift1(L);
        if (L[0] & 0x80) xor(K1, info.Rb, K1);
        const K2 = leftShift1(K1);
        if (K1[0] & 0x80) xor(K2, info.Rb, K2);

        const n = Math.ceil(input.byteLength / info.blockSize);
        const lastBlock = (function () {
            if (n === 0) {
                const data = new Uint8Array(K2);
                data[0] ^= 0x80;
                return data;
            }
            const inputLast = new Uint8Array(input, info.blockSize * (n - 1));
            if (inputLast.length === info.blockSize) {
                return xor(inputLast, K1, inputLast);
            } else {
                const data = new Uint8Array(info.blockSize);
                data.set(inputLast, 0);
                data[inputLast.length] = 0x80;
                return xor(data, K2, data);
            }
        })();

        const X = new Uint8Array(info.blockSize);
        const Y = new Uint8Array(info.blockSize);
        for (let i = 0; i < n - 1; i++) {
            xor(X, new Uint8Array(input, info.blockSize * i, info.blockSize), Y);
            encrypt(Y, X);
        }
        xor(lastBlock, X, Y);
        const T = encrypt(Y);
        return toHexFast(T);
    }
}

export default CMAC;
