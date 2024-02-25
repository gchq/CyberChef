/**
 * LICENSE
 *
 *   This software is dual-licensed to the public domain and under the following
 *   license: you are granted a perpetual, irrevocable license to copy, modify,
 *   publish, and distribute this file as you see fit.
 *
 * VERSION
 *   0.1.0  (2016-03-28)  Initial release
 *
 * AUTHOR
 *   Forrest Smith
 *
 * CONTRIBUTORS
 *   J�rgen Tjern� - async helper
 *   Anurag Awasthi - updated to 0.2.0
 */

export const DEFAULT_WEIGHTS = {
    sequentialBonus: 15, // bonus for adjacent matches
    separatorBonus: 30, // bonus if match occurs after a separator
    camelBonus: 30, // bonus if match is uppercase and prev is lower
    firstLetterBonus: 15, // bonus if the first letter is matched

    leadingLetterPenalty: -5, // penalty applied for every letter in str before the first match
    maxLeadingLetterPenalty: -15, // maximum penalty for leading letters
    unmatchedLetterPenalty: -1
};

/**
 * Does a fuzzy search to find pattern inside a string.
 * @param {string} pattern        pattern to search for
 * @param {string} str            string which is being searched
 * @param {boolean} global        whether to search for all matches or just one
 * @returns [boolean, number]       a boolean which tells if pattern was
 *                                  found or not and a search score
 */
export function fuzzyMatch(pattern, str, global = false, weights = DEFAULT_WEIGHTS) {
    const recursionCount = 0;
    const recursionLimit = 10;
    const matches = [];
    const maxMatches = 256;

    if (!global) {
        return fuzzyMatchRecursive(
            pattern,
            str,
            0 /* patternCurIndex */,
            0 /* strCurrIndex */,
            null /* srcMatches */,
            matches,
            maxMatches,
            0 /* nextMatch */,
            recursionCount,
            recursionLimit,
            weights
        );
    }

    // Return all matches
    let foundMatch = true,
        score,
        idxs,
        strCurrIndex = 0;
    const results = [];

    while (foundMatch) {
        [foundMatch, score, idxs] = fuzzyMatchRecursive(
            pattern,
            str,
            0 /* patternCurIndex */,
            strCurrIndex,
            null /* srcMatches */,
            matches,
            maxMatches,
            0 /* nextMatch */,
            recursionCount,
            recursionLimit,
            weights
        );
        if (foundMatch) results.push([foundMatch, score, [...idxs]]);
        strCurrIndex = idxs[idxs.length - 1] + 1;
    }
    return results;
}

/**
 * Recursive helper function
 */
function fuzzyMatchRecursive(
    pattern,
    str,
    patternCurIndex,
    strCurrIndex,
    srcMatches,
    matches,
    maxMatches,
    nextMatch,
    recursionCount,
    recursionLimit,
    weights
) {
    let outScore = 0;

    // Return if recursion limit is reached.
    if (++recursionCount >= recursionLimit) {
        return [false, outScore, []];
    }

    // Return if we reached ends of strings.
    if (patternCurIndex === pattern.length || strCurrIndex === str.length) {
        return [false, outScore, []];
    }

    // Recursion params
    let recursiveMatch = false;
    let bestRecursiveMatches = [];
    let bestRecursiveScore = 0;

    // Loop through pattern and str looking for a match.
    let firstMatch = true;
    while (patternCurIndex < pattern.length && strCurrIndex < str.length) {
        // Match found.
        if (pattern[patternCurIndex].toLowerCase() === str[strCurrIndex].toLowerCase()) {
            if (nextMatch >= maxMatches) {
                return [false, outScore, []];
            }

            if (firstMatch && srcMatches) {
                matches = [...srcMatches];
                firstMatch = false;
            }

            const [matched, recursiveScore, recursiveMatches] = fuzzyMatchRecursive(
                pattern,
                str,
                patternCurIndex,
                strCurrIndex + 1,
                matches,
                recursiveMatches,
                maxMatches,
                nextMatch,
                recursionCount,
                recursionLimit,
                weights
            );

            if (matched) {
                // Pick best recursive score.
                if (!recursiveMatch || recursiveScore > bestRecursiveScore) {
                    bestRecursiveMatches = [...recursiveMatches];
                    bestRecursiveScore = recursiveScore;
                }
                recursiveMatch = true;
            }

            matches[nextMatch++] = strCurrIndex;
            ++patternCurIndex;
        }
        ++strCurrIndex;
    }

    const matched = patternCurIndex === pattern.length;

    if (matched) {
        outScore = 100;

        // Apply leading letter penalty
        let penalty = weights.leadingLetterPenalty * matches[0];
        penalty = penalty < weights.maxLeadingLetterPenalty ? weights.maxLeadingLetterPenalty : penalty;
        outScore += penalty;

        // Apply unmatched penalty
        const unmatched = str.length - nextMatch;
        outScore += weights.unmatchedLetterPenalty * unmatched;

        // Apply ordering bonuses
        for (let i = 0; i < nextMatch; i++) {
            const currIdx = matches[i];

            if (i > 0) {
                const prevIdx = matches[i - 1];
                if (currIdx === prevIdx + 1) {
                    outScore += weights.sequentialBonus;
                }
            }

            // Check for bonuses based on neighbor character value.
            if (currIdx > 0) {
                // Camel case
                const neighbor = str[currIdx - 1];
                const curr = str[currIdx];
                if (neighbor !== neighbor.toUpperCase() && curr !== curr.toLowerCase()) {
                    outScore += weights.camelBonus;
                }
                const isNeighbourSeparator = neighbor === "_" || neighbor === " ";
                if (isNeighbourSeparator) {
                    outScore += weights.separatorBonus;
                }
            } else {
                // First letter
                outScore += weights.firstLetterBonus;
            }
        }

        // Return best result
        if (recursiveMatch && (!matched || bestRecursiveScore > outScore)) {
            // Recursive score is better than "this"
            matches = bestRecursiveMatches;
            outScore = bestRecursiveScore;
            return [true, outScore, matches];
        } else if (matched) {
            // "this" score is better than recursive
            return [true, outScore, matches];
        } else {
            return [false, outScore, matches];
        }
    }
    return [false, outScore, matches];
}

/**
 * Turns a list of match indexes into a list of match ranges
 *
 * @author n1474335 [n1474335@gmail.com]
 * @param [number] matches
 * @returns [[number]]
 */
export function calcMatchRanges(matches) {
    const ranges = [];
    let start = matches[0],
        curr = start;

    matches.forEach((m) => {
        if (m === curr || m === curr + 1) curr = m;
        else {
            ranges.push([start, curr - start + 1]);
            start = m;
            curr = m;
        }
    });

    ranges.push([start, curr - start + 1]);
    return ranges;
}
