/**
 * Bacon resources.
 *
 * @author Karsten Silkenbäumer [kassi@users.noreply.github.com]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */

/**
 * Bacon definitions.
 */
export const BACON_ALPHABETS = {
    "Standard (I=J and U=V)": {
        alphabet: "ABCDEFGHIKLMNOPQRSTUWXYZ",
        codes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 23]
    },
    "Complete": {
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
};
export const BACON_TRANSLATION_01 = "0/1";
export const BACON_TRANSLATION_AB = "A/B";
export const BACON_TRANSLATION_CASE = "Case";
export const BACON_TRANSLATION_AMNZ = "A-M/N-Z first letter";
export const BACON_TRANSLATIONS = [
    BACON_TRANSLATION_01,
    BACON_TRANSLATION_AB,
    BACON_TRANSLATION_CASE,
    BACON_TRANSLATION_AMNZ,
];
export const BACON_TRANSLATIONS_FOR_ENCODING = [
    BACON_TRANSLATION_01,
    BACON_TRANSLATION_AB
];
export const BACON_CLEARER_MAP = {
    [BACON_TRANSLATIONS[0]]: /[^01]/g,
    [BACON_TRANSLATIONS[1]]: /[^ABab]/g,
    [BACON_TRANSLATIONS[2]]: /[^A-Za-z]/g,
};
export const BACON_NORMALIZE_MAP = {
    [BACON_TRANSLATIONS[1]]: {
        "A": "0",
        "B": "1",
        "a": "0",
        "b": "1"
    },
};

/**
 * Swaps zeros to ones and ones to zeros.
 *
 * @param {string} data
 * @returns {string}
 *
 * @example
 * // returns "11001 01010"
 * swapZeroAndOne("00110 10101");
 */
export function swapZeroAndOne(string) {
    return string.replace(/[01]/g, function (c) {
        return {
            "0": "1",
            "1": "0"
        }[c];
    });
}
