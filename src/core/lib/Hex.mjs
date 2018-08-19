/**
 * Hexadecimal functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils";


/**
 * Convert a byte array into a hex string.
 *
 * @param {Uint8Array|byteArray} data
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
 */
export function toHex(data, delim=" ", padding=2) {
    if (!data) return "";

    let output = "";

    for (let i = 0; i < data.length; i++) {
        output += data[i].toString(16).padStart(padding, "0") + delim;
    }

    // Add \x or 0x to beginning
    if (delim === "0x") output = "0x" + output;
    if (delim === "\\x") output = "\\x" + output;

    if (delim.length)
        return output.slice(0, -delim.length);
    else
        return output;
}


/**
 * Convert a byte array into a hex string as efficiently as possible with no options.
 *
 * @param {byteArray} data
 * @returns {string}
 *
 * @example
 * // returns "0a141e"
 * toHex([10,20,30]);
 */
export function toHexFast(data) {
    if (!data) return "";

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
        const delimRegex = delim === "Auto" ? /[^a-f\d]/gi : Utils.regexRep(delim);
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
export const TO_HEX_DELIM_OPTIONS = ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "0x", "\\x", "None"];


/**
 * From Hexadecimal delimiters.
 */
export const FROM_HEX_DELIM_OPTIONS = ["Auto"].concat(TO_HEX_DELIM_OPTIONS);
