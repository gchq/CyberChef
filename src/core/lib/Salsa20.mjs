/**
 * @author joostrijneveld [joost@joostrijneveld.nl]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";

/**
 * Computes the Salsa20 permute function
 *
 * @param {byteArray} x
 * @param {integer} rounds
 */
function salsa20Permute(x, rounds) {
    /**
     * Macro to compute a 32-bit rotate-left operation
     *
     * @param {integer} x
     * @param {integer} n
     * @returns {integer}
     */
    function ROL32(x, n) {
        return ((x << n) & 0xFFFFFFFF) | (x >>> (32 - n));
    }

    /**
     * Macro to compute a single Salsa20 quarterround operation
     *
     * @param {integer} x
     * @param {integer} a
     * @param {integer} b
     * @param {integer} c
     * @param {integer} d
     * @returns {integer}
     */
    function quarterround(x, a, b, c, d) {
        x[b] ^= ROL32((x[a] + x[d]) & 0xFFFFFFFF, 7);
        x[c] ^= ROL32((x[b] + x[a]) & 0xFFFFFFFF, 9);
        x[d] ^= ROL32((x[c] + x[b]) & 0xFFFFFFFF, 13);
        x[a] ^= ROL32((x[d] + x[c]) & 0xFFFFFFFF, 18);
    }

    for (let i = 0; i < rounds / 2; i++)  {
        quarterround(x, 0, 4, 8, 12);
        quarterround(x, 5, 9, 13, 1);
        quarterround(x, 10, 14, 2, 6);
        quarterround(x, 15, 3, 7, 11);
        quarterround(x, 0, 1, 2, 3);
        quarterround(x, 5, 6, 7, 4);
        quarterround(x, 10, 11, 8, 9);
        quarterround(x, 15, 12, 13, 14);
    }
}

/**
 * Computes the Salsa20 block function
 *
 * @param {byteArray} key
 * @param {byteArray} nonce
 * @param {byteArray} counter
 * @param {integer} rounds
 * @returns {byteArray}
 */
export function salsa20Block(key, nonce, counter, rounds) {
    const tau = "expand 16-byte k";
    const sigma = "expand 32-byte k";
    let state, c;
    if (key.length === 16) {
        c = Utils.strToByteArray(tau);
        key = key.concat(key);
    } else {
        c = Utils.strToByteArray(sigma);
    }

    state = c.slice(0, 4);
    state = state.concat(key.slice(0, 16));
    state = state.concat(c.slice(4, 8));
    state = state.concat(nonce);
    state = state.concat(counter);
    state = state.concat(c.slice(8, 12));
    state = state.concat(key.slice(16, 32));
    state = state.concat(c.slice(12, 16));

    const x = Array();
    for (let i = 0; i < 64; i += 4) {
        x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
    }
    const a = [...x];

    salsa20Permute(x, rounds);

    for (let i = 0; i < 16; i++) {
        x[i] = (x[i] + a[i]) & 0xFFFFFFFF;
    }

    let output = Array();
    for (let i = 0; i < 16; i++) {
        output = output.concat(Utils.intToByteArray(x[i], 4, "little"));
    }
    return output;
}

/**
 * Computes the hSalsa20 function
 *
 * @param {byteArray} key
 * @param {byteArray} nonce
 * @param {integer} rounds
 * @returns {byteArray}
 */
export function hsalsa20(key, nonce, rounds) {
    const tau = "expand 16-byte k";
    const sigma = "expand 32-byte k";
    let state, c;
    if (key.length === 16) {
        c = Utils.strToByteArray(tau);
        key = key.concat(key);
    } else {
        c = Utils.strToByteArray(sigma);
    }

    state = c.slice(0, 4);
    state = state.concat(key.slice(0, 16));
    state = state.concat(c.slice(4, 8));
    state = state.concat(nonce);
    state = state.concat(c.slice(8, 12));
    state = state.concat(key.slice(16, 32));
    state = state.concat(c.slice(12, 16));

    const x = Array();
    for (let i = 0; i < 64; i += 4) {
        x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
    }

    salsa20Permute(x, rounds);

    let output = Array();
    const idx = [0, 5, 10, 15, 6, 7, 8, 9];
    for (let i = 0; i < 8; i++) {
        output = output.concat(Utils.intToByteArray(x[idx[i]], 4, "little"));
    }
    return output;
}
