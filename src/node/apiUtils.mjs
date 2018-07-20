/**
 * Utility functions for the node environment
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

/**
 * SomeName => someName
 * @param {String} name - string to be altered
 * @returns {String} decapitalised
 */
export function decapitalise(name) {
    // Don't decapitalise names that start with 2+ caps
    if (/^[A-Z0-9]{2,}/g.test(name)) {
        return name;
    }
    // reserved. Don't change for now.
    if (name === "Return") {
        return name;
    }

    return `${name.charAt(0).toLowerCase()}${name.substr(1)}`;
}

/**
 * Remove spaces, make lower case.
 * @param str
 */
export function sanitise(str) {
    return str.replace(/ /g, "").toLowerCase();
}
