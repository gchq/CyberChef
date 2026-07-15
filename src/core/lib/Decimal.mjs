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
   const output = [];
    let byteStr = [];
    
    // 1. Handle the "Auto" delimiter using CyberChef's built-in guesser
    if (delim === "Auto") {
        const search = Utils.detectDelim(data);
        byteStr = data.split(search);
    } else {
        // 2. If it's a specific delimiter, use the original logic
        delim = Utils.charRep(delim);
        byteStr = data.split(delim);
    }

    if (byteStr[byteStr.length-1] === "")
        byteStr = byteStr.slice(0, byteStr.length-1);

    for (let i = 0; i < byteStr.length; i++) {
        output[i] = parseInt(byteStr[i], 10);
    }
    return output;
}
    