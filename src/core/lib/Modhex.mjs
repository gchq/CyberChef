/**
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromHex, toHex } from "./Hex.mjs";

/**
 * Modhex alphabet.
 */
const MODHEX_ALPHABET = "cbdefghijklnrtuv";


/**
 * Modhex alphabet map.
 */
const MODHEX_ALPHABET_MAP = MODHEX_ALPHABET.split("");


/**
 * Hex alphabet to substitute Modhex.
 */
const HEX_ALPHABET = "0123456789abcdef";


/**
 * Hex alphabet map to substitute Modhex.
 */
const HEX_ALPHABET_MAP = HEX_ALPHABET.split("");


/**
 * Convert a byte array into a modhex string.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer} data
 * @param {string} [delim=" "]
 * @param {number} [padding=2]
 * @returns {string}
 *
 * @example
 * // returns "cl bf bu"
 * toModhex([10,20,30]);
 *
 * // returns "cl:bf:bu"
 * toModhex([10,20,30], ":");
 */
export function toModhex(data, delim=" ", padding=2, extraDelim="", lineSize=0) {
    if (!data) return "";
    if (data instanceof ArrayBuffer) data = new Uint8Array(data);

    const regularHexString = toHex(data, "", padding, "", 0);

    let modhexString = "";
    for (const letter of regularHexString.split("")) {
        modhexString += MODHEX_ALPHABET_MAP[HEX_ALPHABET_MAP.indexOf(letter)];
    }

    let output = "";
    const groupingRegexp = new RegExp(`.{1,${padding}}`, "g");
    const groupedModhex = modhexString.match(groupingRegexp);

    for (let i = 0; i < groupedModhex.length; i++) {
        const group = groupedModhex[i];
        output += group + delim;

        if (extraDelim) {
            output += extraDelim;
        }
        // Add LF after each lineSize amount of bytes but not at the end
        if ((i !== groupedModhex.length - 1) && ((i + 1) % lineSize === 0)) {
            output += "\n";
        }
    }

    // Remove the extraDelim at the end (if there is one)
    // and remove the delim at the end, but if it's prepended there's nothing to remove
    const rTruncLen = extraDelim.length + delim.length;
    if (rTruncLen) {
        // If rTruncLen === 0 then output.slice(0,0) will be returned, which is nothing
        return output.slice(0, -rTruncLen);
    } else {
        return output;
    }
}


/**
 * Convert a byte array into a modhex string as efficiently as possible with no options.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer} data
 * @returns {string}
 *
 * @example
 * // returns "clbfbu"
 * toModhexFast([10,20,30]);
 */
export function toModhexFast(data) {
    if (!data) return "";
    if (data instanceof ArrayBuffer) data = new Uint8Array(data);

    const output = [];

    for (let i = 0; i < data.length; i++) {
        output.push(MODHEX_ALPHABET_MAP[(data[i] >> 4) & 0xf]);
        output.push(MODHEX_ALPHABET_MAP[data[i] & 0xf]);
    }
    return output.join("");
}


/**
 * Convert a modhex string into a byte array.
 *
 * @param {string} data
 * @param {string} [delim]
 * @param {number} [byteLen=2]
 * @returns {byteArray}
 *
 * @example
 * // returns [10,20,30]
 * fromModhex("cl bf bu");
 *
 * // returns [10,20,30]
 * fromModhex("cl:bf:bu", "Colon");
 */
export function fromModhex(data, delim="Auto", byteLen=2) {
    if (byteLen < 1 || Math.round(byteLen) !== byteLen)
        throw new OperationError("Byte length must be a positive integer");

    // The `.replace(/\s/g, "")` an interesting workaround: Hex "multiline" tests aren't actually
    // multiline. Tests for Modhex fixes that, thus exposing the issue.
    data = data.toLowerCase().replace(/\s/g, "");

    if (delim !== "None") {
        const delimRegex = delim === "Auto" ? /[^cbdefghijklnrtuv]/gi : Utils.regexRep(delim);
        data = data.split(delimRegex);
    } else {
        data = [data];
    }

    let regularHexString = "";
    for (let i = 0; i < data.length; i++) {
        for (const letter of data[i].split("")) {
            regularHexString += HEX_ALPHABET_MAP[MODHEX_ALPHABET_MAP.indexOf(letter)];
        }
    }

    const output = fromHex(regularHexString, "None", byteLen);
    return output;
}


/**
 * To Modhex delimiters.
 */
export const TO_MODHEX_DELIM_OPTIONS = ["Space", "Percent", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "None"];


/**
 * From Modhex delimiters.
 */
export const FROM_MODHEX_DELIM_OPTIONS = ["Auto"].concat(TO_MODHEX_DELIM_OPTIONS);
