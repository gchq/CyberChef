/**
 * Decimal functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";


/**
 * Convert a string of decimal values into a byte array.
 *
 * @param {string} data
 * @param {string} [delim]
 * @returns {byteArray}
 *
 * @example
 * // returns [10,20,30]
 * fromDecimal("10 20 30");
 *
 * // returns [10,20,30]
 * fromDecimal("10:20:30", "Colon");
 */
export function fromDecimal(data, delim="Auto") {
    delim = Utils.charRep(delim);
    const output = [];
    let byteStr = data.split(delim);
    if (byteStr[byteStr.length-1] === "")
        byteStr = byteStr.slice(0, byteStr.length-1);

    for (let i = 0; i < byteStr.length; i++) {
        output[i] = parseInt(byteStr[i], 10);
    }
    return output;
}
