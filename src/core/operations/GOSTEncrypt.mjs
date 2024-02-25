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
 * GOST Encrypt operation
 */
class GOSTEncrypt extends Operation {
    /**
     * GOSTEncrypt constructor
     */
    constructor() {
        super();

        this.name = "GOST Encrypt";
        this.module = "Ciphers";
        this.description =
            "The GOST block cipher (Magma), defined in the standard GOST 28147-89 (RFC 5830), is a Soviet and Russian government standard symmetric key block cipher with a block size of 64 bits. The original standard, published in 1989, did not give the cipher any name, but the most recent revision of the standard, GOST R 34.12-2015 (RFC 7801, RFC 8891), specifies that it may be referred to as Magma. The GOST hash function is based on this cipher. The new standard also specifies a new 128-bit block cipher called Kuznyechik.<br><br>Developed in the 1970s, the standard had been marked 'Top Secret' and then downgraded to 'Secret' in 1990. Shortly after the dissolution of the USSR, it was declassified and it was released to the public in 1994. GOST 28147 was a Soviet alternative to the United States standard algorithm, DES. Thus, the two are very similar in structure.";
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
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "Input type",
                type: "option",
                value: ["Raw", "Hex"],
            },
            {
                name: "Output type",
                type: "option",
                value: ["Hex", "Raw"],
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
                name: "Block mode",
                type: "option",
                value: ["ECB", "CFB", "OFB", "CTR", "CBC"],
            },
            {
                name: "Key meshing mode",
                type: "option",
                value: ["NO", "CP"],
            },
            {
                name: "Padding",
                type: "option",
                value: ["NO", "PKCS5", "ZERO", "RANDOM", "BIT"],
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
            ivObj,
            inputType,
            outputType,
            version,
            length,
            sBox,
            blockMode,
            keyMeshing,
            padding,
        ] = args;

        const key = toHexFast(
            Utils.convertToByteArray(keyObj.string, keyObj.option),
        );
        const iv = toHexFast(
            Utils.convertToByteArray(ivObj.string, ivObj.option),
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
            mode: "ES",
            sBox: sBoxVal,
            block: blockMode,
            keyMeshing: keyMeshing,
            padding: padding,
        };

        try {
            const Hex = CryptoGost.coding.Hex;
            if (iv) algorithm.iv = Hex.decode(iv);

            const cipher = GostEngine.getGostCipher(algorithm);
            const out = Hex.encode(
                cipher.encrypt(Hex.decode(key), Hex.decode(input)),
            );

            return outputType === "Hex"
                ? out
                : Utils.byteArrayToChars(fromHex(out));
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default GOSTEncrypt;
