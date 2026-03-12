/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { aesKeyUnwrap } from "../lib/AESKeyWrap.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * AES Key Unwrap operation
 */
class AESKeyUnwrap extends Operation {

    /**
     * AESKeyUnwrap constructor
     */
    constructor() {
        super();

        this.name = "AES Key Unwrap";
        this.module = "Ciphers";
        this.description = "Decryptor for a key wrapping algorithm defined in RFC3394, which is used to protect keys in untrusted storage or communications, using AES.<br><br>This algorithm uses an AES key (KEK: key-encryption key) and a 64-bit IV to decrypt 64-bit blocks.";
        this.infoURL = "https://wikipedia.org/wiki/Key_wrap";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key (KEK)",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV",
                "type": "toggleString",
                "value": "a6a6a6a6a6a6a6a6",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const kek = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            inputType = args[2],
            outputType = args[3];

        if (kek.length !== 16 && kek.length !== 24 && kek.length !== 32) {
            throw new OperationError("KEK must be either 16, 24, or 32 bytes (currently " + kek.length + " bytes)");
        }
        if (iv.length !== 8) {
            throw new OperationError("IV must be 8 bytes (currently " + iv.length + " bytes)");
        }
        const inputData = Utils.convertToByteString(input, inputType);
        if (inputData.length % 8 !== 0 || inputData.length < 24) {
            throw new OperationError("input must be 8n (n>=3) bytes (currently " + inputData.length + " bytes)");
        }

        const [output, outputIv] = aesKeyUnwrap(inputData, kek);

        if (outputIv !== iv) {
            throw new OperationError("IV mismatch");
        }

        return outputType === "Hex" ? toHexFast(Utils.strToArrayBuffer(output)) : output;
    }

}

export default AESKeyUnwrap;
