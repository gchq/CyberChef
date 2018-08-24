/**
 * Bitwise operation resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * Runs bitwise operations across the input data.
 *
 * @param {byteArray} input
 * @param {byteArray} key
 * @param {function} func - The bitwise calculation to carry out
 * @param {boolean} nullPreserving
 * @param {string} scheme
 * @returns {byteArray}
 */
export function bitOp (input, key, func, nullPreserving, scheme) {
    if (!key || !key.length) key = [0];
    const result = [];
    let x = null,
        k = null,
        o = null;

    for (let i = 0; i < input.length; i++) {
        k = key[i % key.length];
        if (scheme === "Cascade") k = input[i + 1] || 0;
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
}

/**
 * XOR bitwise calculation.
 *
 * @param {number} operand
 * @param {number} key
 * @returns {number}
 */
export function xor(operand, key) {
    return operand ^ key;
}


/**
 * NOT bitwise calculation.
 *
 * @param {number} operand
 * @returns {number}
 */
export function not(operand, _) {
    return ~operand & 0xff;
}


/**
 * AND bitwise calculation.
 *
 * @param {number} operand
 * @param {number} key
 * @returns {number}
 */
export function and(operand, key) {
    return operand & key;
}


/**
 * OR bitwise calculation.
 *
 * @param {number} operand
 * @param {number} key
 * @returns {number}
 */
export function or(operand, key) {
    return operand | key;
}


/**
 * ADD bitwise calculation.
 *
 * @param {number} operand
 * @param {number} key
 * @returns {number}
 */
export function add(operand, key) {
    return (operand + key) % 256;
}


/**
 * SUB bitwise calculation.
 *
 * @param {number} operand
 * @param {number} key
 * @returns {number}
 */
export function sub(operand, key) {
    const result = operand - key;
    return (result < 0) ? 256 + result : result;
}
