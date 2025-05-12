/**
 * @author jg42526
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import bencodec from "bencodec";

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
        return bencodec.encode(parseValue(input), { stringify: true });
    }

}

export default BencodeEncode;

/**
 * Parses string, returns appropraite data structure
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
