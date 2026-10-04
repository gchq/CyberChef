/**
 * AES-EAX authenticated encryption mode.
 *
 * EAX is an AEAD scheme built from CMAC (OMAC1) and AES-CTR.
 * Construction: Tag = OMAC(0‖N) ⊕ OMAC(1‖AAD) ⊕ OMAC(2‖C), with
 * CTR-mode encryption keyed from the nonce-derived OMAC.
 *
 * Uses node-forge for the AES block cipher so it works in both
 * Node.js and browser (via webpack).
 *
 * @author CyberChef Contributors
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import forge from "node-forge";

const BLOCK_SIZE = 16;
const RB = "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x87";

/**
 * XOR two equal-length byte strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function xorStr(a, b) {
    let r = "";
    for (let i = 0; i < a.length; i++) {
        r += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return r;
}

/**
 * Left-shift a byte string by one bit.
 *
 * @param {string} s
 * @returns {string}
 */
function leftShift1(s) {
    let r = "";
    let carry = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        const b = s.charCodeAt(i);
        r = String.fromCharCode(((b << 1) | carry) & 0xff) + r;
        carry = b >> 7;
    }
    return r;
}

/**
 * Encrypt a single AES block (ECB).
 *
 * @param {string} key - forge byte string
 * @param {string} block - 16-byte forge byte string
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
 * Compute AES-CMAC (OMAC1) per RFC 4493.
 *
 * @param {string} key - AES key (forge byte string)
 * @param {string} data - message (forge byte string, may be empty)
 * @returns {string} 16-byte MAC
 */
function cmac(key, data) {
    // Subkey generation
    const L = aesBlock(key, "\x00".repeat(BLOCK_SIZE));
    let K1 = leftShift1(L);
    if (L.charCodeAt(0) & 0x80) K1 = xorStr(K1, RB);
    let K2 = leftShift1(K1);
    if (K1.charCodeAt(0) & 0x80) K2 = xorStr(K2, RB);

    const n = data.length === 0 ? 1 : Math.ceil(data.length / BLOCK_SIZE);
    let lastBlock;

    if (data.length === 0) {
        lastBlock = xorStr("\x80" + "\x00".repeat(BLOCK_SIZE - 1), K2);
    } else if (data.length % BLOCK_SIZE === 0) {
        lastBlock = xorStr(data.substring(data.length - BLOCK_SIZE), K1);
    } else {
        const rem = data.length % BLOCK_SIZE;
        let pad = data.substring(data.length - rem) + "\x80";
        while (pad.length < BLOCK_SIZE) pad += "\x00";
        lastBlock = xorStr(pad, K2);
    }

    let X = "\x00".repeat(BLOCK_SIZE);
    for (let i = 0; i < n - 1; i++) {
        X = aesBlock(key, xorStr(X, data.substring(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE)));
    }
    return aesBlock(key, xorStr(X, lastBlock));
}

/**
 * AES-CTR encrypt / decrypt (same operation).
 *
 * @param {string} key
 * @param {string} iv - 16-byte initial counter
 * @param {string} data
 * @returns {string}
 */
function aesCtr(key, iv, data) {
    if (data.length === 0) return "";
    const c = forge.cipher.createCipher("AES-CTR", key);
    c.start({iv: iv});
    c.update(forge.util.createBuffer(data));
    c.finish();
    return c.output.getBytes();
}

/**
 * Encrypt using AES-EAX.
 *
 * @param {string} key - 16/24/32-byte AES key (forge byte string)
 * @param {string} nonce - nonce of any length (forge byte string)
 * @param {string} plaintext - forge byte string
 * @param {string} aad - additional authenticated data (forge byte string)
 * @returns {{ciphertext: string, tag: string}}
 */
export function eaxEncrypt(key, nonce, plaintext, aad) {
    const B0 = "\x00".repeat(BLOCK_SIZE);
    const B1 = "\x00".repeat(BLOCK_SIZE - 1) + "\x01";
    const B2 = "\x00".repeat(BLOCK_SIZE - 1) + "\x02";

    const nMac = cmac(key, B0 + nonce);
    const hMac = cmac(key, B1 + aad);
    const ciphertext = aesCtr(key, nMac, plaintext);
    const cMac = cmac(key, B2 + ciphertext);
    const tag = xorStr(xorStr(nMac, hMac), cMac);

    return {ciphertext, tag};
}

/**
 * Decrypt using AES-EAX.
 *
 * @param {string} key - 16/24/32-byte AES key (forge byte string)
 * @param {string} nonce - nonce of any length (forge byte string)
 * @param {string} ciphertext - forge byte string
 * @param {string} aad - additional authenticated data (forge byte string)
 * @param {string} tag - 16-byte authentication tag (forge byte string)
 * @returns {string} plaintext
 * @throws {Error} if authentication fails
 */
export function eaxDecrypt(key, nonce, ciphertext, aad, tag) {
    const B0 = "\x00".repeat(BLOCK_SIZE);
    const B1 = "\x00".repeat(BLOCK_SIZE - 1) + "\x01";
    const B2 = "\x00".repeat(BLOCK_SIZE - 1) + "\x02";

    const nMac = cmac(key, B0 + nonce);
    const hMac = cmac(key, B1 + aad);
    const cMac = cmac(key, B2 + ciphertext);
    const computed = xorStr(xorStr(nMac, hMac), cMac);

    if (computed !== tag) {
        throw new Error("EAX authentication failed: tag mismatch.");
    }
    return aesCtr(key, nMac, ciphertext);
}
