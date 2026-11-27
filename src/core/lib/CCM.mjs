/**
 * AES-CCM authenticated encryption mode.
 *
 * CCM (Counter with CBC-MAC) per RFC 3610 / NIST SP 800-38C.
 * Uses node-forge AES-ECB for the block cipher so it works in both
 * Node.js and browser (via webpack).
 *
 * @author CyberChef Contributors
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import forge from "node-forge";

const BLOCK_SIZE = 16;

/**
 * XOR byte strings; length limited to the shorter operand.
 *
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function xorStr(a, b) {
    const len = Math.min(a.length, b.length);
    let r = "";
    for (let i = 0; i < len; i++) {
        r += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return r;
}

/**
 * Encrypt one AES block (ECB, single block).
 *
 * @param {string} key
 * @param {string} block
 * @returns {string}
 */
function aesBlock(key, block) {
    const c = forge.cipher.createCipher("AES-ECB", key);
    c.start();
    c.mode.pad = function (output, options) {
        return true;
    };
    c.update(forge.util.createBuffer(block));
    c.finish();
    return c.output.getBytes();
}

/**
 * Build a CTR-mode counter block A_i for CCM.
 *
 * @param {number} flagsByte
 * @param {string} nonce
 * @param {number} counter
 * @param {number} q - number of counter bytes
 * @returns {string} 16-byte block
 */
function ctrBlock(flagsByte, nonce, counter, q) {
    let ctrBytes = "";
    let v = counter;
    for (let j = 0; j < q; j++) {
        ctrBytes = String.fromCharCode(v & 0xff) + ctrBytes;
        v = Math.floor(v / 256);
    }
    return String.fromCharCode(flagsByte) + nonce + ctrBytes;
}

/**
 * Format the AAD length prefix per RFC 3610 §2.2.
 *
 * @param {number} len
 * @returns {string}
 */
function formatAadLen(len) {
    if (len < 0xff00) { // 65280 = 2^16 - 2^8
        return String.fromCharCode((len >> 8) & 0xff) +
               String.fromCharCode(len & 0xff);
    }
    // 0xff00 .. 2^32 - 1
    return "\xff\xfe" +
        String.fromCharCode((len >> 24) & 0xff) +
        String.fromCharCode((len >> 16) & 0xff) +
        String.fromCharCode((len >> 8) & 0xff) +
        String.fromCharCode(len & 0xff);
}

/**
 * Compute the CBC-MAC tag for CCM.
 *
 * @param {string} key
 * @param {string} nonce
 * @param {string} plaintext
 * @param {string} aad
 * @param {number} tagLength
 * @returns {string} tagLength-byte tag (unencrypted T value)
 */
function ccmCbcMac(key, nonce, plaintext, aad, tagLength) {
    const q = 15 - nonce.length;
    const hasAad = aad.length > 0 ? 1 : 0;
    const flags = (hasAad << 6) | (((tagLength - 2) / 2) << 3) | (q - 1);

    // Encode plaintext length in q bytes (big-endian)
    let lenBytes = "";
    let msgLen = plaintext.length;
    for (let i = 0; i < q; i++) {
        lenBytes = String.fromCharCode(msgLen & 0xff) + lenBytes;
        msgLen = Math.floor(msgLen / 256);
    }

    // B_0
    let Y = aesBlock(key, String.fromCharCode(flags) + nonce + lenBytes);

    // AAD blocks
    if (aad.length > 0) {
        let a = formatAadLen(aad.length) + aad;
        while (a.length % BLOCK_SIZE !== 0) a += "\x00";
        for (let i = 0; i < a.length; i += BLOCK_SIZE) {
            Y = aesBlock(key, xorStr(Y, a.substring(i, i + BLOCK_SIZE)));
        }
    }

    // Plaintext blocks
    if (plaintext.length > 0) {
        let p = plaintext;
        while (p.length % BLOCK_SIZE !== 0) p += "\x00";
        for (let i = 0; i < p.length; i += BLOCK_SIZE) {
            Y = aesBlock(key, xorStr(Y, p.substring(i, i + BLOCK_SIZE)));
        }
    }

    return Y.substring(0, tagLength);
}

