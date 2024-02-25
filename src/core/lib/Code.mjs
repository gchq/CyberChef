/**
 * Code resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * This tries to rename variable names in a code snippet according to a function.
 *
 * @param {string} input
 * @param {function} replacer - This function will be fed the token which should be renamed.
 * @returns {string}
 */
export function replaceVariableNames(input, replacer) {
    const tokenRegex = /\\"|"(?:\\"|[^"])*"|(\b[a-z0-9\-_]+\b)/gi;

    return input.replace(tokenRegex, (...args) => {
        const match = args[0],
            quotes = args[1];

        if (!quotes) {
            return match;
        } else {
            return replacer(match);
        }
    });
}
