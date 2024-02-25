/**
 * Public key resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { toHex, fromHex } from "./Hex.mjs";

/**
 * Formats Distinguished Name (DN) objects to strings.
 *
 * @param {Object} dnObj
 * @param {number} indent
 * @returns {string}
 */
export function formatDnObj(dnObj, indent) {
    let output = "";

    const maxKeyLen = dnObj.array.reduce((max, item) => {
        return item[0].type.length > max ? item[0].type.length : max;
    }, 0);

    for (let i = 0; i < dnObj.array.length; i++) {
        if (!dnObj.array[i].length) continue;

        const key = dnObj.array[i][0].type;
        const value = dnObj.array[i][0].value;
        const str = `${key.padEnd(maxKeyLen, " ")} = ${value}\n`;

        output += str.padStart(indent + str.length, " ");
    }

    return output.slice(0, -1);
}


/**
 * Formats byte strings by adding line breaks and delimiters.
 *
 * @param {string} byteStr
 * @param {number} length - Line width
 * @param {number} indent
 * @returns {string}
 */
export function formatByteStr(byteStr, length, indent) {
    byteStr = toHex(fromHex(byteStr), ":");
    length = length * 3;
    let output = "";

    for (let i = 0; i < byteStr.length; i += length) {
        const str = byteStr.slice(i, i + length) + "\n";
        if (i === 0) {
            output += str;
        } else {
            output += str.padStart(indent + str.length, " ");
        }
    }

    return output.slice(0, output.length-1);
}
