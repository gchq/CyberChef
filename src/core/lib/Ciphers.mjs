/**
 * Cipher functions.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 * @author Evie H [evie@evie.sh]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */

import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import CryptoJS from "crypto-js";
import { fromHex, toHexFast } from "./Hex.mjs";

/**
 * Affine Cipher Encode operation.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @param {string} input
 * @param {Object[]} args
 * @returns {string}
 */
export function affineEncode(input, args) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz",
        a = args[0],
        b = args[1];
    let output = "";

    if (!/^\+?(0|[1-9]\d*)$/.test(a) || !/^\+?(0|[1-9]\d*)$/.test(b)) {
        throw new OperationError("The values of a and b can only be integers.");
    }

    if (Utils.gcd(a, 26) !== 1) {
        throw new OperationError("The value of `a` must be coprime to 26.");
    }

    for (let i = 0; i < input.length; i++) {
        if (alphabet.indexOf(input[i]) >= 0) {
            // Uses the affine function ax+b % m = y (where m is length of the alphabet)
            output += alphabet[((a * alphabet.indexOf(input[i])) + b) % 26];
        } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
            // Same as above, accounting for uppercase
            output += alphabet[((a * alphabet.indexOf(input[i].toLowerCase())) + b) % 26].toUpperCase();
        } else {
            // Non-alphabetic characters
            output += input[i];
        }
    }
    return output;
}

/**
 * Generates a polybius square for the given keyword
 *
 * @private
 * @author Matt C [matt@artemisbot.uk]
 * @param {string} keyword - Must be upper case
 * @returns {string}
 */
export function genPolybiusSquare (keyword) {
    const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ",
        polArray = `${keyword}${alpha}`.split("").unique(),
        polybius = [];

    for (let i = 0; i < 5; i++) {
        polybius[i] = polArray.slice(i*5, i*5 + 5);
    }

    return polybius;
}

/**
 * A mapping of string formats to their classes in the CryptoJS library.
 *
 * @private
 * @constant
 */
export const format = {
    "Hex":     CryptoJS.enc.Hex,
    "Base64":  CryptoJS.enc.Base64,
    "UTF8":    CryptoJS.enc.Utf8,
    "UTF16":   CryptoJS.enc.Utf16,
    "UTF16LE": CryptoJS.enc.Utf16LE,
    "UTF16BE": CryptoJS.enc.Utf16BE,
    "Latin1":  CryptoJS.enc.Latin1,
};


/**
 * Validates that a passphrase/key string contains only characters valid for the
 * given format. Recognised delimiters (spaces, commas, colons, 0x prefix, etc.)
 * are always permitted in Hex and Binary formats.
 * Throws an OperationError if genuinely invalid characters are found.
 *
 * @param {string} str
 * @param {string} type - One of "Hex", "Base64", "Binary", "UTF8", "Latin1", etc.
 * @throws {OperationError}
 */
function validateFormatInput(str, type) {
    if (!str) return;
    switch (type.toLowerCase()) {
        case "hex": {
            const stripped = str.replace(/0x|\\x|%|[\s,;:\n\r]/gi, "");
            const invalid = stripped.match(/[^0-9a-fA-F]/);
            if (invalid) throw new OperationError(
                `Invalid character '${invalid[0]}' in Hex input. ` +
                `Hex accepts 0-9, a-f, A-F, and delimiters (space, comma, colon, 0x prefix).`
            );
            break;
        }
        case "base64": {
            const invalid = str.replace(/[\s]/g, "").match(/[^A-Za-z0-9+/=]/);
            if (invalid) throw new OperationError(
                `Invalid character '${invalid[0]}' in Base64 input. ` +
                `Base64 accepts A-Z, a-z, 0-9, +, /, and = (padding).`
            );
            break;
        }
        case "binary": {
            const stripped = str.replace(/[\s,;:\n\r]/g, "");
            const invalid = stripped.match(/[^01]/);
            if (invalid) throw new OperationError(
                `Invalid character '${invalid[0]}' in Binary input. Binary accepts only 0 and 1.`
            );
            break;
        }
    }
}


/**
 * Parses a user-entered string in a given CryptoJS format, normalising common
 * hex delimiter conventions (commas, spaces, 0x prefix, etc.) before parsing.
 *
 * Use this instead of format[name].parse() for user-supplied passphrase/key inputs.
 *
 * @param {string} str
 * @param {string} formatName - Key into the format map (e.g. "Hex", "UTF8")
 * @returns {CryptoJS.lib.WordArray}
 */
export function parseFormatString(str, formatName) {
    validateFormatInput(str, formatName);
    if (formatName === "Hex") {
        return CryptoJS.enc.Hex.parse(toHexFast(fromHex(str)));
    }
    return format[formatName].parse(str);
}
