/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { rc4 } from "../lib/RC4.mjs";
import { toHex, fromHex } from "../lib/Hex.mjs";
import { toBase64, fromBase64 } from "../lib/Base64.mjs";

/**
 * RC4 operation
 */
class RC4 extends Operation {

    /**
     * RC4 constructor
     */
    constructor() {
        super();

        this.name = "RC4";
        this.module = "Ciphers";
        this.description = "RC4 (also known as ARC4) is a widely-used stream cipher designed by Ron Rivest. It is used in popular protocols such as SSL and WEP. Although remarkable for its simplicity and speed, the algorithm's history doesn't inspire confidence in its security.";
        this.infoURL = "https://wikipedia.org/wiki/RC4";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Passphrase",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1", "Hex", "Base64"]
            },
            {
                "name": "Input format",
                "type": "option",
                "value": ["Latin1", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Hex", "Base64"]
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Latin1", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Hex", "Base64"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const inputFormat = args[1];
        const outputFormat = args[2];
        const keyFormat = args[0].option;
        const keyStr = args[0].string;

        const inputBytes = formatParse(input, inputFormat);
        const keyBytes = formatParse(keyStr, keyFormat);
        const outputBytes = rc4(inputBytes, keyBytes);

        return formatStringify(outputBytes, outputFormat);
    }

    /**
     * Highlight RC4
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight RC4 in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

/**
 * Parse a string in the given format to Uint8Array.
 *
 * @param {string} str
 * @param {string} format
 * @returns {Uint8Array}
 */
function formatParse(str, format) {
    switch (format) {
        case "Hex":
            return new Uint8Array(fromHex(str, "Auto"));
        case "Base64":
            return Utils.strToByteArray(fromBase64(str));
        case "UTF8":
            return new TextEncoder().encode(str);
        case "Latin1":
        default: {
            const bytes = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
                bytes[i] = str.charCodeAt(i) & 0xFF;
            }
            return bytes;
        }
        case "UTF16":
        case "UTF16BE": {
            const bytes = new Uint8Array(str.length * 2);
            for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                bytes[i * 2] = (code >> 8) & 0xFF;
                bytes[i * 2 + 1] = code & 0xFF;
            }
            return bytes;
        }
        case "UTF16LE": {
            const bytes = new Uint8Array(str.length * 2);
            for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                bytes[i * 2] = code & 0xFF;
                bytes[i * 2 + 1] = (code >> 8) & 0xFF;
            }
            return bytes;
        }
    }
}

/**
 * Stringify a Uint8Array in the given format.
 *
 * @param {Uint8Array} bytes
 * @param {string} format
 * @returns {string}
 */
function formatStringify(bytes, format) {
    switch (format) {
        case "Hex":
            return toHex(bytes, "");
        case "Base64":
            return toBase64(bytes);
        case "UTF8":
            return new TextDecoder("utf-8").decode(bytes);
        case "Latin1":
        default: {
            let str = "";
            for (let i = 0; i < bytes.length; i++) {
                str += String.fromCharCode(bytes[i]);
            }
            return str;
        }
        case "UTF16":
        case "UTF16BE": {
            let str = "";
            for (let i = 0; i < bytes.length - 1; i += 2) {
                str += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
            }
            return str;
        }
        case "UTF16LE": {
            let str = "";
            for (let i = 0; i < bytes.length - 1; i += 2) {
                str += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
            }
            return str;
        }
    }
}

export default RC4;
