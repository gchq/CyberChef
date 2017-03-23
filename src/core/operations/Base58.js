var Utils = require("../Utils.js");


/**
 * Base58 operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
var Base58 = module.exports = {

    /**
     * @constant
     * @default
     */
    ALPHABET_OPTIONS: [
        {
            name: "Bitcoin",
            value: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
        },
        {
            name: "Ripple",
            value: "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz",
        },
    ],
    /**
     * @constant
     * @default
     */
    REMOVE_NON_ALPH_CHARS: true,

    /**
     * To Base58 operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo: function(input, args) {
        var alphabet = args[0] || Base58.ALPHABET_OPTIONS[0].value,
            result = [0];

        alphabet = Utils.expandAlphRange(alphabet).join("");

        if (alphabet.length !== 58 ||
            [].unique.call(alphabet).length !== 58) {
            throw ("Error: alphabet must be of length 58");
        }

        if (input.length === 0) return "";

        input.forEach(function(b) {
            var carry = (result[0] << 8) + b;
            result[0] = carry % 58;
            carry = (carry / 58) | 0;

            for (var i = 1; i < result.length; i++) {
                carry += result[i] << 8;
                result[i] = carry % 58;
                carry = (carry / 58) | 0;
            }

            while (carry > 0) {
                result.push(carry % 58);
                carry = (carry / 58) | 0;
            }
        });

        result = result.map(function(b) {
            return alphabet[b];
        }).reverse().join("");

        while (result.length < input.length) {
            result = alphabet[0] + result;
        }

        return result;
    },


    /**
     * From Base58 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFrom: function(input, args) {
        var alphabet = args[0] || Base58.ALPHABET_OPTIONS[0].value,
            removeNonAlphaChars = args[1] === undefined ? true : args[1],
            result = [0];

        alphabet = Utils.expandAlphRange(alphabet).join("");

        if (alphabet.length !== 58 ||
            [].unique.call(alphabet).length !== 58) {
            throw ("Alphabet must be of length 58");
        }

        if (input.length === 0) return [];

        [].forEach.call(input, function(c, charIndex) {
            var index = alphabet.indexOf(c);

            if (index === -1) {
                if (removeNonAlphaChars) {
                    return;
                } else {
                    throw ("Char '" + c + "' at position " + charIndex + " not in alphabet");
                }
            }

            var carry = result[0] * 58 + index;
            result[0] = carry & 0xFF;
            carry = carry >> 8;

            for (var i = 1; i < result.length; i++) {
                carry += result[i] * 58;
                result[i] = carry & 0xFF;
                carry = carry >> 8;
            }

            while (carry > 0) {
                result.push(carry & 0xFF);
                carry = carry >> 8;
            }
        });

        return result.reverse();
    },

};
