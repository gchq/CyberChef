/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Parse a supported integer width, including a custom editable option.
 * @param {string} size
 * @returns {number} The number of bytes in each integer.
 */
export function integerByteWidth(size) {
    const bits = Number(size);
    if (!/^\d+$/.test(String(size)) || !Number.isInteger(bits) || bits < 8 || bits > 4096 || bits % 8 !== 0) {
        throw new OperationError("Size in bits must be a multiple of 8 from 8 to 4096.");
    }
    return bits / 8;
}
