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
    KEY_FORMAT: ["Hex", "Base64", "UTF8", "Latin1"],

    /**
     * XOR operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runXor: function (input, args) {
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option),
            scheme = args[1],
            nullPreserving = args[2];

        return BitwiseOp._bitOp(input, key, BitwiseOp._xor, nullPreserving, scheme);
    },


    /**
     * @constant
     * @default
     */
    XOR_BRUTE_KEY_LENGTH: 1,
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
        const keyLength = args[0],
            sampleLength = args[1],
            sampleOffset = args[2],
            scheme = args[3],
            nullPreserving = args[4],
            printKey = args[5],
            outputHex = args[6],
            crib = args[7].toLowerCase();

        let output = [],
            result,
            resultUtf8,
            record = "";

        input = input.slice(sampleOffset, sampleOffset + sampleLength);

        if (ENVIRONMENT_IS_WORKER())
            self.sendStatusMessage("Calculating " + Math.pow(256, keyLength) + " values...");

        /**
         * Converts an integer to an array of bytes expressing that number.
         *
         * @param {number} int
         * @param {number} len - Length of the resulting array
         * @returns {array}
         */
        const intToByteArray = (int, len) => {
            let res = Array(len).fill(0);
            for (let i = len - 1; i >= 0; i--) {
                res[i] = int & 0xff;
                int = int >>> 8;
            }
            return res;
        };

        for (let key = 1, l = Math.pow(256, keyLength); key < l; key++) {
            if (key % 10000 === 0 && ENVIRONMENT_IS_WORKER()) {
                self.sendStatusMessage("Calculating " + l + " values... " + Math.floor(key / l * 100) + "%");
            }

            result = BitwiseOp._bitOp(input, intToByteArray(key, keyLength), BitwiseOp._xor, nullPreserving, scheme);
            resultUtf8 = Utils.byteArrayToUtf8(result);
            record = "";

            if (crib && resultUtf8.toLowerCase().indexOf(crib) < 0) continue;
            if (printKey) record += "Key = " + Utils.hex(key, (2*keyLength)) + ": ";
            if (outputHex) {
                record += Utils.toHex(result);
            } else {
                record += Utils.printable(resultUtf8, false);
            }

            output.push(record);
        }

        return output.join("\n");
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
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option);

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
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option);

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
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option);

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
        const key = Utils.convertToByteArray(args[0].string || "", args[0].option);

        return BitwiseOp._bitOp(input, key, BitwiseOp._sub);
    },


    /**
     * Bit shift left operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runBitShiftLeft: function(input, args) {
        const amount = args[0];

        return input.map(b => {
            return (b << amount) & 0xff;
        });
    },


    /**
     * @constant
     * @default
     */
    BIT_SHIFT_TYPE: ["Logical shift", "Arithmetic shift"],

    /**
     * Bit shift right operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runBitShiftRight: function(input, args) {
        const amount = args[0],
            type = args[1],
            mask = type === "Logical shift" ? 0 : 0x80;

        return input.map(b => {
            return (b >>> amount) ^ (b & mask);
        });
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
