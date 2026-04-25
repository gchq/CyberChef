/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { toHexFast } from "./Hex.mjs";

/**
 * Parses hex into bytes.
 *
 * @param {string} input
 * @param {string} name
 * @param {number[]} [allowedLengths]
 * @returns {Uint8Array}
 */
function parseHexBytes(input, name, allowedLengths=[]) {
    const normalized = (input || "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length % 2 !== 0) {
        throw new OperationError(`${name} must be hex.`);
    }

    const out = new Uint8Array(normalized.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(normalized.substring(i * 2, i * 2 + 2), 16);
    }

    if (allowedLengths.length && !allowedLengths.includes(out.length)) {
        throw new OperationError(`${name} must be ${allowedLengths.join(" or ")} bytes.`);
    }

    return out;
}


/**
 * Converts bytes to uppercase hex.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
    return toHexFast(bytes).toUpperCase();
}


/**
 * Converts bytes to a forge-compatible byte string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toByteString(bytes) {
    return Array.from(bytes, byte => String.fromCharCode(byte)).join("");
}


/**
 * Converts hex to an ArrayBuffer.
 *
 * @param {string} input
 * @param {string} name
 * @returns {ArrayBuffer}
 */
function parseHexBuffer(input, name) {
    const bytes = parseHexBytes(input, name);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}


export {
    bytesToHex,
    parseHexBuffer,
    parseHexBytes,
    toByteString,
};
