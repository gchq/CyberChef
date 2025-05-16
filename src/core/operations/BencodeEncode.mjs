/**
 * @author jg42526
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * URL Decode operation
 */
class BencodeEncode extends Operation {

    /**
     * URLDecode constructor
     */
    constructor() {
        super();

        this.name = "Bencode Encode";
        this.module = "Encodings";
        this.description = "Bencodes a string.<br><br>e.g. <code>bencode</code> becomes <code>7:bencode</code>";
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
        const encoder = new BencodeEncoder({ stringify: true });
        return encoder.encode(parseValue(input));
    }

}

export default BencodeEncode;

/**
 * Parses string, returns appropriate data structure
 */
function parseValue(str) {
    const trimmed = str.trim();
    try {
        // Attempt to parse with JSON.parse
        return JSON.parse(trimmed);
    } catch (e) {
        // If JSON.parse fails, treat input as a plain string (assuming it's unquoted)
        return trimmed;
    }
}

const FLAG = {
    INTEGER: 0x69, // 'i'
    STR_DELIMITER: 0x3a, // ':'
    LIST: 0x6c, // 'l'
    DICTIONARY: 0x64, // 'd'
    END: 0x65, // 'e'
};

/**
 * BencodeEncoder class for encoding data into bencode format.
 */
class BencodeEncoder {
    /**
     *
     */
    constructor(options = {}) {
        this._integerIdentifier = Buffer.from([FLAG.INTEGER]);
        this._stringDelimiterIdentifier = Buffer.from([FLAG.STR_DELIMITER]);
        this._listIdentifier = Buffer.from([FLAG.LIST]);
        this._dictionaryIdentifier = Buffer.from([FLAG.DICTIONARY]);
        this._endIdentifier = Buffer.from([FLAG.END]);
        this._buffer = [];
        this._options = options;
    }

    /**
     * Encodes the given data into bencode format.
     * @param {*} data - The data to encode.
     * @returns {Buffer|string} - The encoded data as a Buffer or string.
     */
    encode(data) {
        this._encodeType(data);
        const result = Buffer.concat(this._buffer);
        return this._options.stringify ? result.toString("utf8") : result;
    }

    /**
     * Determines the type of data and encodes it accordingly.
     * @param {*} data - The data to encode.
     */
    _encodeType(data) {
        if (Buffer.isBuffer(data)) {
            return this._encodeBuffer(data);
        }
        if (Array.isArray(data)) {
            return this._encodeList(data);
        }
        if (ArrayBuffer.isView(data)) {
            return this._encodeBuffer(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
        }
        if (data instanceof ArrayBuffer) {
            return this._encodeBuffer(Buffer.from(data));
        }
        if (typeof data === "boolean") {
            return this._encodeInteger(data ? 1 : 0);
        }
        if (typeof data === "number") {
            return this._encodeInteger(data);
        }
        if (typeof data === "string") {
            return this._encodeString(data);
        }
        if (typeof data === "object") {
            return this._encodeDictionary(data);
        }
        throw new Error(`${typeof data} is unsupported type.`);
    }

    /**
     * Buffer into bencode format.
     * @param {Buffer} data - The buffer to encode.
     */
    _encodeBuffer(data) {
        this._buffer.push(
            Buffer.from(String(data.length)),
            this._stringDelimiterIdentifier,
            data
        );
    }

    /**
     * Encodes a string into bencode format.
     * @param {string} data - The string to encode.
     */
    _encodeString(data) {
        this._buffer.push(
            Buffer.from(String(Buffer.byteLength(data))),
            this._stringDelimiterIdentifier,
            Buffer.from(data)
        );
    }

    /**
     * Encodes an integer into bencode format.
     * @param {number} data - The integer to encode.
     */
    _encodeInteger(data) {
        this._buffer.push(
            this._integerIdentifier,
            Buffer.from(String(Math.round(data))),
            this._endIdentifier
        );
    }

    /**
     * Encodes a list (array) into bencode format.
     * @param {Array} data - The list to encode.
     */
    _encodeList(data) {
        this._buffer.push(this._listIdentifier);
        for (const item of data) {
            if (item === null || item === undefined) continue;
            this._encodeType(item);
        }
        this._buffer.push(this._endIdentifier);
    }

    /**
     * Encodes a dictionary (object) into bencode format.
     * @param {Object} data - The dictionary to encode.
     */
    _encodeDictionary(data) {
        this._buffer.push(this._dictionaryIdentifier);
        const keys = Object.keys(data).sort();
        for (const key of keys) {
            if (data[key] === null || data[key] === undefined) continue;
            this._encodeString(key);
            this._encodeType(data[key]);
        }
        this._buffer.push(this._endIdentifier);
    }
}
