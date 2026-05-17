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
 * Accepts either the legacy jsrsasign-style `{ array: [[{type, value}, ...], ...] }`
 * shape OR `@peculiar/x509`'s `JsonName` shape — an array of records keyed by
 * RDN short-name (`[{ CN: ["foo"], OU: ["bar"] }, ...]`).
 *
 * @param {Object|Array} dnObj
 * @param {number} indent
 * @returns {string}
 */
export function formatDnObj(dnObj, indent) {
    const rows = [];

    if (Array.isArray(dnObj)) {
        for (const rdn of dnObj) {
            for (const key of Object.keys(rdn)) {
                for (const value of rdn[key]) rows.push({ key, value });
            }
        }
    } else if (dnObj && Array.isArray(dnObj.array)) {
        for (const rdn of dnObj.array) {
            if (!rdn || !rdn.length) continue;
            rows.push({ key: rdn[0].type, value: rdn[0].value });
        }
    } else {
        return "";
    }

    if (rows.length === 0) return "";

    const maxKeyLen = rows.reduce((max, r) => Math.max(max, r.key.length), 0);
    const pad = " ".repeat(indent);

    return rows.map(({ key, value }) => `${pad}${key.padEnd(maxKeyLen, " ")} = ${value}`).join("\n");
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
