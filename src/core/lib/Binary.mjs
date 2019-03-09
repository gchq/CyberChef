/**
 * Binary functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils";


/**
 * Convert a byte array into a binary string.
 *
 * @param {Uint8Array|byteArray} data
 * @param {string} [delim="Space"]
 * @param {number} [padding=8]
 * @returns {string}
 *
 * @example
 * // returns "00010000 00100000 00110000"
 * toBinary([10,20,30]);
 *
 * // returns "00010000 00100000 00110000"
 * toBinary([10,20,30], ":");
 */
export function toBinary(data, delim="Space", padding=8) {
    if (!data) return "";

    delim = Utils.charRep(delim);
    let output = "";

    for (let i = 0; i < data.length; i++) {
        output += data[i].toString(2).padStart(padding, "0") + delim;
    }

    if (delim.length) {
        return output.slice(0, -delim.length);
    } else {
        return output;
    }
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
 * fromBinary("00010000 00100000 00110000");
 *
 * // returns [10,20,30]
 * fromBinary("00010000:00100000:00110000", "Colon");
 */
export function fromBinary(data, delim="Space", byteLen=8) {
    const delimRegex = Utils.regexRep(delim);
    data = data.replace(delimRegex, "");

    const output = [];
    for (let i = 0; i < data.length; i += byteLen) {
        output.push(parseInt(data.substr(i, byteLen), 2));
    }
    return output;
}

