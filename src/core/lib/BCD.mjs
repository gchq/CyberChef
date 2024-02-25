/**
 * Binary Code Decimal resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

/**
 * BCD encoding schemes.
 */
export const ENCODING_SCHEME = [
    "8 4 2 1",
    "7 4 2 1",
    "4 2 2 1",
    "2 4 2 1",
    "8 4 -2 -1",
    "Excess-3",
    "IBM 8 4 2 1",
];

/**
 * Lookup table for the binary value of each digit representation.
 *
 * I wrote a very nice algorithm to generate 8 4 2 1 encoding programmatically,
 * but unfortunately it's much easier (if less elegant) to use lookup tables
 * when supporting multiple encoding schemes.
 *
 * "Practicality beats purity" - PEP 20
 *
 * In some schemes it is possible to represent the same value in multiple ways.
 * For instance, in 4 2 2 1 encoding, 0100 and 0010 both represent 2. Support
 * has not yet been added for this.
 */
export const ENCODING_LOOKUP = {
    "8 4 2 1": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    "7 4 2 1": [0, 1, 2, 3, 4, 5, 6, 8, 9, 10],
    "4 2 2 1": [0, 1, 4, 5, 8, 9, 12, 13, 14, 15],
    "2 4 2 1": [0, 1, 2, 3, 4, 11, 12, 13, 14, 15],
    "8 4 -2 -1": [0, 7, 6, 5, 4, 11, 10, 9, 8, 15],
    "Excess-3": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "IBM 8 4 2 1": [10, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

/**
 * BCD formats.
 */
export const FORMAT = ["Nibbles", "Bytes", "Raw"];
