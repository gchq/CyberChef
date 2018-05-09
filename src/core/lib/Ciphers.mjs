/**
 * Cipher functions.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 */

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
        return "The values of a and b can only be integers.";
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
