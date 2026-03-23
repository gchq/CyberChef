/**
 * Case conversion utilities.
 * Replaces lodash/camelCase, lodash/kebabCase, lodash/snakeCase.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

/**
 * Splits a string into words, handling camelCase, PascalCase, snake_case,
 * kebab-case, spaces, and mixed separators.
 *
 * @param {string} str
 * @returns {string[]}
 */
function splitWords(str) {
    if (!str) return [];
    // Insert boundary before uppercase letters following lowercase or digits
    return str
        .replace(/([a-z\d])([A-Z])/g, "$1\0$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1\0$2")
        .split(/[\0\s_\-./\\]+/)
        .filter(Boolean)
        .map(w => w.toLowerCase());
}

/**
 * Converts a string to camelCase.
 * @param {string} str
 * @returns {string}
 */
export function camelCase(str) {
    const words = splitWords(str);
    return words
        .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

/**
 * Converts a string to kebab-case.
 * @param {string} str
 * @returns {string}
 */
export function kebabCase(str) {
    return splitWords(str).join("-");
}

/**
 * Converts a string to snake_case.
 * @param {string} str
 * @returns {string}
 */
export function snakeCase(str) {
    return splitWords(str).join("_");
}
