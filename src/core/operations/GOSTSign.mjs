/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast, fromHex } from "../lib/Hex.mjs";
import { CryptoGost, GostEngine } from "@wavesenterprise/crypto-gost-js/index.js";

/**
 * GOST Sign operation
 */
class GOSTSign extends Operation {
    /**
     * GOSTSign constructor
     */
    constructor() {
        super();

        this.name = "GOST Sign";
        this.module = "Ciphers";
        this.description = "Sign a plaintext message using one of the GOST block ciphers.";
        this.infoURL = "https://wikipedia.org/wiki/GOST_(block_cipher)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                name: "Input type",
                type: "option",
                value: ["Raw", "Hex"]
            },
            {
                name: "Output type",
                type: "option",
                value: ["Hex", "Raw"]
            },
            {
                name: "Algorithm",
                type: "argSelector",
                value: [
                    {
                        name: "GOST 28147 (Magma, 1989)",
                        off: [5],
                        on: [6]
                    },
                    {
                        name: "GOST R 34.12 (Kuznyechik, 2015)",
                        on: [5],
                        off: [6]
                    }
                ]
            },
            {
                name: "Block length",
                type: "option",
                value: ["64", "128"]
            },
            {
                name: "sBox",
                type: "option",
                value: ["E-TEST", "E-A", "E-B", "E-C", "E-D", "E-SC", "E-Z", "D-TEST", "D-A", "D-SC"]
            },
            {
                name: "MAC length",
                type: "number",
                value: 32,
                min: 8,
                max: 64,
                step: 8
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [keyObj, ivObj, inputType, outputType, version, length, sBox, macLength] = args;

        const key = toHexFast(Utils.convertToByteArray(keyObj.string, keyObj.option));
        const iv = toHexFast(Utils.convertToByteArray(ivObj.string, ivObj.option));
        input = inputType === "Hex" ? input : toHexFast(Utils.strToArrayBuffer(input));

        const versionNum = version === "GOST 28147 (Magma, 1989)" ? 1989 : 2015;
        const blockLength = versionNum === 1989 ? 64 : parseInt(length, 10);
        const sBoxVal = versionNum === 1989 ? sBox : null;

        const algorithm = {
            version: versionNum,
            length: blockLength,
            mode: "MAC",
            sBox: sBoxVal,
            macLength: macLength
        };

        try {
            const Hex = CryptoGost.coding.Hex;
            if (iv) algorithm.iv = Hex.decode(iv);

            const cipher = GostEngine.getGostCipher(algorithm);
            const out = Hex.encode(cipher.sign(Hex.decode(key), Hex.decode(input)));

            return outputType === "Hex" ? out : Utils.byteArrayToChars(fromHex(out));
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default GOSTSign;
