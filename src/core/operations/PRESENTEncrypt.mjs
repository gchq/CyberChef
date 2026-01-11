/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { encryptPRESENT } from "../lib/Present.mjs";

/**
 * PRESENT Encrypt operation
 */
class PRESENTEncrypt extends Operation {

    /**
     * PRESENTEncrypt constructor
     */
    constructor() {
        super();

        this.name = "PRESENT Encrypt";
        this.module = "Ciphers";
        this.description = "PRESENT is an ultra-lightweight block cipher designed for constrained environments such as RFID tags and sensor networks. It operates on 64-bit blocks and supports 80-bit or 128-bit keys with 31 rounds. Standardized in ISO/IEC 29192-2:2019.<br><br>When using CBC mode, the PKCS#7 padding scheme is used.";
        this.infoURL = "https://wikipedia.org/wiki/PRESENT_(cipher)";
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
                "value": ["CBC", "ECB"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Raw", "Hex"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Hex", "Raw"]
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

        if (key.length !== 10 && key.length !== 16)
            throw new OperationError(`Invalid key length: ${key.length} bytes

PRESENT uses a key length of 10 bytes (80 bits) or 16 bytes (128 bits).`);

        if (iv.length !== 8 && mode !== "ECB")
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

PRESENT uses an IV length of 8 bytes (64 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        input = Utils.convertToByteArray(input, inputType);
        const output = encryptPRESENT(input, key, iv, mode, padding);
        return outputType === "Hex" ? toHex(output, "") : Utils.byteArrayToUtf8(output);
    }

}

export default PRESENTEncrypt;
