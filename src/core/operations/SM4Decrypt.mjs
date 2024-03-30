/**
 * @author swesven
 * @copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { decryptSM4 } from "../lib/SM4.mjs";

/**
 * SM4 Decrypt operation
 */
class SM4Decrypt extends Operation {

    /**
     * SM4Encrypt constructor
     */
    constructor() {
        super();

        this.name = "SM4 Decrypt";
        this.module = "Ciphers";
        this.description = "SM4 is a 128-bit block cipher, currently established as a national standard (GB/T 32907-2016) of China.";
        this.infoURL = "https://wikipedia.org/wiki/SM4_(cipher)";
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
                "value": ["CBC", "CFB", "OFB", "CTR", "ECB", "CBC/NoPadding", "ECB/NoPadding"]
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
            [,, mode, inputType, outputType] = args;

        if (key.length !== 16)
            throw new OperationError(`Invalid key length: ${key.length} bytes

SM4 uses a key length of 16 bytes (128 bits).`);
        if (iv.length !== 16 && !mode.startsWith("ECB"))
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

SM4 uses an IV length of 16 bytes (128 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        input = Utils.convertToByteArray(input, inputType);
        const output = decryptSM4(input, key, iv, mode.substring(0, 3), mode.endsWith("NoPadding"));
        return outputType === "Hex" ? toHex(output) : Utils.byteArrayToUtf8(output);
    }

}

export default SM4Decrypt;
