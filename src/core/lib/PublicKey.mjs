/**
 * Public key functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { toHex, fromHex } from "./Hex";

/**
 * Formats Distinguished Name (DN) strings.
 *
 * @param {string} dnStr
 * @param {number} indent
 * @returns {string}
 */
export function formatDnStr (dnStr, indent) {
    const fields = dnStr.substr(1).replace(/([^\\])\//g, "$1$1/").split(/[^\\]\//);
    let output = "",
        maxKeyLen = 0,
        key,
        value,
        i,
        str;

    for (i = 0; i < fields.length; i++) {
        if (!fields[i].length) continue;

        key = fields[i].split("=")[0];

        maxKeyLen = key.length > maxKeyLen ? key.length : maxKeyLen;
    }

    for (i = 0; i < fields.length; i++) {
        if (!fields[i].length) continue;

        key = fields[i].split("=")[0];
        value = fields[i].split("=")[1];
        str = key.padEnd(maxKeyLen, " ") + " = " + value + "\n";

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
export function formatByteStr (byteStr, length, indent) {
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
