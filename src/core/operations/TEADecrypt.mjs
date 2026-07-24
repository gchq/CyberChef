/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { decryptTEA, TEA_BLOCK_SIZE } from "../lib/TEA.mjs";

/**
 * TEA Decrypt operation
 */
class TEADecrypt extends Operation {

    /**
     * TEADecrypt constructor
     */
    constructor() {
        super();

        this.name = "TEA Decrypt";
        this.module = "Ciphers";
        this.description = "TEA (Tiny Encryption Algorithm) is a block cipher designed by David Wheeler and Roger Needham in 1994. It operates on 64-bit blocks using a 128-bit key and performs 32 cycles (64 Feistel rounds) with the DELTA constant 0x9E3779B9 derived from the golden ratio.<br><br>TEA is notable for its simplicity and compact implementation, making it frequently encountered in malware analysis and CTF challenges. Despite its elegance, TEA has known weaknesses including equivalent keys and susceptibility to related-key attacks, leading to successors XTEA and XXTEA.<br><br><b>Key:</b> Must be exactly 16 bytes (128 bits).<br><br><b>IV:</b> The Initialisation Vector should be 8 bytes (64 bits). If not entered, it will default to null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, the PKCS#5 padding scheme is used.";
        this.infoURL = "https://wikipedia.org/wiki/Tiny_Encryption_Algorithm";
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

        if (key.length !== 16)
            throw new OperationError(`Invalid key length: ${key.length} bytes

TEA requires a key length of 16 bytes (128 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        if (iv.length !== TEA_BLOCK_SIZE && iv.length !== 0 && mode !== "ECB")
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

TEA uses an IV length of ${TEA_BLOCK_SIZE} bytes (${TEA_BLOCK_SIZE * 8} bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        // Default IV to null bytes if empty (like AES)
        const actualIv = iv.length === 0 ? new Array(TEA_BLOCK_SIZE).fill(0) : iv;

        input = Utils.convertToByteArray(input, inputType);
        const output = decryptTEA(input, key, actualIv, mode, padding);
        return outputType === "Hex" ? toHex(output, "") : Utils.byteArrayToUtf8(output);
    }

}

export default TEADecrypt;
