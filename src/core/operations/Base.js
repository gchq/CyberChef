/**
 * Numerical base operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Base = {

    /**
     * @constant
     * @default
     */
    DEFAULT_RADIX: 36,

    /**
     * To Base operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTo: function(input, args) {
        if (!input) {
            throw ("Error: Input must be a number");
        }
        var radix = args[0] || Base.DEFAULT_RADIX;
        if (radix < 2 || radix > 36) {
            throw "Error: Radix argument must be between 2 and 36";
        }
        return input.toString(radix);
    },


    /**
     * From Base operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    runFrom: function(input, args) {
        var radix = args[0] || Base.DEFAULT_RADIX;
        if (radix < 2 || radix > 36) {
            throw "Error: Radix argument must be between 2 and 36";
        }

        var number = input.replace(/\s/g, "").split("."),
            result = parseInt(number[0], radix) || 0;

        if (number.length === 1) return result;

        // Fractional part
        for (var i = 0; i < number[1].length; i++) {
            var digit = parseInt(number[1][i], radix);
            result += digit / Math.pow(radix, i+1);
        }

        return result;
    },

};

export default Base;
