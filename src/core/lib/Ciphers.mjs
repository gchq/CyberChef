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

/**
 * Affine Cipher Encode operation.
 *
 * @deprecated Use affineEcrypt instead.
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
 * Generic affine encrypt/decrypt operation.
 * Allows for an expanded alphabet.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {string} input
 * @param {number} a
 * @param {number} b
 * @param {string} alphabet
 * @param {function} affineFn
 * @returns {string}
 */
export function affineApplication(input, a, b, alphabet, affineFn) {
    alphabet = Utils.expandAlphRange(alphabet);
    let output = "";
    const modulus = alphabet.length;

    // If the alphabet contains letters of all the same case,
    // the assumption will be to match case.
    const hasLower = /[a-z]/.test(alphabet);
    const hasUpper = /[A-Z]/.test(alphabet);
    const matchCase = (hasLower && hasUpper) ? false : true;

    // If we are matching case, convert entire alphabet to lowercase.
    // This will simplify the encryption.
    if (matchCase) {
        for (let i = 0; i < alphabet.length; i++)
            alphabet[i] = alphabet[i].toLowerCase();
    }

    if (!/^\+?(0|[1-9]\d*)$/.test(a) || !/^\+?(0|[1-9]\d*)$/.test(b)) {
        throw new OperationError("The values of a and b can only be integers.");
    }

    if (Utils.gcd(a, modulus) !== 1) {
        throw new OperationError("The value of `a` (" + a + ") must be coprime to " + modulus + ".");
    }

    // Apply affine function to each character in the input
    for (let i = 0; i < input.length; i++) {
        let outChar = "";

        let inChar = input[i];
        if (matchCase && isUpperCase(inChar)) inChar = inChar.toLowerCase();

        const inVal = alphabet.indexOf(inChar);

        if (inVal >= 0) {
            outChar = alphabet[affineFn(inVal, a, b, modulus)];
            if (matchCase && isUpperCase(input[i])) outChar = outChar.toUpperCase();
        } else {
            outChar += input[i];
        }

        output += outChar;
    }
    return output;
}

/**
 * Apply the affine encryption function to p.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {integer} p - Plaintext value
 * @param {integer} a - Multiplier coefficient
 * @param {integer} b - Addition coefficient
 * @param {integer} m - Modulus
 * @returns {integer}
 */
const encryptFn = function(p, a, b, m) {
    return (a * p + b) % m;
};

/**
 * Apply the affine decryption function to c.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {integer} c - Ciphertext value
 * @param {integer} a - Multiplier coefficient
 * @param {integer} b - Addition coefficient
 * @param {integer} m - Modulus
 * @returns {integer}
 */
const decryptFn = function(c, a, b, m) {
    return ((c + b) * a) % m;
};

/**
 * Affine encrypt operation.
 * Allows for an expanded alphabet.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {string} input
 * @param {integer} a
 * @param {integer} b
 * @param {string} alphabet
 * @returns {string}
 */
export function affineEncrypt(input, a, b, alphabet="a-z") {
    return affineApplication(input, a, b, alphabet, encryptFn);
}

/**
 * Affine Cipher Decrypt operation using the coefficients that were used to encrypt.
 * The modular inverses will be calculated.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {string} input
 * @param {integer} a
 * @param {integer} b
 * @param {string} alphabet
 * @returns {string}
 */
export function affineDecrypt(input, a, b, alphabet="a-z") {
    const m = Utils.expandAlphRange(alphabet).length;
    if (Utils.gcd(a, m) !== 1)
        throw new OperationError("The value of `a` (" + a + ") must be coprime to " + m + ".");

    const aInv = Utils.modInv(a, m);
    const bInv = (m - b) % m;
    if (aInv === null || aInv === undefined)
        throw new OperationError("The value of `a` (" + a + ") must be coprime to " + m + ".");
    else return affineApplication(input, aInv, bInv, alphabet, decryptFn);
}

/**
 * Affine Cipher Decrypt operation using modular inverse coefficients
 * supplied by the user.
 *
 * @author Barry B [profbbrown@gmail.com]
 * @param {string} input
 * @param {number} a
 * @param {number} b
 * @param {string} alphabet
 * @returns {string}
 */
export function affineDecryptInverse(input, a, b, alphabet="a-z") {
    return affineApplication(input, a, b, alphabet, decryptFn);
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

export const AFFINE_ALPHABETS = [
    {name: "Letters, match case: a-z", value: "a-z"},
    {name: "Letters, case sensitive: A-Za-z", value: "A-Za-z"},
    {name: "Word characters: A-Za-z0-9_", value: "A-Za-z0-9_"},
    {name: "Printable ASCII: space-~", value: "\\u0020-~"}
];

/**
 * Returns true if the given character is uppercase
 *
 * @private
 * @author Barry B [profbbrown@gmail.com]
 * @param {string} c - A character
 * @returns {boolean}
 */
function isUpperCase(c) {
    return c.toUpperCase() === c;
}
