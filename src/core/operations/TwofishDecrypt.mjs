/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { decryptTwofish } from "../lib/Twofish.mjs";

/**
 * Twofish Decrypt operation
 */
class TwofishDecrypt extends Operation {

    /**
     * TwofishDecrypt constructor
     */
    constructor() {
        super();

        this.name = "Twofish Decrypt";
        this.module = "Ciphers";
        this.description = "Twofish is a symmetric key block cipher designed by Bruce Schneier. It was one of the five AES finalists. Twofish operates on 128-bit blocks and supports key sizes of 128, 192, or 256 bits with 16 rounds of a Feistel network.<br><br>When using CBC or ECB mode, the PKCS#7 padding scheme is used.";
        this.infoURL = "https://wikipedia.org/wiki/Twofish";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Mode",
                "type": "option",
                "value": ["CBC", "CFB", "OFB", "CTR", "ECB"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex"]
            },
            {
                "name": "Padding",
                "type": "option",
                "value": ["PKCS5", "NO", "ZERO", "RANDOM", "BIT"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            [,, mode, inputType, outputType, padding] = args;

        if (key.length !== 16 && key.length !== 24 && key.length !== 32)
            throw new OperationError(`Invalid key length: ${key.length} bytes

Twofish uses a key length of 16 bytes (128 bits), 24 bytes (192 bits), or 32 bytes (256 bits).`);

        if (iv.length !== 16 && mode !== "ECB")
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

Twofish uses an IV length of 16 bytes (128 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        input = Utils.convertToByteArray(input, inputType);
        const output = decryptTwofish(input, key, iv, mode, padding);
        return outputType === "Hex" ? toHex(output, "") : Utils.byteArrayToUtf8(output);
    }

}

export default TwofishDecrypt;
