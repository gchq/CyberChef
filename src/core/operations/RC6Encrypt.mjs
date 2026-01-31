/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHex } from "../lib/Hex.mjs";
import { encryptRC6, getBlockSize, getDefaultRounds } from "../lib/RC6.mjs";

/**
 * RC6 Encrypt operation
 */
class RC6Encrypt extends Operation {

    /**
     * RC6Encrypt constructor
     */
    constructor() {
        super();

        this.name = "RC6 Encrypt";
        this.module = "Ciphers";
        this.description = "RC6 is a symmetric key block cipher derived from RC5. It was designed by Ron Rivest, Matt Robshaw, Ray Sidney, and Yiqun Lisa Yin to meet the requirements of the AES competition, and was one of the five finalists.<br><br>RC6 is parameterised as RC6-w/r/b where w is word size in bits (any multiple of 8 from 8-256), r is the number of rounds (1-255), and b is the key length in bytes. The standard AES submission uses w=32, r=20. Common word sizes: 8, 16, 32 (standard), 64, 128.<br><br><b>IV:</b> The Initialisation Vector should be 4*w/8 bytes (e.g. 16 bytes for w=32). If not entered, it will default to null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, the PKCS#7 padding scheme is used.";
        this.infoURL = "https://wikipedia.org/wiki/RC6";
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
            },
            {
                "name": "Word Size",
                "type": "number",
                "value": 32,
                "min": 8,
                "max": 256,
                "step": 8
            },
            {
                "name": "Rounds",
                "type": "number",
                "value": 20,
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
            [,, mode, inputType, outputType, padding, wordSize, rounds] = args;

        // Validate word size
        if (!Number.isInteger(wordSize) || wordSize < 8 || wordSize > 256 || wordSize % 8 !== 0)
            throw new OperationError(`Invalid word size: ${wordSize}. Must be a multiple of 8 between 8 and 256.`);

        const blockSize = getBlockSize(wordSize);
        const defaultRounds = getDefaultRounds(wordSize);

        if (key.length === 0)
            throw new OperationError(`Invalid key length: ${key.length} bytes

RC6 requires a key of at least 1 byte.`);

        if (iv.length !== blockSize && iv.length !== 0 && mode !== "ECB")
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

RC6-${wordSize} uses an IV length of ${blockSize} bytes (${blockSize * 8} bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);

        if (!Number.isInteger(rounds) || rounds < 1 || rounds > 255)
            throw new OperationError(`Invalid number of rounds: ${rounds}

Rounds must be an integer between 1 and 255. Standard for w=${wordSize} is ${defaultRounds}.`);

        // Default IV to null bytes if empty (like AES)
        const actualIv = iv.length === 0 ? new Array(blockSize).fill(0) : iv;

        input = Utils.convertToByteArray(input, inputType);
        const output = encryptRC6(input, key, actualIv, mode, padding, rounds, wordSize);
        return outputType === "Hex" ? toHex(output, "") : Utils.byteArrayToUtf8(output);
    }

}

export default RC6Encrypt;
