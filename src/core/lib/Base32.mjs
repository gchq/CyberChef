// import Utils from "../Utils.mjs";

import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Base32 resources.
 *
 * @author Peter C-S [petercs@purelymail.com]
 * @license Apache-2.0
 */

/**
 * Base32 alphabets.
 */
export const ALPHABET_OPTIONS = [
    {
        name: "Standard", // https://www.rfc-editor.org/rfc/rfc4648#section-6
        value: "A-Z2-7=",
    },
    {
        name: "Hex Extended", // https://www.rfc-editor.org/rfc/rfc4648#section-7
        value: "0-9A-V=",
    },
];

/**
 * Decode the Base32 input string using the given alphabet, returning a byte array.
 * @param {*} data
 * @param {string} [alphabet="A-Z0-7="]
 * @param {*} [returnType="string"] - Either "string" or "byteArray"
 * @param {boolean} [removeNonAlphChars=true]
 * @returns {byteArray}
 *
 * @example
 * // returns "Hello"
 * fromBase32("JBSWY3DP")
 *
 * // returns [72, 101, 108, 108, 111]
 * fromBase32("JBSWY3DP", null, "byteArray")
 */
export function fromBase32(data, alphabet="A-Z0-7=", returnType="string", removeNonAlphChars=true, strictMode=false) {
    if (!data) {
        return returnType === "string" ? "" : [];
    }

    alphabet = alphabet || ALPHABET_OPTIONS[0].value;
    alphabet = Utils.expandAlphRange(alphabet).join("");

    // Confirm alphabet is a valid length
    if (alphabet.length !== 32 && alphabet.length !== 33) { // Allow for padding
        throw new OperationError(`Error: Base32 alphabet should be 32 characters long, or 33 with  a padding character. Found ${alphabet.length}: ${alphabet}`);
    }

    // Remove non-alphabet characters
    if (removeNonAlphChars) {
        const re = new RegExp("[^" + alphabet.replace(/[[\]\\\-^$]/g, "\\$&") + "]", "g");
        data = data.replace(re, "");
    }

    if (strictMode) {
        // Check for incorrect lengths (even without padding)
        if (data.length % 8 === 1) {
            throw new OperationError(`Error: Invalid Base32 input length (${data.length}). Cannot be 8n+1, even without padding chars.`);
        }

        if (alphabet.length === 33) { // Padding character included
            const pad = alphabet.charAt(32);
            const padPos = data.indexOf(pad);
            if (padPos >= 0) {
                // Check that the padding character is only used at the end and maximum of 6 times
                if (padPos < data.length - 6 || data.charAt(data.length - 1) !== pad) {
                    throw new OperationError(`Error: Base32 padding character (${pad}) not used in the correct place.`);
                }

                // Check that the input is padded to the correct length
                if (data.length % 8 !== 0) {
                    throw new OperationError("Error: Base32 not padded to a multiple of 8.");
                }
            }
        }
    }

    const output = [];

    let chr1, chr2, chr3, chr4, chr5,
        enc1, enc2, enc3, enc4, enc5,
        enc6, enc7, enc8, i = 0;

    while (i < data.length) {
        // Including `|| null` forces empty strings to null so that indexOf returns -1 instead of 0
        enc1 = alphabet.indexOf(data.charAt(i++));
        enc2 = alphabet.indexOf(data.charAt(i++) || null);
        enc3 = alphabet.indexOf(data.charAt(i++) || null);
        enc4 = alphabet.indexOf(data.charAt(i++) || null);
        enc5 = alphabet.indexOf(data.charAt(i++) || null);
        enc6 = alphabet.indexOf(data.charAt(i++) || null);
        enc7 = alphabet.indexOf(data.charAt(i++) || null);
        enc8 = alphabet.indexOf(data.charAt(i++) || null);

        if (strictMode && [enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8].some(enc => enc < 0)) {
            throw new OperationError("Error: Base32 input contains non-alphabet char(s)");
        }

        chr1 = (enc1 << 3) | (enc2 >> 2);
        chr2 = ((enc2 & 3) << 6) | (enc3 << 1) | (enc4 >> 4);
        chr3 = ((enc4 & 15) << 4) | (enc5 >> 1);
        chr4 = ((enc5 & 1) << 7) | (enc6 << 2) | (enc7 >> 3);
        chr5 = ((enc7 & 7) << 5) | enc8;

        if (chr1 >= 0 && chr1 < 256) output.push(chr1);
        if (((enc2 & 3) !== 0 || enc3 !== 32) && (chr2 >= 0 && chr2 < 256)) output.push(chr2);
        if (((enc4 & 15) !== 0 || enc5 !== 32) && (chr3 >= 0 && chr3 < 256)) output.push(chr3);
        if (((enc5 & 1) !== 0 || enc6 !== 32) && (chr4 >= 0 && chr4 < 256)) output.push(chr4);
        if (((enc7 & 7) !== 0 || enc8 !== 32) && (chr5 >= 0 && chr5 < 256)) output.push(chr5);
    }

    return returnType === "string" ? Utils.byteArrayToUtf8(output) : output;
}
