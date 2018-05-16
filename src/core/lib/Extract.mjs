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
 * @param {RegExp} removeRegex - A regular expression defining results to remove from the
 *      final list
 * @param {boolean} includeTotal - Whether or not to include the total number of results
 * @returns {string}
 */
export function search (input, searchRegex, removeRegex, includeTotal) {
    let output = "",
        total = 0,
        match;

    while ((match = searchRegex.exec(input))) {
        // Moves pointer when an empty string is matched (prevents infinite loop)
        if (match.index === searchRegex.lastIndex) {
            searchRegex.lastIndex++;
        }

        if (removeRegex && removeRegex.test(match[0]))
            continue;
        total++;
        output += match[0] + "\n";
    }

    if (includeTotal)
        output = "Total found: " + total + "\n\n" + output;

    return output;
}