/**
 * Encrypt using AES-CCM.
 *
 * @param {string} key - 16/24/32-byte AES key (forge byte string)
 * @param {string} nonce - 7–13 byte nonce (forge byte string)
 * @param {string} plaintext - forge byte string
 * @param {string} aad - additional authenticated data (forge byte string)
 * @param {number} [tagLength=16] - tag length in bytes (4,6,8,10,12,14,16)
 * @returns {{ciphertext: string, tag: string}}
 */
export function ccmEncrypt(key, nonce, plaintext, aad, tagLength = 16) {
    if (nonce.length < 7 || nonce.length > 13) {
        throw new Error(`Invalid CCM nonce length: ${nonce.length} bytes. Must be 7–13 bytes.`);
    }
    if (tagLength < 4 || tagLength > 16 || tagLength % 2 !== 0) {
        throw new Error(`Invalid CCM tag length: ${tagLength}. Must be an even number 4–16.`);
    }

    const q = 15 - nonce.length;
    const flagsCtr = q - 1;

    // CBC-MAC
    const T = ccmCbcMac(key, nonce, plaintext, aad, tagLength);

    // CTR keystream: S_0 encrypts the tag, S_1.. encrypt plaintext
    const S0 = aesBlock(key, ctrBlock(flagsCtr, nonce, 0, q));

    let ciphertext = "";
    for (let i = 0; i < plaintext.length; i += BLOCK_SIZE) {
        const Si = aesBlock(key, ctrBlock(flagsCtr, nonce, Math.floor(i / BLOCK_SIZE) + 1, q));
        const chunk = plaintext.substring(i, i + BLOCK_SIZE);
        ciphertext += xorStr(chunk, Si.substring(0, chunk.length));
    }

    const tag = xorStr(T, S0.substring(0, tagLength));
    return {ciphertext, tag};
}

/**
 * Decrypt using AES-CCM.
 *
 * @param {string} key - 16/24/32-byte AES key (forge byte string)
 * @param {string} nonce - 7–13 byte nonce (forge byte string)
 * @param {string} ciphertext - forge byte string
 * @param {string} aad - additional authenticated data (forge byte string)
 * @param {string} tag - authentication tag (forge byte string)
 * @param {number} [tagLength=16] - expected tag length
 * @returns {string} plaintext
 * @throws {Error} if authentication fails
 */
export function ccmDecrypt(key, nonce, ciphertext, aad, tag, tagLength = 16) {
    if (nonce.length < 7 || nonce.length > 13) {
        throw new Error(`Invalid CCM nonce length: ${nonce.length} bytes. Must be 7–13 bytes.`);
    }

    const q = 15 - nonce.length;
    const flagsCtr = q - 1;

    // CTR decrypt
    const S0 = aesBlock(key, ctrBlock(flagsCtr, nonce, 0, q));

    let plaintext = "";
    for (let i = 0; i < ciphertext.length; i += BLOCK_SIZE) {
        const Si = aesBlock(key, ctrBlock(flagsCtr, nonce, Math.floor(i / BLOCK_SIZE) + 1, q));
        const chunk = ciphertext.substring(i, i + BLOCK_SIZE);
        plaintext += xorStr(chunk, Si.substring(0, chunk.length));
    }

    // Recompute CBC-MAC over recovered plaintext
    const T = ccmCbcMac(key, nonce, plaintext, aad, tagLength);
    const expectedTag = xorStr(T, S0.substring(0, tagLength));

    if (expectedTag !== tag) {
        throw new Error("CCM authentication failed: tag mismatch.");
    }

    return plaintext;
}
