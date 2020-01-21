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

    const distanceMatrix = Array(secStringLength + 1).fill(0).map(() => Array(firstStringLength + 1).fill(0));

    // Fill in first row distances.
    for (let i = 0; i <= firstStringLength; i++)
        distanceMatrix[0][i] = i;

    // Fill in column distances.
    for (let i = 0; i <= secStringLength; i++)
        distanceMatrix[i][0] = i;

    // Propogate the values through the matrix, the leading diagonal holds the total difference at any point.
    for (let j = 1; j <= secStringLength; j++) {
        for (let i = 1; i <= firstStringLength; i++) {
            const indicator = firstString[i - 1] === secString[j - 1] ? 0 : 1;
            distanceMatrix[j][i] = Math.min(
                distanceMatrix[j][i - 1] + 1, // Deletion
                distanceMatrix[j - 1][i] + 1, // Insertion
                distanceMatrix[j - 1][i - 1] + indicator, // Substitution
            );
        }
    }

    return distanceMatrix[secStringLength][firstStringLength];
}

export default levenshteinDistance;
