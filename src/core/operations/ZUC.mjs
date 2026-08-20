/**
 * @author Kyi Wong
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { format } from "../lib/Ciphers.mjs";
import ZucAlgo from "../lib/ZUC.mjs";
import { fromHex, toHex } from "../lib/Hex.mjs";
import { toBase64, fromBase64 } from "../lib/Base64.mjs";

/**
 * ZUC operation
 */
class ZUC extends Operation {

    /**
     * ZUC constructor
     */
    constructor() {
        super();

        this.name = "ZUC";
        this.module = "Ciphers";
        this.description = "ZUC is a stream cipher designed by the Chinese Academy of Sciences. It forms the core of the 3GPP confidentiality algorithm 128-EEA3 and the 3GPP integrity algorithm 128-EIA3. The cipher takes a 128-bit key and a 128-bit Initialization Vector (IV) and generates a keystream of 32-bit words.";
        this.infoURL = "https://en.wikipedia.org/wiki/ZUC_stream_cipher";
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
                "name": "Input format",
                "type": "option",
                "value": ["Latin1", "UTF8", "Hex", "Base64"]
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Latin1", "UTF8", "Hex", "Base64"]
            }
        ];
    }

    /**
     * Parse input to Uint8Array based on format
     * @param {string} input
     * @param {string} formatType
     * @returns {Uint8Array}
     */
    _parseInput(input, formatType) {
        if (!input) return new Uint8Array(0);
        switch (formatType) {
            case "Hex":
                return new Uint8Array(fromHex(input));
            case "Base64":
                return new Uint8Array(fromBase64(input));
            case "UTF8":
            case "Latin1":
            default: {
                // Fallback to CryptoJS for string formats
                const words = format[formatType].parse(input);
                const bytes = new Uint8Array(words.sigBytes);
                for (let i = 0; i < words.sigBytes; i++) {
                    bytes[i] = (words.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                }
                return bytes;
            }
        }
    }

    /**
     * Format Uint8Array to string based on format
     * @param {Uint8Array} bytes
     * @param {string} formatType
     * @returns {string}
     */
    _formatOutput(bytes, formatType) {
        if (bytes.length === 0) return "";
        switch (formatType) {
            case "Hex":
                return toHex(bytes).replace(/\s/g, ""); // Ensure pure hex output for test vectors and CyberChef defaults
            case "Base64":
                return toBase64(bytes);
            case "UTF8":
            case "Latin1":
            default: {
                const words = [];
                for (let i = 0; i < bytes.length; i++) {
                    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
                }
                const wordObj = { words: words, sigBytes: bytes.length };
                return format[formatType].stringify(wordObj);
            }
        }
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const keyInput = args[0].string;
        const keyFormat = args[0].option;
        const ivInput = args[1].string;
        const ivFormat = args[1].option;
        const inputFormat = args[2];
        const outputFormat = args[3];

        if (!keyInput || !ivInput) {
            return input; // Do nothing if key or iv are not provided
        }

        const keyBytes = this._parseInput(keyInput, keyFormat);
        const ivBytes = this._parseInput(ivInput, ivFormat);

        if (keyBytes.length !== 16) {
            throw new Error(`Invalid Key length: expected 16 bytes, got ${keyBytes.length} bytes.`);
        }
        if (ivBytes.length !== 16) {
            throw new Error(`Invalid IV length: expected 16 bytes, got ${ivBytes.length} bytes.`);
        }

        const messageBytes = this._parseInput(input, inputFormat);

        if (messageBytes.length === 0) {
            return "";
        }

        const zuc = new ZucAlgo(keyBytes, ivBytes);
        const outputBytes = zuc.process(messageBytes);

        return this._formatOutput(outputBytes, outputFormat);
    }

}

export default ZUC;
