/**
 * Sorting functions
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 *
 */

/**
 * Comparison operation for sorting of strings ignoring case.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function caseInsensitiveSort(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}


/**
 * Comparison operation for sorting of IPv4 addresses.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function ipSort(a, b) {
    let a_ = a.split("."),
        b_ = b.split(".");

    a_ = a_[0] * 0x1000000 + a_[1] * 0x10000 + a_[2] * 0x100 + a_[3] * 1;
    b_ = b_[0] * 0x1000000 + b_[1] * 0x10000 + b_[2] * 0x100 + b_[3] * 1;

    if (isNaN(a_) && !isNaN(b_)) return 1;
    if (!isNaN(a_) && isNaN(b_)) return -1;
    if (isNaN(a_) && isNaN(b_)) return a.localeCompare(b);

    return a_ - b_;
}

/**
 * Comparison operation for sorting of numeric values.
 *
 * @author Chris van Marle
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function numericSort(a, b) {
    const a_ = a.split(/([^\d]+)/),
        b_ = b.split(/([^\d]+)/);

    for (let i = 0; i < a_.length && i < b.length; ++i) {
        if (isNaN(a_[i]) && !isNaN(b_[i])) return 1; // Numbers after non-numbers
        if (!isNaN(a_[i]) && isNaN(b_[i])) return -1;
        if (isNaN(a_[i]) && isNaN(b_[i])) {
            const ret = a_[i].localeCompare(b_[i]); // Compare strings
            if (ret !== 0) return ret;
        }
        if (!isNaN(a_[i]) && !isNaN(b_[i])) { // Compare numbers
            if (a_[i] - b_[i] !== 0) return a_[i] - b_[i];
        }
    }

    return a.localeCompare(b);
}

/**
 * Comparison operation for sorting of hexadecimal values.
 *
 * @author Chris van Marle
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function hexadecimalSort(a, b) {
    let a_ = a.split(/([^\da-f]+)/i),
        b_ = b.split(/([^\da-f]+)/i);

    a_ = a_.map(v => {
        const t = parseInt(v, 16);
        return isNaN(t) ? v : t;
    });

    b_ = b_.map(v => {
        const t = parseInt(v, 16);
        return isNaN(t) ? v : t;
    });

    for (let i = 0; i < a_.length && i < b.length; ++i) {
        if (isNaN(a_[i]) && !isNaN(b_[i])) return 1; // Numbers after non-numbers
        if (!isNaN(a_[i]) && isNaN(b_[i])) return -1;
        if (isNaN(a_[i]) && isNaN(b_[i])) {
            const ret = a_[i].localeCompare(b_[i]); // Compare strings
            if (ret !== 0) return ret;
        }
        if (!isNaN(a_[i]) && !isNaN(b_[i])) { // Compare numbers
            if (a_[i] - b_[i] !== 0) return a_[i] - b_[i];
        }
    }

    return a.localeCompare(b);
}

/**
 * Comparison operation for sorting by length
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function lengthSort(a, b) {
    return a.length - b.length;
}

