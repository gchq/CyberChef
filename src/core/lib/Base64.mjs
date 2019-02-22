/**
 * Base64 functions.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils";


/**
 * Base64's the input byte array using the given alphabet, returning a string.
 *
 * @param {byteArray|Uint8Array|string} data
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
        data = Utils.strToByteArray(data);
    }

    alphabet = Utils.expandAlphRange(alphabet).join("");

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
 * @param {byteArray} data
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
export function fromBase64(data, alphabet="A-Za-z0-9+/=", returnType="string", removeNonAlphChars=true) {
    if (!data) {
        return returnType === "string" ? "" : [];
    }

    alphabet = alphabet || "A-Za-z0-9+/=";
    alphabet = Utils.expandAlphRange(alphabet).join("");

    const output = [];
    let chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;

    if (removeNonAlphChars) {
        const re = new RegExp("[^" + alphabet.replace(/[[\]\\\-^$]/g, "\\$&") + "]", "g");
        data = data.replace(re, "");
    }

    while (i < data.length) {
        enc1 = alphabet.indexOf(data.charAt(i++));
        enc2 = alphabet.indexOf(data.charAt(i++) || "=");
        enc3 = alphabet.indexOf(data.charAt(i++) || "=");
        enc4 = alphabet.indexOf(data.charAt(i++) || "=");

        enc2 = enc2 === -1 ? 64 : enc2;
        enc3 = enc3 === -1 ? 64 : enc3;
        enc4 = enc4 === -1 ? 64 : enc4;

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output.push(chr1);

        if (enc3 !== 64) {
            output.push(chr2);
        }
        if (enc4 !== 64) {
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
];
