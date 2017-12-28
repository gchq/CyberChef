import Utils from "../Utils.js";


/**
 * Binary-Coded Decimal operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const BCD = {

    /**
     * @constant
     * @default
     */
    ENCODING_SCHEME: [
        "8 4 2 1",
        "7 4 2 1",
        "4 2 2 1",
        "2 4 2 1",
        "8 4 -2 -1",
        "Excess-3",
        "IBM 8 4 2 1",
    ],

    /**
     * Lookup table for the binary value of each digit representation.
     *
     * I wrote a very nice algorithm to generate 8 4 2 1 encoding programatically,
     * but unfortunately it's much easier (if less elegant) to use lookup tables
     * when supporting multiple encoding schemes.
     *
     * "Practicality beats purity" - PEP 20
     *
     * In some schemes it is possible to represent the same value in multiple ways.
     * For instance, in 4 2 2 1 encoding, 0100 and 0010 both represent 2. Support
     * has not yet been added for this.
     *
     * @constant
     */
    ENCODING_LOOKUP: {
        "8 4 2 1":     [0,  1,  2,  3,  4,  5,  6,  7,  8,  9],
        "7 4 2 1":     [0,  1,  2,  3,  4,  5,  6,  8,  9,  10],
        "4 2 2 1":     [0,  1,  4,  5,  8,  9,  12, 13, 14, 15],
        "2 4 2 1":     [0,  1,  2,  3,  4,  11, 12, 13, 14, 15],
        "8 4 -2 -1":   [0,  7,  6,  5,  4,  11, 10, 9,  8,  15],
        "Excess-3":    [3,  4,  5,  6,  7,  8,  9,  10, 11, 12],
        "IBM 8 4 2 1": [10, 1,  2,  3,  4,  5,  6,  7,  8,  9],
    },

    /**
     * @default
     * @constant
     */
    FORMAT: ["Nibbles", "Bytes", "Raw"],


    /**
     * To BCD operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToBCD: function(input, args) {
        if (isNaN(input))
            return "Invalid input";
        if (Math.floor(input) !== input)
            return "Fractional values are not supported by BCD";

        const encoding = BCD.ENCODING_LOOKUP[args[0]],
            packed = args[1],
            signed = args[2],
            outputFormat = args[3];

        // Split input number up into separate digits
        const digits = input.toString().split("");

        if (digits[0] === "-" || digits[0] === "+") {
            digits.shift();
        }

        let nibbles = [];

        digits.forEach(d => {
            const n = parseInt(d, 10);
            nibbles.push(encoding[n]);
        });

        if (signed) {
            if (packed && digits.length % 2 === 0) {
                // If there are an even number of digits, we add a leading 0 so
                // that the sign nibble doesn't sit in its own byte, leading to
                // ambiguity around whether the number ends with a 0 or not.
                nibbles.unshift(encoding[0]);
            }

            nibbles.push(input > 0 ? 12 : 13);
            // 12 ("C") for + (credit)
            // 13 ("D") for - (debit)
        }

        let bytes = [];

        if (packed) {
            let encoded = 0,
                little = false;

            nibbles.forEach(n => {
                encoded ^= little ? n : (n << 4);
                if (little) {
                    bytes.push(encoded);
                    encoded = 0;
                }
                little = !little;
            });

            if (little) bytes.push(encoded);
        } else {
            bytes = nibbles;

            // Add null high nibbles
            nibbles = nibbles.map(n => {
                return [0, n];
            }).reduce((a, b) => {
                return a.concat(b);
            });
        }

        // Output
        switch (outputFormat) {
            case "Nibbles":
                return nibbles.map(n => {
                    return n.toString(2).padStart(4, "0");
                }).join(" ");
            case "Bytes":
                return bytes.map(b => {
                    return b.toString(2).padStart(8, "0");
                }).join(" ");
            case "Raw":
            default:
                return Utils.byteArrayToChars(bytes);
        }
    },


    /**
     * From BCD operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    runFromBCD: function(input, args) {
        const encoding = BCD.ENCODING_LOOKUP[args[0]],
            packed = args[1],
            signed = args[2],
            inputFormat = args[3];

        let nibbles = [],
            output = "",
            byteArray;

        // Normalise the input
        switch (inputFormat) {
            case "Nibbles":
            case "Bytes":
                input = input.replace(/\s/g, "");
                for (let i = 0; i < input.length; i += 4) {
                    nibbles.push(parseInt(input.substr(i, 4), 2));
                }
                break;
            case "Raw":
            default:
                byteArray = Utils.strToByteArray(input);
                byteArray.forEach(b => {
                    nibbles.push(b >>> 4);
                    nibbles.push(b & 15);
                });
                break;
        }

        if (!packed) {
            // Discard each high nibble
            for (let i = 0; i < nibbles.length; i++) {
                nibbles.splice(i, 1);
            }
        }

        if (signed) {
            const sign = nibbles.pop();
            if (sign === 13 ||
                sign === 11) {
                // Negative
                output += "-";
            }
        }

        nibbles.forEach(n => {
            if (isNaN(n)) throw "Invalid input";
            let val = encoding.indexOf(n);
            if (val < 0) throw `Value ${Utils.bin(n, 4)} not in encoding scheme`;
            output += val.toString();
        });

        return parseInt(output, 10);
    },

};

export default BCD;
