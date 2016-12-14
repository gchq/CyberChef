/* globals CryptoJS */

/**
 * Bitwise operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var BitwiseOp = {

    /**
     * Runs bitwise operations across the input data.
     *
     * @private
     * @param {byte_array} input
     * @param {byte_array} key
     * @param {function} func - The bitwise calculation to carry out
     * @param {boolean} null_preserving
     * @param {string} scheme
     * @returns {byte_array}
     */
    _bit_op: function (input, key, func, null_preserving, scheme) {
        if (!key || !key.length) key = [0];
        var result = [],
            x = null,
            k = null,
            o = null;
        
        for (var i = 0; i < input.length; i++) {
            k = key[i % key.length];
            o = input[i];
            x = null_preserving && (o === 0 || o === k) ? o : func(o, k);
            result.push(x);
            if (scheme !== "Standard" && !(null_preserving && (o === 0 || o === k))) {
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_xor: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || ""),
            scheme = args[1],
            null_preserving = args[2];
        
        key = Utils.word_array_to_byte_array(key);
            
        return BitwiseOp._bit_op(input, key, BitwiseOp._xor, null_preserving, scheme);
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
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_xor_brute: function (input, args) {
        var key_length = parseInt(args[0], 10),
            sample_length = args[1],
            sample_offset = args[2],
            null_preserving = args[3],
            differential = args[4],
            crib = args[5],
            print_key = args[6],
            output_hex = args[7],
            regex;
        
        var output = "",
            result,
            result_utf8;
        
        input = input.slice(sample_offset, sample_offset + sample_length);
        
        if (crib !== "") {
            regex = new RegExp(crib, "im");
        }
        
        
        for (var key = 1, l = Math.pow(256, key_length); key < l; key++) {
            result = BitwiseOp._bit_op(input, Utils.hex_to_byte_array(key.toString(16)), BitwiseOp._xor, null_preserving, differential);
            result_utf8 = Utils.byte_array_to_utf8(result);
            if (crib !== "" && result_utf8.search(regex) === -1) continue;
            if (print_key) output += "Key = " + Utils.hex(key, (2*key_length)) + ": ";
            if (output_hex)
                output += Utils.byte_array_to_hex(result) + "\n";
            else
                output += Utils.printable(result_utf8, false) + "\n";
            if (print_key) output += "\n";
        }
        return output;
    },
    
    
    /**
     * NOT operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_not: function (input, args) {
        return BitwiseOp._bit_op(input, null, BitwiseOp._not);
    },
    
    
    /**
     * AND operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_and: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.word_array_to_byte_array(key);
        
        return BitwiseOp._bit_op(input, key, BitwiseOp._and);
    },
    
    
    /**
     * OR operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_or: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.word_array_to_byte_array(key);
        
        return BitwiseOp._bit_op(input, key, BitwiseOp._or);
    },
    
    
    /**
     * ADD operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_add: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.word_array_to_byte_array(key);
        
        return BitwiseOp._bit_op(input, key, BitwiseOp._add);
    },
    
    
    /**
     * SUB operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_sub: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || "");
        key = Utils.word_array_to_byte_array(key);
        
        return BitwiseOp._bit_op(input, key, BitwiseOp._sub);
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
        var result = operand - key;
        return (result < 0) ? 256 + result : result;
    },

};
