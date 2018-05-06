import Utils from "../Utils.js";


/**
 * Base85 operations.
 *
 * @author George J [george@penguingeorge.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 * @namespace
 */
const Base85 = {

    /**
     * @constant
     * @default
     */
    ALPHABET_OPTIONS: [
        {
            name: "Standard",
            value: "!\"#$%&&apos;()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu",
        },
        {
            name: "Z85 (ZeroMQ)",
            value: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#",
        },
        {
            name: "IPv6",
            value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|~}",
        },
    ],

    /**
     * Includes a '<~' and '~>' at the beginning and end of the Base85 data.
     * @constant
     * @default
     */
    INCLUDE_DELIMETER: false,

    /**
     * To Base85 operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo: function(input, args) {
        let alphabet = args[0] || Base85.ALPHABET_OPTIONS[0].value,
            encoding = Base85._alphabetName(alphabet),
            result = "";

        alphabet = Utils.expandAlphRange(alphabet).join("");

        let block;
        for (let i = 0; i < input.length; i += 4) {
            block = (
                ((input[i])          << 24) +
                ((input[i + 1] || 0) << 16) +
                ((input[i + 2] || 0) << 8)  +
                ((input[i + 3] || 0))
            ) >>> 0;

            if (block > 0) {
                let digits = [];
                for (let j = 0; j < 5; j++) {
                    digits.push(block % 85);
                    block = Math.floor(block / 85);
                }

                digits = digits.reverse();

                if (input.length < i + 4) {
                    digits.splice(input.length - (i + 4), 4);
                }

                result += digits.map(digit => alphabet[digit]).join("");
            } else {
                if (encoding === "Standard") result += "z";
            }
        }

        if (args[1] || Base85.INCLUDE_DELIMETER) result = "<~" + result + "~>";

        return result;
    },


    /**
     * From Base85 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runFrom: function(input, args) {
        let alphabet = args[0] || Base85.ALPHABET_OPTIONS[0].value,
            encoding = Base85._alphabetName(alphabet),
            result = [];

        let matches = input.match(/<~(.+?)~>/);
        if (matches !== null) input = matches[1];

        alphabet = Utils.expandAlphRange(alphabet).join("");

        let i = 0;
        let digits, block, blockBytes;
        while (i < input.length) {
            if (encoding === "Standard" && input[i] === "z") {
                result.push(0, 0, 0, 0);
                i++;
            } else {
                digits = input
                    .substr(i, 5)
                    .split("")
                    .map((chr, idx) => {
                        let digit = alphabet.indexOf(chr);
                        if (digit < 0 || digit > 84) {
                            throw "Invalid character '" + chr + "' at index " + idx;
                        }
                        return digit;
                    });

                block =
                    digits[0] * 52200625 +
                    digits[1] * 614125 +
                    (i + 2 < input.length ? digits[2] : 84) * 7225 +
                    (i + 3 < input.length ? digits[3] : 84) * 85 +
                    (i + 4 < input.length ? digits[4] : 84);

                blockBytes = [
                    (block >> 24) & 0xff,
                    (block >> 16) & 0xff,
                    (block >> 8) & 0xff,
                    block & 0xff
                ];

                if (input.length < i + 5) {
                    blockBytes.splice(input.length - (i + 5), 5);
                }

                result.push.apply(result, blockBytes);
                i += 5;
            }
        }
        return result;
    },

    /**
     * Returns the name of the alphabet, when given the alphabet.
     */
    _alphabetName: function(alphabet) {
        alphabet = alphabet.replace("'", "&apos;");
        let name;
        Base85.ALPHABET_OPTIONS.forEach(function(a) {
            if (escape(alphabet) === escape(a.value)) name = a.name;
        });
        return name;
    }

};

export default Base85;
