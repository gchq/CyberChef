/**
 * Base92 resources.
 *
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Base92 alphabet char
 *
 * @param {number} val
 * @returns {number}
 */
export function base92Chr(val) {
    if (val < 0 || val >= 91) {
        throw new OperationError("Invalid value");
    }
    if (val === 0) return "!".charCodeAt(0);
    else if (val <= 61) return "#".charCodeAt(0) + val - 1;
    else return "a".charCodeAt(0) + val - 62;
}

/**
 * Base92 alphabet ord
 *
 * @param {string} val
 * @returns {number}
 */
export function base92Ord(val) {
    if (val === "!") return 0;
    else if ("#" <= val && val <= "_") return val.charCodeAt(0) - "#".charCodeAt(0) + 1;
    else if ("a" <= val && val <= "}") return val.charCodeAt(0) - "a".charCodeAt(0) + 62;
    throw new OperationError(`${val} is not a base92 character`);
}
