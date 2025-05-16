/**
 * @author jg42526
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * URL Decode operation
 */
class BencodeDecode extends Operation {

    /**
     * URL Decode constructor
     */
    constructor() {
        super();

        this.name = "Bencode Decode";
        this.module = "Encodings";
        this.description = "Decodes a Bencoded string.<br><br>e.g. <code>7:bencode</code> becomes <code>bencode</code>";
        this.infoURL = "https://en.wikipedia.org/wiki/Bencode";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input) {
            const decoder = new BencodeDecoder(input, {stringify: true}).decode();
            return toStringRepresentation(decoder);
        }
        return "";
    }

}

export default BencodeDecode;

/**
 * Returns string representation of object
 */
function toStringRepresentation(value) {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (Array.isArray(value) || (value !== null && typeof value === "object")) {
        // For arrays and objects, output JSON string
        return JSON.stringify(value);
    }

    // For other types (undefined, null), handle as you see fit, e.g.:
    return String(value);
}

const FLAG = {
    INTEGER: 0x69, // 'i'
    STR_DELIMITER: 0x3a, // ':'
    LIST: 0x6c, // 'l'
    DICTIONARY: 0x64, // 'd'
    END: 0x65, // 'e'
    MINUS: 0x2d, // '-'
    PLUS: 0x2b, // '+'
    DOT: 0x2e, // '.'
};

/**
 * Class for decoding data from the Bencode format.
 * Credit to @isolomak:
 * https://github.com/isolomak/bencodec
 */
class BencodeDecoder {
    /**
     * Creates an instance of BencodeDecoder.
     * @param {Buffer|string} data - The bencoded data to decode.
     * @param {Object} [options={}] - Optional decoding options.
     * @param {boolean} [options.stringify=false] - Whether to return strings instead of Buffers.
     */
    constructor(data, options = {}) {
        if (!data) throw new Error("Nothing to decode");
        this._index = 0;
        this._options = options;
        this._buffer = typeof data === "string" ? Buffer.from(data) : data;
    }

    /**
     * Checks if a character code represents a digit (0–9).
     * @param {number} char - The character code to check.
     * @returns {boolean} - True if the character is a digit.
     */
    static _isInteger(char) {
        return char >= 0x30 && char <= 0x39;
    }

    /**
     * Returns the current character code in the buffer.
     * @returns {number} - The current character code.
     */
    _currentChar() {
        return this._buffer[this._index];
    }

    /**
     * Returns the next character code in the buffer and advances the index.
     * @returns {number} - The next character code.
     */
    _next() {
        return this._buffer[this._index++];
    }

    /**
     * Decodes the bencoded data.
     * @returns {*} - The decoded value (string, number, list, or dictionary).
     */
    decode() {
        const char = this._currentChar();
        if (BencodeDecoder._isInteger(char)) return this._decodeString();
        if (char === FLAG.INTEGER) return this._decodeInteger();
        if (char === FLAG.LIST) return this._decodeList();
        if (char === FLAG.DICTIONARY) return this._decodeDictionary();
        throw new Error("Invalid bencode data");
    }

    /**
     * Decodes a bencoded string.
     * @returns {Buffer|string} - The decoded string or Buffer.
     */
    _decodeString() {
        const length = this._decodeInteger();
        const acc = [];
        for (let i = 0; i < length; i++) acc.push(this._next());
        const result = Buffer.from(acc);
        return this._options.stringify ? result.toString("utf8") : result;
    }

    /**
     * Decodes a bencoded integer.
     * @returns {number} - The decoded integer.
     */
    _decodeInteger() {
        let sign = 1;
        let integer = 0;

        if (this._currentChar() === FLAG.INTEGER) this._index++;
        if (this._currentChar() === FLAG.PLUS) this._index++;
        if (this._currentChar() === FLAG.MINUS) {
            this._index++;
            sign = -1;
        }

        while (BencodeDecoder._isInteger(this._currentChar()) || this._currentChar() === FLAG.DOT) {
            if (this._currentChar() === FLAG.DOT) {
                this._index++; // Skip dot (float not supported)
            } else {
                integer = integer * 10 + (this._next() - 0x30);
            }
        }

        if (this._currentChar() === FLAG.END) this._index++;
        if (this._currentChar() === FLAG.STR_DELIMITER) this._index++;

        return integer * sign;
    }

    /**
     * Decodes a bencoded list.
     * @returns {Array} - The decoded list.
     */
    _decodeList() {
        const acc = [];
        this._next(); // Skip 'l'
        while (this._currentChar() !== FLAG.END) {
            acc.push(this.decode());
        }
        this._next(); // Skip 'e'
        return acc;
    }

    /**
     * Decodes a bencoded dictionary.
     * @returns {Object} - The decoded dictionary.
     */
    _decodeDictionary() {
        const acc = {};
        this._next(); // Skip 'd'
        while (this._currentChar() !== FLAG.END) {
            const key = this._decodeString();
            acc[key.toString()] = this.decode();
        }
        this._next(); // Skip 'e'
        return acc;
    }
}
