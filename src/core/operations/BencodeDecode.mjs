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
class BencodeDecode extends Operation {

    /**
     * URLDecode constructor
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
        if (input) return toStringRepresentation(bencodec.decode(input, { stringify: true }));
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
