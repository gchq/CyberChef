/**
 * Hexadecimal functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";


/**
 * Convert a byte array into a hex string.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer} data
 * @param {string} [delim=" "]
 * @param {number} [padding=2]
 * @returns {string}
 *
 * @example
 * // returns "0a 14 1e"
 * toHex([10,20,30]);
 *
 * // returns "0a:14:1e"
 * toHex([10,20,30], ":");
 *
 * // returns "0x0a,0x14,0x1e"
 * toHex([10,20,30], "0x", 2, ",")
 */
export function toHex(data, delim=" ", padding=2, extraDelim="", lineSize=0) {
    if (!data) return "";
    if (data instanceof ArrayBuffer) data = new Uint8Array(data);

    let output = "";
    const prepend = (delim === "0x" || delim === "\\x");

    for (let i = 0; i < data.length; i++) {
        const hex = data[i].toString(16).padStart(padding, "0");
        if (prepend) {
            output += delim + hex;
        } else {
            output += hex + delim;
        }
        if (extraDelim) {
            output += extraDelim;
        }
        // Add LF after each lineSize amount of bytes but not at the end
        if ((i !== data.length - 1) && ((i + 1) % lineSize === 0)) {
            output += "\n";
        }
    }

    // Remove the extraDelim at the end (if there is);
    // and remove the delim at the end, but if it's prepended there's nothing to remove
    const rTruncLen = extraDelim.length + (prepend ? 0 : delim.length);
    if (rTruncLen) {
        // If rTruncLen === 0 then output.slice(0,0) will be returned, which is nothing
        return output.slice(0, -rTruncLen);
    } else {
        return output;
    }
}


/**
 * Convert a byte array into a hex string as efficiently as possible with no options.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer} data
 * @returns {string}
 *
 * @example
 * // returns "0a141e"
 * toHex([10,20,30]);
 */
export function toHexFast(data) {
    if (!data) return "";
    if (data instanceof ArrayBuffer) data = new Uint8Array(data);

    const output = [];

    for (let i = 0; i < data.length; i++) {
        output.push((data[i] >>> 4).toString(16));
        output.push((data[i] & 0x0f).toString(16));
    }

    return output.join("");
}


/**
 * Convert a hex string into a byte array.
 *
 * @param {string} data
 * @param {string} [delim]
 * @param {number} [byteLen=2]
 * @returns {byteArray}
 *
 * @example
 * // returns [10,20,30]
 * fromHex("0a 14 1e");
 *
 * // returns [10,20,30]
 * fromHex("0a:14:1e", "Colon");
 */
export function fromHex(data, delim="Auto", byteLen=2) {
    if (delim !== "None") {
        const delimRegex = delim === "Auto" ? /[^a-f\d]|(0x)/gi : Utils.regexRep(delim);
        data = data.replace(delimRegex, "");
    }

    const output = [];
    for (let i = 0; i < data.length; i += byteLen) {
        output.push(parseInt(data.substr(i, byteLen), 16));
    }
    return output;
}


/**
 * To Hexadecimal delimiters.
 */
export const TO_HEX_DELIM_OPTIONS = ["Space", "Percent", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "0x", "\\x", "None"];


/**
 * From Hexadecimal delimiters.
 */
export const FROM_HEX_DELIM_OPTIONS = ["Auto"].concat(TO_HEX_DELIM_OPTIONS);
