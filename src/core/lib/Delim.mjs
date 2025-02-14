/**
 * Various delimiters
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * Generic sequence delimiters.
 */
export const DELIM_OPTIONS = ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"];

/**
 * Binary sequence delimiters.
 */
export const BIN_DELIM_OPTIONS = ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF", "None"];

/**
 * Letter sequence delimiters.
 */
export const LETTER_DELIM_OPTIONS = ["Space", "Line feed", "CRLF", "Forward slash", "Backslash", "Comma", "Semi-colon", "Colon"];

/**
 * Word sequence delimiters.
 */
export const WORD_DELIM_OPTIONS = ["Line feed", "CRLF", "Forward slash", "Backslash", "Comma", "Semi-colon", "Colon"];

/**
 * Input sequence delimiters.
 */
export const INPUT_DELIM_OPTIONS = ["Line feed", "CRLF", "Space", "Comma", "Semi-colon", "Colon", "Nothing (separate chars)"];

/**
 * Arithmetic sequence delimiters
 */
export const ARITHMETIC_DELIM_OPTIONS = ["Line feed", "Space", "Comma", "Semi-colon", "Colon", "CRLF"];

/**
 * Hash delimiters
 */
export const HASH_DELIM_OPTIONS = ["Line feed", "CRLF", "Space", "Comma"];

/**
 * IP delimiters
 */
export const IP_DELIM_OPTIONS = ["Line feed", "CRLF", "Space", "Comma", "Semi-colon"];

/**
 * Date delimiters
 */
export const DATE_DELIM_OPTIONS = ["Line feed", "CRLF", "Comma", "Semi-colon"];


/**
 * Split delimiters.
 */
export const SPLIT_DELIM_OPTIONS = [
    {name: "Comma", value: ","},
    {name: "Space", value: " "},
    {name: "Line feed", value: "\\n"},
    {name: "CRLF", value: "\\r\\n"},
    {name: "Semi-colon", value: ";"},
    {name: "Colon", value: ":"},
    {name: "Nothing (separate chars)", value: ""}
];

/**
 * Join delimiters.
 */
export const JOIN_DELIM_OPTIONS = [
    {name: "Line feed", value: "\\n"},
    {name: "CRLF", value: "\\r\\n"},
    {name: "Space", value: " "},
    {name: "Comma", value: ","},
    {name: "Semi-colon", value: ";"},
    {name: "Colon", value: ":"},
    {name: "Nothing (join chars)", value: ""}
];

/**
 * RGBA list delimiters.
 */
export const RGBA_DELIM_OPTIONS = [
    {name: "Comma", value: ","},
    {name: "Space", value: " "},
    {name: "CRLF", value: "\\r\\n"},
    {name: "Line Feed", value: "\n"}
];
