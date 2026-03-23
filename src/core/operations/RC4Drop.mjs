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
 * RC4 Drop operation
 */
class RC4Drop extends Operation {

    /**
     * RC4Drop constructor
     */
    constructor() {
        super();

        this.name = "RC4 Drop";
        this.module = "Ciphers";
        this.description = "It was discovered that the first few bytes of the RC4 keystream are strongly non-random and leak information about the key. We can defend against this attack by discarding the initial portion of the keystream. This modified algorithm is traditionally called RC4-drop.";
        this.infoURL = "https://wikipedia.org/wiki/RC4#Fluhrer,_Mantin_and_Shamir_attack";
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
            },
            {
                "name": "Number of dwords to drop",
                "type": "number",
                "value": 192
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
        const drop = args[3];
        const keyFormat = args[0].option;
        const keyStr = args[0].string;

        const inputBytes = formatParse(input, inputFormat);
        const keyBytes = formatParse(keyStr, keyFormat);
        // RC4Drop drops dwords (4 bytes each)
        const outputBytes = rc4(inputBytes, keyBytes, drop * 4);

        return formatStringify(outputBytes, outputFormat);
    }

    /**
     * Highlight RC4 Drop
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
     * Highlight RC4 Drop in reverse
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

export default RC4Drop;
