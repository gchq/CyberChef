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
 * Generates a mapping for the MultiTap
 *
 * @private
 * @author Necron3574 [kaustubhbm3574@gmail.com]
 * @param {int,string} toggle - 1 for encode , 2 for decode, space_delim
 * @returns {dict}
 */
export function getMultiTapMap (toggle,space_delim) {
    var mapping = {"A" :"2","B":"22","C":"222","D":"3","E":"33","F":"333","G":"4","H":"44","I":"444","J":"5","K":"55","L":"555","M":"6","N":"66","O":"666","P":"7","Q":"77","R":"777","S":"7777","T":"8","U":"88","V":"888","W":"9","X":"99","Y":"999","Z":"9999"," ":space_delim};
    if(toggle == 1)
        return mapping;
    else{
        var ret = {};
            for(var key in mapping){
                ret[mapping[key]] = key;
            }
        return ret;
    }
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
