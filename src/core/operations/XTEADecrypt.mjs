/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { decryptXTEA, TEA_BLOCK_SIZE } from "../lib/TEA.mjs";

/**
 * XTEA Decrypt operation
 */
class XTEADecrypt extends Operation {

    /**
     * XTEADecrypt constructor
     */
    constructor() {
        super();

        this.name = "XTEA Decrypt";
        this.module = "Ciphers";
        this.description = "XTEA (eXtended Tiny Encryption Algorithm) is a block cipher designed by David Wheeler and Roger Needham in 1997 as a successor to TEA, correcting several weaknesses identified in the original algorithm. It operates on 64-bit blocks using a 128-bit key with an improved key schedule that uses sum-dependent key word selection to resist related-key attacks.<br><br>XTEA retains the simplicity and compact implementation of TEA whilst providing significantly improved security. It is frequently encountered in malware analysis and CTF challenges due to its straightforward implementation.<br><br><b>Key:</b> Must be exactly 16 bytes (128 bits).<br><br><b>IV:</b> The Initialisation Vector should be 8 bytes (64 bits). If not entered, it will default to null bytes.<br><br><b>Rounds:</b> The recommended number of rounds is 32 (default). The reference implementation by Wheeler &amp; Needham accepts a configurable round count.<br><br><b>Padding:</b> In CBC and ECB mode, the PKCS#5 padding scheme is used.";
        this.infoURL = "https://wikipedia.org/wiki/XTEA";
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
            },
            {
                "name": "Rounds",
                "type": "number",
                "value": 32,
                "min": 1,
                "max": 255
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
            [,, mode, inputType, outputType, padding, rounds] = args;

        if (key.length !== 16)
            throw new OperationError(`Invalid key length: ${key.length} bytes

XTEA requires a key length of 16 bytes (128 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        if (iv.length !== TEA_BLOCK_SIZE && iv.length !== 0 && mode !== "ECB")
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

XTEA uses an IV length of ${TEA_BLOCK_SIZE} bytes (${TEA_BLOCK_SIZE * 8} bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        if (!Number.isInteger(rounds) || rounds < 1 || rounds > 255)
            throw new OperationError(`Invalid number of rounds: ${rounds}

Rounds must be an integer between 1 and 255. Standard XTEA uses 32 rounds.`);

        // Default IV to null bytes if empty (like AES)
        const actualIv = iv.length === 0 ? new Array(TEA_BLOCK_SIZE).fill(0) : iv;

        input = Utils.convertToByteArray(input, inputType);
        const output = decryptXTEA(input, key, actualIv, mode, padding, rounds);
        return outputType === "Hex" ? toHex(output, "") : Utils.byteArrayToUtf8(output);
    }

}

export default XTEADecrypt;
