/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast, fromHex } from "../lib/Hex.mjs";
import {
    CryptoGost,
    GostEngine,
} from "@wavesenterprise/crypto-gost-js/index.js";

/**
 * GOST Key Unwrap operation
 */
class GOSTKeyUnwrap extends Operation {
    /**
     * GOSTKeyUnwrap constructor
     */
    constructor() {
        super();

        this.name = "GOST Key Unwrap";
        this.module = "Ciphers";
        this.description =
            "A decryptor for keys wrapped using one of the GOST block ciphers.";
        this.infoURL = "https://wikipedia.org/wiki/GOST_(block_cipher)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "User Key Material",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "Input type",
                type: "option",
                value: ["Hex", "Raw"],
            },
            {
                name: "Output type",
                type: "option",
                value: ["Raw", "Hex"],
            },
            {
                name: "Algorithm",
                type: "argSelector",
                value: [
                    {
                        name: "GOST 28147 (Magma, 1989)",
                        off: [5],
                        on: [6],
                    },
                    {
                        name: "GOST R 34.12 (Kuznyechik, 2015)",
                        on: [5],
                        off: [6],
                    },
                ],
            },
            {
                name: "Block length",
                type: "option",
                value: ["64", "128"],
            },
            {
                name: "sBox",
                type: "option",
                value: [
                    "E-TEST",
                    "E-A",
                    "E-B",
                    "E-C",
                    "E-D",
                    "E-SC",
                    "E-Z",
                    "D-TEST",
                    "D-A",
                    "D-SC",
                ],
            },
            {
                name: "Key wrapping",
                type: "option",
                value: ["NO", "CP", "SC"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [
            keyObj,
            ukmObj,
            inputType,
            outputType,
            version,
            length,
            sBox,
            keyWrapping,
        ] = args;

        const key = toHexFast(
            Utils.convertToByteArray(keyObj.string, keyObj.option),
        );
        const ukm = toHexFast(
            Utils.convertToByteArray(ukmObj.string, ukmObj.option),
        );
        input =
            inputType === "Hex"
                ? input
                : toHexFast(Utils.strToArrayBuffer(input));

        const versionNum = version === "GOST 28147 (Magma, 1989)" ? 1989 : 2015;
        const blockLength = versionNum === 1989 ? 64 : parseInt(length, 10);
        const sBoxVal = versionNum === 1989 ? sBox : null;

        const algorithm = {
            version: versionNum,
            length: blockLength,
            mode: "KW",
            sBox: sBoxVal,
            keyWrapping: keyWrapping,
        };

        try {
            const Hex = CryptoGost.coding.Hex;
            algorithm.ukm = Hex.decode(ukm);

            const cipher = GostEngine.getGostCipher(algorithm);
            const out = Hex.encode(
                cipher.unwrapKey(Hex.decode(key), Hex.decode(input)),
            );

            return outputType === "Hex"
                ? out
                : Utils.byteArrayToChars(fromHex(out));
        } catch (err) {
            if (err.toString().includes("Invalid typed array length")) {
                throw new OperationError(
                    "Incorrect input length. Must be a multiple of the block size.",
                );
            }
            throw new OperationError(err);
        }
    }
}

export default GOSTKeyUnwrap;
