import Utils from "../Utils.js";


/**
 * Bitwise operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const BitwiseOp = {

    /**
     * Runs bitwise operations across the input data.
     *
     * @private
     * @param {byteArray} input
     * @param {byteArray} key
     * @param {function} func - The bitwise calculation to carry out
     * @param {boolean} nullPreserving
     * @param {string} scheme
     * @returns {byteArray}
     */
    _bitOp: function (input, key, func, nullPreserving, scheme) {
        if (!key || !key.length) key = [0];
        let result = [],
            x = null,
            k = null,
            o = null;

        for (let i = 0; i < input.length; i++) {
            k = key[i % key.length];
            o = input[i];
            x = nullPreserving && (o === 0 || o === k) ? o : func(o, k);
            result.push(x);
            if (scheme &&
                scheme !== "Standard" &&
                !(nullPreserving && (o === 0 || o === k))) {
                switch (scheme) {
                    case "Input differential":
                        key[i % key.length] = x;
                        break;
                    case "Output differential":
                        key[i % key.length] = o;
                        break;
                }
            }
        }

        return result;
    },


    /**
     * @constant
     * @default
     */
    XOR_PRESERVE_NULLS: false,
    /**
     * @constant
     * @default
     */
    XOR_SCHEME: ["Standard", "Input differential", "Output differential"],
    /**
     * @constant
     * @default
     */
    KEY_FORMAT: ["Hex", "Base64", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1"],

    /**
     * XOR operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runXor: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || ""),
            scheme = args[1],
            nullPreserving = args[2];

        key = Utils.wordArrayToByteArray(key);

        return BitwiseOp._bitOp(input, key, BitwiseOp._xor, nullPreserving, scheme);
    },


    /**
     * @constant
     * @default
     */
    XOR_BRUTE_KEY_LENGTH: ["1", "2"],
    /**
     * @constant
     * @default
     */
    XOR_BRUTE_SAMPLE_LENGTH: 100,
    /**
     * @constant
     * @default
     */
    XOR_BRUTE_SAMPLE_OFFSET: 0,
    /**
     * @constant
     * @default
     */
    XOR_BRUTE_PRINT_KEY: true,
    /**
     * @constant
     * @default
     */
    XOR_BRUTE_OUTPUT_HEX: false,

    /**
     * XOR Brute Force operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runXorBrute: function (input, args) {
        const keyLength = parseInt(args[0], 10),
            sampleLength = args[1],
            sampleOffset = args[2],
            scheme = args[3],
            nullPreserving = args[4],
            printKey = args[5],
            outputHex = args[6],
            crib = args[7];

        let output = "",
            result,
            resultUtf8,
            regex;

        input = input.slice(sampleOffset, sampleOffset + sampleLength);

        if (crib !== "") {
            regex = new RegExp(crib, "im");
        }


        for (let key = 1, l = Math.pow(256, keyLength); key < l; key++) {
            result = BitwiseOp._bitOp(input, Utils.fromHex(key.toString(16)), BitwiseOp._xor, nullPreserving, scheme);
            resultUtf8 = Utils.byteArrayToUtf8(result);
            if (crib !== "" && resultUtf8.search(regex) === -1) continue;
            if (printKey) output += "Key = " + Utils.hex(key, (2*keyLength)) + ": ";
            if (outputHex) output += Utils.toHex(result) + "\n";
            else output += Utils.printable(resultUtf8, false) + "\n";
            if (printKey) output += "\n";
        }
        return output;
    },


    /**
     * NOT operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runNot: function (input, args) {
        return BitwiseOp._bitOp(input, null, BitwiseOp._not);
    },


    /**
     * AND operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runAnd: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.wordArrayToByteArray(key);

        return BitwiseOp._bitOp(input, key, BitwiseOp._and);
    },


    /**
     * OR operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runOr: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.wordArrayToByteArray(key);

        return BitwiseOp._bitOp(input, key, BitwiseOp._or);
    },


    /**
     * ADD operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runAdd: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.wordArrayToByteArray(key);

        return BitwiseOp._bitOp(input, key, BitwiseOp._add);
    },


    /**
     * SUB operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runSub: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.wordArrayToByteArray(key);

        return BitwiseOp._bitOp(input, key, BitwiseOp._sub);
    },


    /**
     * XOR bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @param {number} key
     * @returns {number}
     */
    _xor: function (operand, key) {
        return operand ^ key;
    },


    /**
     * NOT bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @returns {number}
     */
    _not: function (operand, _) {
        return ~operand & 0xff;
    },


    /**
     * AND bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @param {number} key
     * @returns {number}
     */
    _and: function (operand, key) {
        return operand & key;
    },


    /**
     * OR bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @param {number} key
     * @returns {number}
     */
    _or: function (operand, key) {
        return operand | key;
    },


    /**
     * ADD bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @param {number} key
     * @returns {number}
     */
    _add: function (operand, key) {
        return (operand + key) % 256;
    },


    /**
     * SUB bitwise calculation.
     *
     * @private
     * @param {number} operand
     * @param {number} key
     * @returns {number}
     */
    _sub: function (operand, key) {
        const result = operand - key;
        return (result < 0) ? 256 + result : result;
    },

};

export default BitwiseOp;
