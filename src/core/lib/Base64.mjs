/**
 * Base64 functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Base64's the input byte array using the given alphabet, returning a string.
 *
 * @param {byteArray|Uint8Array|ArrayBuffer|string} data
 * @param {string} [alphabet="A-Za-z0-9+/="]
 * @returns {string}
 *
 * @example
 * // returns "SGVsbG8="
 * toBase64([72, 101, 108, 108, 111]);
 *
 * // returns "SGVsbG8="
 * toBase64("Hello");
 */
export function toBase64(data, alphabet="A-Za-z0-9+/=") {
    if (!data) return "";
    if (typeof data == "string") {
        data = Utils.strToArrayBuffer(data);
    }
    if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    }

    alphabet = Utils.expandAlphRange(alphabet).join("");
    if (alphabet.length !== 64 && alphabet.length !== 65) { // Allow for padding
        throw new OperationError(`Invalid Base64 alphabet length (${alphabet.length}): ${alphabet}`);
    }

    let output = "",
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;

    while (i < data.length) {
        chr1 = data[i++];
        chr2 = data[i++];
        chr3 = data[i++];

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output += alphabet.charAt(enc1) + alphabet.charAt(enc2) +
            alphabet.charAt(enc3) + alphabet.charAt(enc4);
    }

    return output;
}


/**
 * UnBase64's the input string using the given alphabet, returning a byte array.
 *
 * @param {string} data
 * @param {string} [alphabet="A-Za-z0-9+/="]
 * @param {string} [returnType="string"] - Either "string" or "byteArray"
 * @param {boolean} [removeNonAlphChars=true]
 * @returns {byteArray}
 *
 * @example
 * // returns "Hello"
 * fromBase64("SGVsbG8=");
 *
 * // returns [72, 101, 108, 108, 111]
 * fromBase64("SGVsbG8=", null, "byteArray");
 */
export function fromBase64(data, alphabet="A-Za-z0-9+/=", returnType="string", removeNonAlphChars=true, strictMode=false) {
    if (!data) {
        return returnType === "string" ? "" : [];
    }

    alphabet = alphabet || "A-Za-z0-9+/=";
    alphabet = Utils.expandAlphRange(alphabet).join("");

    // Confirm alphabet is a valid length
    if (alphabet.length !== 64 && alphabet.length !== 65) { // Allow for padding
        throw new OperationError(`Error: Base64 alphabet should be 64 characters long, or 65 with a padding character. Found ${alphabet.length}: ${alphabet}`);
    }

    // Remove non-alphabet characters
    if (removeNonAlphChars) {
        const re = new RegExp("[^" + alphabet.replace(/[[\]\\\-^$]/g, "\\$&") + "]", "g");
        data = data.replace(re, "");
    }

    if (strictMode) {
        // Check for incorrect lengths (even without padding)
        if (data.length % 4 === 1) {
            throw new OperationError(`Error: Invalid Base64 input length (${data.length}). Cannot be 4n+1, even without padding chars.`);
        }

        if (alphabet.length === 65) { // Padding character included
            const pad = alphabet.charAt(64);
            const padPos = data.indexOf(pad);
            if (padPos >= 0) {
                // Check that the padding character is only used at the end and maximum of twice
                if (padPos < data.length - 2 || data.charAt(data.length - 1) !== pad) {
                    throw new OperationError(`Error: Base64 padding character (${pad}) not used in the correct place.`);
                }

                // Check that input is padded to the correct length
                if (data.length % 4 !== 0) {
                    throw new OperationError("Error: Base64 not padded to a multiple of 4.");
                }
            }
        }
    }

    const output = [];
    let chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;

    while (i < data.length) {
        // Including `|| null` forces empty strings to null so that indexOf returns -1 instead of 0
        enc1 = alphabet.indexOf(data.charAt(i++) || null);
        enc2 = alphabet.indexOf(data.charAt(i++) || null);
        enc3 = alphabet.indexOf(data.charAt(i++) || null);
        enc4 = alphabet.indexOf(data.charAt(i++) || null);

        if (strictMode && (enc1 < 0 || enc2 < 0 || enc3 < 0 || enc4 < 0)) {
            throw new OperationError("Error: Base64 input contains non-alphabet char(s)");
        }

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        if (chr1 >= 0 && chr1 < 256) {
            output.push(chr1);
        }
        if (chr2 >= 0 && chr2 < 256 && enc3 !== 64) {
            output.push(chr2);
        }
        if (chr3 >= 0 && chr3 < 256 && enc4 !== 64) {
            output.push(chr3);
        }
    }

    return returnType === "string" ? Utils.byteArrayToUtf8(output) : output;
}


/**
 * Base64 alphabets.
 */
export const ALPHABET_OPTIONS = [
    {name: "Standard (RFC 4648): A-Za-z0-9+/=", value: "A-Za-z0-9+/="},
    {name: "URL safe (RFC 4648 \u00A75): A-Za-z0-9-_", value: "A-Za-z0-9-_"},
    {name: "Filename safe: A-Za-z0-9+-=", value: "A-Za-z0-9+\\-="},
    {name: "itoa64: ./0-9A-Za-z=", value: "./0-9A-Za-z="},
    {name: "XML: A-Za-z0-9_.", value: "A-Za-z0-9_."},
    {name: "y64: A-Za-z0-9._-", value: "A-Za-z0-9._-"},
    {name: "z64: 0-9a-zA-Z+/=", value: "0-9a-zA-Z+/="},
    {name: "Radix-64 (RFC 4880): 0-9A-Za-z+/=", value: "0-9A-Za-z+/="},
    {name: "Uuencoding: [space]-_", value: " -_"},
    {name: "Xxencoding: +-0-9A-Za-z", value: "+\\-0-9A-Za-z"},
    {name: "BinHex: !-,-0-689@A-NP-VX-Z[`a-fh-mp-r", value: "!-,-0-689@A-NP-VX-Z[`a-fh-mp-r"},
    {name: "ROT13: N-ZA-Mn-za-m0-9+/=", value: "N-ZA-Mn-za-m0-9+/="},
    {name: "UNIX crypt: ./0-9A-Za-z", value: "./0-9A-Za-z"},
    {name: "Atom128: /128GhIoPQROSTeUbADfgHijKLM+n0pFWXY456xyzB7=39VaqrstJklmNuZvwcdEC", value: "/128GhIoPQROSTeUbADfgHijKLM+n0pFWXY456xyzB7=39VaqrstJklmNuZvwcdEC"},
    {name: "Megan35: 3GHIJKLMNOPQRSTUb=cdefghijklmnopWXYZ/12+406789VaqrstuvwxyzABCDEF5", value: "3GHIJKLMNOPQRSTUb=cdefghijklmnopWXYZ/12+406789VaqrstuvwxyzABCDEF5"},
    {name: "Zong22: ZKj9n+yf0wDVX1s/5YbdxSo=ILaUpPBCHg8uvNO4klm6iJGhQ7eFrWczAMEq3RTt2", value: "ZKj9n+yf0wDVX1s/5YbdxSo=ILaUpPBCHg8uvNO4klm6iJGhQ7eFrWczAMEq3RTt2"},
    {name: "Hazz15: HNO4klm6ij9n+J2hyf0gzA8uvwDEq3X1Q7ZKeFrWcVTts/MRGYbdxSo=ILaUpPBC5", value: "HNO4klm6ij9n+J2hyf0gzA8uvwDEq3X1Q7ZKeFrWcVTts/MRGYbdxSo=ILaUpPBC5"}
];
