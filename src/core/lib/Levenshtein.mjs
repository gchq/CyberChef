/**
 * Levenshtein distance library.
 *
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

/**
 * Computes the Levenshtein distance betweeen two strings.
 *
 * @param {string} firstString
 * @param {string} secString
 */
export function levenshteinDistance(firstString, secString) {

    const firstStringLength = firstString.length;
    const secStringLength = secString.length;

    // If the string is empty
    if (!firstStringLength)
        return secStringLength;

    if (!secStringLength)
        return firstStringLength;

    const distMatrix = Array(secStringLength + 1).fill(0).map(() => Array(firstStringLength + 1).fill(0));

    // Fill in first row distances.
    let i;

    for (i = 0; i < firstStringLength + 1; i++)
        distMatrix[0][i] = i;

    // Fill in column distances.
    for (i = 0; i < secStringLength + 1; i++)
        distMatrix[i][0] = i;

    // Propogate the values through the matrix, the leading diagonal holds the total difference at any point.
    for (i = 1; i < secStringLength + 1; i++) {
        for (let j = 1; j < firstStringLength + 1; j++) {
            const indicator = firstString[j - 1] === secString[i - 1] ? 0 : 1;
            distMatrix[i][j] = Math.min(
                distMatrix[i][j - 1] + 1, // Deletion
                distMatrix[i - 1][j] + 1, // Insertion
                distMatrix[i - 1][j - 1] + indicator, // Substitution
            );
        }
    }

    return distMatrix[secStringLength][firstStringLength];
}

export default levenshteinDistance;
