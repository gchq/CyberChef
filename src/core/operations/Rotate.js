/**
 * Bit rotation operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 *
 * @todo Support for UTF16
 */
const Rotate = {

    /**
     * @constant
     * @default
     */
    ROTATE_AMOUNT: 1,
    /**
     * @constant
     * @default
     */
    ROTATE_WHOLE: false,

    /**
     * Runs rotation operations across the input data.
     *
     * @private
     * @param {byteArray} data
     * @param {number} amount
     * @param {function} algo - The rotation operation to carry out
     * @returns {byteArray}
     */
    _rot: function(data, amount, algo) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var b = data[i];
            for (var j = 0; j < amount; j++) {
                b = algo(b);
            }
            result.push(b);
        }
        return result;
    },


    /**
     * Rotate right operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRotr: function(input, args) {
        if (args[1]) {
            return Rotate._rotrWhole(input, args[0]);
        } else {
            return Rotate._rot(input, args[0], Rotate._rotr);
        }
    },


    /**
     * Rotate left operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRotl: function(input, args) {
        if (args[1]) {
            return Rotate._rotlWhole(input, args[0]);
        } else {
            return Rotate._rot(input, args[0], Rotate._rotl);
        }
    },


    /**
     * @constant
     * @default
     */
    ROT13_AMOUNT: 13,
    /**
     * @constant
     * @default
     */
    ROT13_LOWERCASE: true,
    /**
     * @constant
     * @default
     */
    ROT13_UPPERCASE: true,

    /**
     * ROT13 operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRot13: function(input, args) {
        var amount = args[2],
            output = input,
            chr,
            rot13Lowercase = args[0],
            rot13Upperacse = args[1];

        if (amount) {
            if (amount < 0) {
                amount = 26 - (Math.abs(amount) % 26);
            }

            for (var i = 0; i < input.length; i++) {
                chr = input[i];
                if (rot13Upperacse && chr >= 65 && chr <= 90) { // Upper case
                    chr = (chr - 65 + amount) % 26;
                    output[i] = chr + 65;
                } else if (rot13Lowercase && chr >= 97 && chr <= 122) { // Lower case
                    chr = (chr - 97 + amount) % 26;
                    output[i] = chr + 97;
                }
            }
        }
        return output;
    },


    /**
     * @constant
     * @default
     */
    ROT47_AMOUNT: 47,

    /**
     * ROT47 operation.
     *
     * @author Matt C [matt@artemisbot.pw]
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRot47: function(input, args) {
        var amount = args[0],
            output = input,
            chr;

        if (amount) {
            if (amount < 0) {
                amount = 94 - (Math.abs(amount) % 94);
            }

            for (var i = 0; i < input.length; i++) {
                chr = input[i];
                if (chr >= 33 && chr <= 126) {
                    chr = (chr - 33 + amount) % 94;
                    output[i] = chr + 33;
                }
            }
        }
        return output;
    },


    /**
     * Rotate right bitwise op.
     *
     * @private
     * @param {byte} b
     * @returns {byte}
     */
    _rotr: function(b) {
        var bit = (b & 1) << 7;
        return (b >> 1) | bit;
    },


    /**
     * Rotate left bitwise op.
     *
     * @private
     * @param {byte} b
     * @returns {byte}
     */
    _rotl: function(b) {
        var bit = (b >> 7) & 1;
        return ((b << 1) | bit) & 0xFF;
    },


    /**
     * Rotates a byte array to the right by a specific amount as a whole, so that bits are wrapped
     * from the end of the array to the beginning.
     *
     * @private
     * @param {byteArray} data
     * @param {number} amount
     * @returns {byteArray}
     */
    _rotrWhole: function(data, amount) {
        var carryBits = 0,
            newByte,
            result = [];

        amount = amount % 8;
        for (var i = 0; i < data.length; i++) {
            var oldByte = data[i] >>> 0;
            newByte = (oldByte >> amount) | carryBits;
            carryBits = (oldByte & (Math.pow(2, amount)-1)) << (8-amount);
            result.push(newByte);
        }
        result[0] |= carryBits;
        return result;
    },


    /**
     * Rotates a byte array to the left by a specific amount as a whole, so that bits are wrapped
     * from the beginning of the array to the end.
     *
     * @private
     * @param {byteArray} data
     * @param {number} amount
     * @returns {byteArray}
     */
    _rotlWhole: function(data, amount) {
        var carryBits = 0,
            newByte,
            result = [];

        amount = amount % 8;
        for (var i = data.length-1; i >= 0; i--) {
            var oldByte = data[i];
            newByte = ((oldByte << amount) | carryBits) & 0xFF;
            carryBits = (oldByte >> (8-amount)) & (Math.pow(2, amount)-1);
            result[i] = (newByte);
        }
        result[data.length-1] = result[data.length-1] | carryBits;
        return result;
    },

};

export default Rotate;
