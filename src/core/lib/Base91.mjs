/**
 * Base91 resources.
 *
 * @author idevlab [idevlab@outlook.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Base91 alphabet options.
 */
export const ALPHABET_OPTIONS = [
    {
        name: "Standard",
        value: "A-Za-z0-9!#$%&()*+,./:;<=>?@[]^_`{|}~&quot;",
    }
];

/**
 * Base91's the input byte array using the given alphabet, returning a string.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer|string} data
 * @param {string} alphabet
 * @returns {string}
 *
 */
export function toBase91(data, alphabet) {
    if (!data) return "";
    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    }
    if (typeof data == "string") {
        data = Utils.strToByteArray(data);
    }

    alphabet = Utils.expandAlphRange(alphabet).join("");
    if (alphabet.length !== 91 && alphabet.length !== 92) { // Allow for padding
        throw new OperationError(`Invalid Base91 alphabet length (${alphabet.length}): ${alphabet}`);
    }

    if (data == null) {
        throw new OperationError("base91: Missing data to encode.");
    }
    const raw = Buffer.isBuffer(data) ? data : typeof data === "number" ? Buffer.from(data.toString()) : Buffer.from(data);
    let ret = "";

    let n = 0;
    let b = 0;

    for (let i = 0; i < raw.length; i++) {
        b |= raw[i] << n;
        n += 8;

        if (n > 13) {
            let v = b & 8191;
            if (v > 88) {
                b >>= 13;
                n -= 13;
            } else {
                v = b & 16383;
                b >>= 14;
                n -= 14;
            }
            ret += alphabet[v % 91] + alphabet[v / 91 | 0];
        }
    }

    if (n) {
        ret += alphabet[b % 91];
        if (n > 7 || b > 90) ret += alphabet[b / 91 | 0];
    }
    return ret;
}


/**
 * UnBase91's the input string using the given alphabet, returning a byte array.
 *
 * @param {string} data
 * @param {string} alphabet
 * @param {string} [returnType="string"] - Either "string" or "byteArray"
 * @returns {byteArray}
 */
export function fromBase91(data, alphabet, returnType) {

    if (!data) {
        return returnType === "string" ? "" : [];
    }

    alphabet = alphabet || "A-Za-z0-9+/=";
    alphabet = Utils.expandAlphRange(alphabet).join("");
    if (alphabet.length !== 91 && alphabet.length !== 92)  // Allow for padding
        throw new OperationError(`Invalid Base91 alphabet length (${alphabet.length}): ${alphabet}`);

    const raw = "" + (data || "");

    let b = 0;
    let n = 0;
    let v = -1;
    const output = [];
    for (let i = 0; i < raw.length; i++) {
        const p = alphabet.indexOf(raw[i]);
        if (p === -1) continue;
        if (v < 0) {
            v = p;
        } else {
            v += p * 91;
            b |= v << n;
            n += (v & 8191) > 88 ? 13 : 14;
            do {
                output.push(b & 0xff);
                b >>= 8;
                n -= 8;
            } while (n > 7);
            v = -1;
        }
    }

    if (v > -1)
        output.push((b | v << n) & 0xff);

    return returnType === "string" ? Utils.byteArrayToUtf8(output) : output;
}
