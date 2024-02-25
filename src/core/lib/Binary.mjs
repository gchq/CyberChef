/**
 * Binary functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Convert a byte array into a binary string.
 *
 * @param {Uint8Array|byteArray|number} data
 * @param {string} [delim="Space"]
 * @param {number} [padding=8]
 * @returns {string}
 *
 * @example
 * // returns "00001010 00010100 00011110"
 * toBinary([10,20,30]);
 *
 * // returns "00001010:00010100:00011110"
 * toBinary([10,20,30], "Colon");
 *
 * // returns "1010:10100:11110"
 * toBinary([10,20,30], "Colon", 0);
 */
export function toBinary(data, delim = "Space", padding = 8) {
    if (data === undefined || data === null)
        throw new OperationError("Unable to convert to binary: Empty input data enocuntered");

    delim = Utils.charRep(delim);
    let output = "";

    if (data.length) {
        // array
        for (let i = 0; i < data.length; i++) {
            output += data[i].toString(2).padStart(padding, "0");
            if (i !== data.length - 1) output += delim;
        }
    } else if (typeof data === "number") {
        // Single value
        return data.toString(2).padStart(padding, "0");
    } else {
        return "";
    }
    return output;
}

/**
 * Convert a binary string into a byte array.
 *
 * @param {string} data
 * @param {string} [delim]
 * @param {number} [byteLen=8]
 * @returns {byteArray}
 *
 * @example
 * // returns [10,20,30]
 * fromBinary("00001010 00010100 00011110");
 *
 * // returns [10,20,30]
 * fromBinary("00001010:00010100:00011110", "Colon");
 */
export function fromBinary(data, delim = "Space", byteLen = 8) {
    if (byteLen < 1 || Math.round(byteLen) !== byteLen)
        throw new OperationError("Byte length must be a positive integer");

    const delimRegex = Utils.regexRep(delim);
    data = data.replace(delimRegex, "");

    const output = [];
    for (let i = 0; i < data.length; i += byteLen) {
        output.push(parseInt(data.substr(i, byteLen), 2));
    }
    return output;
}
