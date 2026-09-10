/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Encode the 16 network-order bytes of a ULID, including two leading zero bits.
 * @param {byteArray} bytes
 * @returns {string}
 */
export function encodeULID(bytes) {
    if (bytes.length !== 16) {
        throw new OperationError("ULID encoding requires exactly 16 bytes.");
    }
    let result = "",
        buffer = 0,
        bits = 2;
    for (const byte of bytes) {
        buffer = (buffer << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            bits -= 5;
            result += ALPHABET[(buffer >>> bits) & 31];
        }
        buffer &= (1 << bits) - 1;
    }
    return result;
}

/**
 * Decode a canonical ULID. Reject the two unused high bits instead of truncating.
 * @param {string} input
 * @returns {byteArray}
 */
export function decodeULID(input) {
    const text = input.trim();
    if (!/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(text)) {
        throw new OperationError("Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).");
    }
    const bytes = [];
    let buffer = ALPHABET.indexOf(text[0]),
        bits = 3;
    for (let i = 1; i < text.length; i++) {
        buffer = (buffer << 5) | ALPHABET.indexOf(text[i].toUpperCase());
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >>> bits) & 255);
            buffer &= (1 << bits) - 1;
        }
    }
    return bytes;
}
