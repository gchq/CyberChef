/**
 * Utility functions for the node environment
 *
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */


/**
 * someName => Somename
 *
 * @param {String} str = string to be altered
 * @returns {String}
 */
const capitalise = function capitalise(str) {
    // Don't edit names that start with 2+ caps
    if (/^[A-Z0-9]{2,}/g.test(str)) {
        return str;
    }
    // reserved. Don't change for now.
    if (str === "Return") {
        return str;
    }

    return `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`;
};


/**
 * SomeName => someName
 * @param {String} name - string to be altered
 * @returns {String} decapitalised
 */
export function decapitalise(str) {
    // Don't decapitalise str that start with 2+ caps
    if (/^[A-Z0-9]{2,}/g.test(str)) {
        return str;
    }
    // reserved. Don't change for now.
    if (str === "Return") {
        return str;
    }

    return `${str.charAt(0).toLowerCase()}${str.substr(1)}`;
}


/**
 * Remove strings surrounded with [] from the given array.
*/
export function removeSubheadingsFromArray(array) {
    if (Array.isArray(array)) {
        return array.filter((i) => {
            if (typeof i === "string") {
                return !i.match(/^\[[\s\S]*\]$/);
            }
            return true;
        });
    }
}


/**
 * Remove spaces, make lower case.
 * @param str
 */
export function sanitise(str) {
    return str.replace(/ /g, "").toLowerCase();
}


/**
 * sonething like this => somethingLikeThis
 * ABC a sentence => ABCASentence
*/
export function sentenceToCamelCase(str) {
    return str.split(" ")
        .map((s, index) => {
            if (index === 0) {
                return decapitalise(s);
            }
            return capitalise(s);
        })
        .reduce((prev, curr) => `${prev}${curr}`, "");
}



