/**
 * Base91 resources.
 *
 * Based on the original basE91 algorithm by Joachim Henke
 * http://base91.sourceforge.net/
 *
 * @author CyberChef Base91 Implementation
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Base91 alphabet - 91 printable ASCII characters
 */
const BASE91_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";

/**
 * Decode table for Base91
 */
const BASE91_DECODE_TABLE = new Array(256).fill(-1);
for (let i = 0; i < BASE91_ALPHABET.length; i++) {
    BASE91_DECODE_TABLE[BASE91_ALPHABET.charCodeAt(i)] = i;
}

/**
 * Encode bytes to Base91
 *
 * @param {Uint8Array} data - Input byte array
 * @returns {string} Base91 encoded string
 */
export function encodeBase91(data) {
    let accumulator = 0;
    let accumulatorBits = 0;
    let output = "";

    for (let i = 0; i < data.length; i++) {
        accumulator |= data[i] << accumulatorBits;
        accumulatorBits += 8;

        if (accumulatorBits > 13) {
            let value = accumulator & 8191;

            if (value > 88) {
                accumulator >>= 13;
                accumulatorBits -= 13;
            } else {
                value = accumulator & 16383;
                accumulator >>= 14;
                accumulatorBits -= 14;
            }

            output += BASE91_ALPHABET[value % 91] + BASE91_ALPHABET[Math.floor(value / 91)];
        }
    }

    if (accumulatorBits > 0) {
        output += BASE91_ALPHABET[accumulator % 91];

        if (accumulatorBits > 7 || accumulator > 90) {
            output += BASE91_ALPHABET[Math.floor(accumulator / 91)];
        }
    }

    return output;
}

/**
 * Decode Base91 string to bytes
 *
 * @param {string} str - Base91 encoded string
 * @returns {Uint8Array} Decoded byte array
 */
export function decodeBase91(str) {
    let accumulator = 0;
    let accumulatorBits = 0;
    let value = -1;
    const output = [];

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        const decodeValue = BASE91_DECODE_TABLE[charCode];

        if (decodeValue === -1) {
            throw new OperationError(`Invalid Base91 character: ${str[i]}`);
        }

        if (value === -1) {
            value = decodeValue;
        } else {
            value += decodeValue * 91;
            accumulator |= (value << accumulatorBits);

            if (value > 88) {
                accumulatorBits += 13;
            } else {
                accumulatorBits += 14;
            }

            value = -1;

            while (accumulatorBits > 7) {
                output.push(accumulator & 255);
                accumulator >>= 8;
                accumulatorBits -= 8;
            }
        }
    }

    if (value !== -1) {
        accumulator |= value << accumulatorBits;
        output.push(accumulator & 255);
    }

    return new Uint8Array(output);
}
