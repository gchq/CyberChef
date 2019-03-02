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

export const BACON_ALPHABET_REDUCED = "ABCDEFGHIKLMNOPQRSTUWXYZ";
export const BACON_ALPHABET_COMPLETE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
