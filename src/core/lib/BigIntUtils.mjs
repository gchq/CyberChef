/**
 * @author p-leriche [philip.leriche@cantab.net]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Number theory utilities used by cryptographic operations.
 *
 * Currently provides:
 *   - parseBigInt
 *   - Extended Euclidean Algorithm
 *
 * Additional algorithms may be added as required.
 */

/**
 * parseBigInt helper operation
 */
export function parseBigInt(value, param) {
    const v = (value ?? "").trim();
    if (/^0x[0-9a-f]+$/i.test(v)) return BigInt(v);
    if (/^[+-]?[0-9]+$/.test(v)) return BigInt(v);
    throw new OperationError(param + " must be decimal or hex (0x...)");
}

/**
 * Extended Euclidean Algorithm
 *
 * Returns [g, x, y] such that:
 *   a*x + b*y = g = gcd(a, b)
 *
 *   (Uses an iterative algorithm to avoid possible stack overflow)
 */
export function egcd(a, b) {
    let oldR = a, r = b;
    let oldS = 1n, s = 0n;
    let oldT = 0n, t = 1n;

    while (r !== 0n) {
        const quotient = oldR / r;

        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
        [oldT, t] = [t, oldT - quotient * t];
    }

    // oldR is the gcd
    // oldS and oldT are the Bézout coefficients
    return [oldR, oldS, oldT];
}
