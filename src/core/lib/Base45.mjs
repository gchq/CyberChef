/**
 * Base45 resources.
 *
 * @author Thomas Weißschuh [thomas@t-8ch.de]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

/**
 * Highlight to Base45
 */
export function highlightToBase45(pos, args) {
    pos[0].start = Math.floor(pos[0].start / 2) * 3;
    pos[0].end = Math.ceil(pos[0].end / 2) * 3;
    return pos;
}

/**
 * Highlight from Base45
 */
export function highlightFromBase45(pos, args) {
    pos[0].start = Math.floor(pos[0].start / 3) * 2;
    pos[0].end = Math.ceil(pos[0].end / 3) * 2;
    return pos;
}

export const ALPHABET = "0-9A-Z $%*+\\-./:";
