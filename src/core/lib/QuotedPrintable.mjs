/**
 * Some parts taken from mimelib (http://github.com/andris9/mimelib)
 * @author Andris Reinman
 * @license MIT
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * @param {string} input
 * @returns {byteArray}
 */
export function decodeQuotedPrintable(input) {
    const str = input.replace(/=(?:\r?\n|$)/g, "");

    const encodedBytesCount = (str.match(/=[\da-fA-F]{2}/g) || []).length,
        bufferLength = str.length - encodedBytesCount * 2,
        buffer = new Array(bufferLength);
    let chr, hex,
        bufferPos = 0;

    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charAt(i);
        if (chr === "=" && (hex = str.substr(i + 1, 2)) && /[\da-fA-F]{2}/.test(hex)) {
            buffer[bufferPos++] = parseInt(hex, 16);
            i += 2;
            continue;
        }
        buffer[bufferPos++] = chr.charCodeAt(0);
    }

    return buffer;
}
