/**
 * Identifier extraction functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 */

/**
 * Runs search operations across the input data using regular expressions.
 *
 * @param {string} input
 * @param {RegExp} searchRegex
 * @param {RegExp} [removeRegex=null] - A regular expression defining results to remove from the
 *      final list
 * @param {Function} [sortBy=null] - The sorting comparison function to apply
 * @param {boolean} [unique=false] - Whether to unique the results
 * @returns {string}
 */
export function search(
    input,
    searchRegex,
    removeRegex = null,
    sortBy = null,
    unique = false,
) {
    let results = [];
    let match;

    while ((match = searchRegex.exec(input))) {
        // Moves pointer when an empty string is matched (prevents infinite loop)
        if (match.index === searchRegex.lastIndex) {
            searchRegex.lastIndex++;
        }

        if (removeRegex && removeRegex.test(match[0])) continue;

        results.push(match[0]);
    }

    if (sortBy) {
        results = results.sort(sortBy);
    }

    if (unique) {
        results = results.unique();
    }

    return results;
}

/**
 * URL regular expression
 */
const protocol = "[A-Z]+://",
    hostname = "[-\\w]+(?:\\.\\w[-\\w]*)+",
    port = ":\\d+",
    path =
        '/[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]*' +
        '(?:[.!,?]+[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]+)*';

export const URL_REGEX = new RegExp(
    protocol + hostname + "(?:" + port + ")?(?:" + path + ")?",
    "ig",
);

/**
 * Domain name regular expression
 */
export const DOMAIN_REGEX =
    /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/gi;
