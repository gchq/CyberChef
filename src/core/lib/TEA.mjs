/**
 * TEA and XTEA block cipher implementation.
 *
 * TEA (Tiny Encryption Algorithm) — Wheeler & Needham, 1994.
 * XTEA (Extended TEA) — Wheeler & Needham, 1997.
 *
 * Both operate on 64-bit blocks with 128-bit keys.
 * TEA uses 32 cycles (64 Feistel rounds).
 * XTEA uses 32 cycles (64 Feistel rounds) with improved key schedule.
 *
 * References:
 *   https://en.wikipedia.org/wiki/Tiny_Encryption_Algorithm
 *   https://en.wikipedia.org/wiki/XTEA
 *   https://www.cix.co.uk/~klockstone/teavect.htm
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** TEA/XTEA constants */
const DELTA = 0x9E3779B9;
const BLOCK_SIZE = 8; // 64-bit block = 8 bytes
const ROUNDS = 32;    // 32 cycles

/**
 * Convert byte array to array of 32-bit unsigned integers (big-endian)
 * @param {number[]} bytes
 * @returns {number[]}
 */
function bytesToUint32(bytes) {
    const words = [];
    for (let i = 0; i < bytes.length; i += 4) {
        words.push(
            ((bytes[i] << 24) | (bytes[i + 1] << 16) |
             (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0
        );
    }
    return words;
}

/**
 * Convert array of 32-bit unsigned integers to byte array (big-endian)
 * @param {number[]} words
 * @returns {number[]}
 */
function uint32ToBytes(words) {
    const bytes = [];
    for (const w of words) {
        bytes.push((w >>> 24) & 0xFF);
        bytes.push((w >>> 16) & 0xFF);
        bytes.push((w >>> 8) & 0xFF);
        bytes.push(w & 0xFF);
    }
    return bytes;
}

/**
 * TEA encrypt a single 64-bit block
 * Reference: Wheeler & Needham, 1994
 *
 * @param {number[]} block - 8 bytes (plaintext)
 * @param {number[]} key - 16 bytes (128-bit key)
 * @returns {number[]} - 8 bytes (ciphertext)
 */
function teaEncryptBlock(block, key) {
    const v = bytesToUint32(block);
    const k = bytesToUint32(key);
    let v0 = v[0], v1 = v[1];
    let sum = 0;

    for (let i = 0; i < ROUNDS; i++) {
        sum = (sum + DELTA) >>> 0;
        v0 = (v0 + ((((v1 << 4) + k[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + k[1])))) >>> 0;
        v1 = (v1 + ((((v0 << 4) + k[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + k[3])))) >>> 0;
    }

    return uint32ToBytes([v0, v1]);
}

/**
 * TEA decrypt a single 64-bit block
 *
 * @param {number[]} block - 8 bytes (ciphertext)
 * @param {number[]} key - 16 bytes (128-bit key)
 * @returns {number[]} - 8 bytes (plaintext)
 */
function teaDecryptBlock(block, key) {
    const v = bytesToUint32(block);
    const k = bytesToUint32(key);
    let v0 = v[0], v1 = v[1];
    let sum = (DELTA * ROUNDS) >>> 0;

    for (let i = 0; i < ROUNDS; i++) {
        v1 = (v1 - ((((v0 << 4) + k[2]) ^ (v0 + sum) ^ ((v0 >>> 5) + k[3])))) >>> 0;
        v0 = (v0 - ((((v1 << 4) + k[0]) ^ (v1 + sum) ^ ((v1 >>> 5) + k[1])))) >>> 0;
        sum = (sum - DELTA) >>> 0;
    }

    return uint32ToBytes([v0, v1]);
}

/**
 * XTEA encrypt a single 64-bit block
 * Reference: Wheeler & Needham, 1997
 *
 * @param {number[]} block - 8 bytes (plaintext)
 * @param {number[]} key - 16 bytes (128-bit key)
 * @param {number} rounds - Number of rounds (default 32)
 * @returns {number[]} - 8 bytes (ciphertext)
 */
function xteaEncryptBlock(block, key, rounds) {
    const v = bytesToUint32(block);
    const k = bytesToUint32(key);
    let v0 = v[0], v1 = v[1];
    let sum = 0;

    for (let i = 0; i < rounds; i++) {
        v0 = (v0 + ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
        sum = (sum + DELTA) >>> 0;
        v1 = (v1 + ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
    }

    return uint32ToBytes([v0, v1]);
}

/**
 * XTEA decrypt a single 64-bit block
 *
 * @param {number[]} block - 8 bytes (ciphertext)
 * @param {number[]} key - 16 bytes (128-bit key)
 * @param {number} rounds - Number of rounds (default 32)
 * @returns {number[]} - 8 bytes (plaintext)
 */
function xteaDecryptBlock(block, key, rounds) {
    const v = bytesToUint32(block);
    const k = bytesToUint32(key);
    let v0 = v[0], v1 = v[1];
    let sum = (DELTA * rounds) >>> 0;

    for (let i = 0; i < rounds; i++) {
        v1 = (v1 - ((((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
        sum = (sum - DELTA) >>> 0;
        v0 = (v0 - ((((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
    }

    return uint32ToBytes([v0, v1]);
}

/**
 * XOR two byte arrays of equal length
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function xorBlocks(a, b) {
    return a.map((byte, i) => byte ^ b[i]);
}

/**
 * Increment a byte array as a big-endian counter
 * @param {number[]} counter
 * @returns {number[]}
 */
function incrementCounter(counter) {
    const result = [...counter];
    for (let i = result.length - 1; i >= 0; i--) {
        result[i] = (result[i] + 1) & 0xFF;
        if (result[i] !== 0) break;
    }
    return result;
}

/**
 * Apply padding to message
 * @param {number[]} message
 * @param {string} padding - "NO", "PKCS5", "ZERO", "RANDOM", "BIT"
 * @returns {number[]}
 */
function applyPadding(message, padding) {
    const remainder = message.length % BLOCK_SIZE;
    if (remainder === 0 && padding !== "PKCS5") return [...message];

    const nPadding = (remainder === 0 && padding === "PKCS5") ?
        BLOCK_SIZE :
        BLOCK_SIZE - remainder;

    if (nPadding === 0) return [...message];

    const padded = [...message];

    switch (padding) {
        case "NO":
            throw new OperationError(
                `No padding requested but input length (${message.length} bytes) is not a multiple of ${BLOCK_SIZE} bytes.`
            );
        case "PKCS5":
            for (let i = 0; i < nPadding; i++) padded.push(nPadding);
            break;
        case "ZERO":
            for (let i = 0; i < nPadding; i++) padded.push(0);
            break;
        case "RANDOM":
            for (let i = 0; i < nPadding; i++) padded.push(Math.floor(Math.random() * 256));
            break;
        case "BIT":
            padded.push(0x80);
            for (let i = 1; i < nPadding; i++) padded.push(0);
            break;
        default:
            throw new OperationError(`Unknown padding type: ${padding}`);
    }

    return padded;
}

/**
 * Remove padding from message
 * @param {number[]} message
 * @param {string} padding
 * @returns {number[]}
 */
function removePadding(message, padding) {
    if (message.length === 0) return message;

    switch (padding) {
        case "NO":
        case "ZERO":
        case "RANDOM":
            return message;

        case "PKCS5": {
            const padByte = message[message.length - 1];
            if (padByte > 0 && padByte <= BLOCK_SIZE) {
                for (let i = 0; i < padByte; i++) {
                    if (message[message.length - 1 - i] !== padByte) {
                        throw new OperationError("Invalid PKCS#5 padding.");
                    }
                }
                return message.slice(0, message.length - padByte);
            }
            throw new OperationError("Invalid PKCS#5 padding.");
        }

        case "BIT": {
            for (let i = message.length - 1; i >= 0; i--) {
                if (message[i] === 0x80) return message.slice(0, i);
                if (message[i] !== 0) throw new OperationError("Invalid BIT padding.");
            }
            throw new OperationError("Invalid BIT padding.");
        }

        default:
            throw new OperationError(`Unknown padding type: ${padding}`);
    }
}

/**
 * Encrypt with block cipher modes
 *
 * @param {number[]} message - Plaintext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV (ignored for ECB)
 * @param {string} mode - "ECB", "CBC", "CFB", "OFB", "CTR"
 * @param {string} padding - "PKCS5", "NO", "ZERO", "RANDOM", "BIT"
 * @param {Function} encryptBlockFn - Block encrypt function
 * @returns {number[]} - Ciphertext bytes
 */
function encryptWithMode(message, key, iv, mode, padding, encryptBlockFn) {
    const messageLength = message.length;
    if (messageLength === 0) return [];

    let data;
    if (mode === "ECB" || mode === "CBC") {
        data = applyPadding(message, padding);
    } else {
        data = [...message];
    }

    const cipherText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < data.length; i += BLOCK_SIZE) {
                cipherText.push(...encryptBlockFn(data.slice(i, i + BLOCK_SIZE), key));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < data.length; i += BLOCK_SIZE) {
                const block = data.slice(i, i + BLOCK_SIZE);
                const xored = xorBlocks(block, ivBlock);
                ivBlock = encryptBlockFn(xored, key);
                cipherText.push(...ivBlock);
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < data.length; i += BLOCK_SIZE) {
                const encrypted = encryptBlockFn(ivBlock, key);
                const block = data.slice(i, i + BLOCK_SIZE);
                while (block.length < BLOCK_SIZE) block.push(0);
                ivBlock = xorBlocks(encrypted, block);
                cipherText.push(...ivBlock);
            }
            return cipherText.slice(0, messageLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < data.length; i += BLOCK_SIZE) {
                ivBlock = encryptBlockFn(ivBlock, key);
                const block = data.slice(i, i + BLOCK_SIZE);
                while (block.length < BLOCK_SIZE) block.push(0);
                cipherText.push(...xorBlocks(ivBlock, block));
            }
            return cipherText.slice(0, messageLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < data.length; i += BLOCK_SIZE) {
                const encrypted = encryptBlockFn(counter, key);
                const block = data.slice(i, i + BLOCK_SIZE);
                while (block.length < BLOCK_SIZE) block.push(0);
                cipherText.push(...xorBlocks(encrypted, block));
                counter = incrementCounter(counter);
            }
            return cipherText.slice(0, messageLength);
        }

        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }

    return cipherText;
}

/**
 * Decrypt with block cipher modes
 *
 * @param {number[]} cipherText - Ciphertext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV (ignored for ECB)
 * @param {string} mode - "ECB", "CBC", "CFB", "OFB", "CTR"
 * @param {string} padding - "PKCS5", "NO", "ZERO", "RANDOM", "BIT"
 * @param {Function} encryptBlockFn - Block encrypt function (used for stream modes)
 * @param {Function} decryptBlockFn - Block decrypt function (used for ECB/CBC)
 * @returns {number[]} - Plaintext bytes
 */
function decryptWithMode(cipherText, key, iv, mode, padding, encryptBlockFn, decryptBlockFn) {
    const originalLength = cipherText.length;
    if (originalLength === 0) return [];

    if (mode === "ECB" || mode === "CBC") {
        if ((originalLength % BLOCK_SIZE) !== 0)
            throw new OperationError(
                `Invalid ciphertext length: ${originalLength} bytes. Must be a multiple of ${BLOCK_SIZE}.`
            );
    } else {
        while ((cipherText.length % BLOCK_SIZE) !== 0)
            cipherText.push(0);
    }

    const plainText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < cipherText.length; i += BLOCK_SIZE) {
                plainText.push(...decryptBlockFn(cipherText.slice(i, i + BLOCK_SIZE), key));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCK_SIZE) {
                const block = cipherText.slice(i, i + BLOCK_SIZE);
                const decrypted = decryptBlockFn(block, key);
                plainText.push(...xorBlocks(decrypted, ivBlock));
                ivBlock = block;
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCK_SIZE) {
                const encrypted = encryptBlockFn(ivBlock, key);
                const block = cipherText.slice(i, i + BLOCK_SIZE);
                plainText.push(...xorBlocks(encrypted, block));
                ivBlock = block;
            }
            return plainText.slice(0, originalLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCK_SIZE) {
                ivBlock = encryptBlockFn(ivBlock, key);
                const block = cipherText.slice(i, i + BLOCK_SIZE);
                plainText.push(...xorBlocks(ivBlock, block));
            }
            return plainText.slice(0, originalLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCK_SIZE) {
                const encrypted = encryptBlockFn(counter, key);
                const block = cipherText.slice(i, i + BLOCK_SIZE);
                plainText.push(...xorBlocks(encrypted, block));
                counter = incrementCounter(counter);
            }
            return plainText.slice(0, originalLength);
        }

        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }

    if (mode === "ECB" || mode === "CBC") {
        return removePadding(plainText, padding);
    }

    return plainText.slice(0, originalLength);
}


// ==================== PUBLIC API ====================

/**
 * Encrypt using TEA cipher
 * @param {number[]} message - Plaintext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV
 * @param {string} mode - Block cipher mode
 * @param {string} padding - Padding type
 * @returns {number[]} - Ciphertext bytes
 */
export function encryptTEA(message, key, iv, mode = "ECB", padding = "PKCS5") {
    return encryptWithMode(message, key, iv, mode, padding, teaEncryptBlock);
}

/**
 * Decrypt using TEA cipher
 * @param {number[]} cipherText - Ciphertext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV
 * @param {string} mode - Block cipher mode
 * @param {string} padding - Padding type
 * @returns {number[]} - Plaintext bytes
 */
export function decryptTEA(cipherText, key, iv, mode = "ECB", padding = "PKCS5") {
    return decryptWithMode(cipherText, key, iv, mode, padding, teaEncryptBlock, teaDecryptBlock);
}

/**
 * Encrypt using XTEA cipher
 * @param {number[]} message - Plaintext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV
 * @param {string} mode - Block cipher mode
 * @param {string} padding - Padding type
 * @param {number} rounds - Number of rounds (default 32)
 * @returns {number[]} - Ciphertext bytes
 */
export function encryptXTEA(message, key, iv, mode = "ECB", padding = "PKCS5", rounds = 32) {
    const encFn = (block, k) => xteaEncryptBlock(block, k, rounds);
    return encryptWithMode(message, key, iv, mode, padding, encFn);
}

/**
 * Decrypt using XTEA cipher
 * @param {number[]} cipherText - Ciphertext bytes
 * @param {number[]} key - 16-byte key
 * @param {number[]} iv - 8-byte IV
 * @param {string} mode - Block cipher mode
 * @param {string} padding - Padding type
 * @param {number} rounds - Number of rounds (default 32)
 * @returns {number[]} - Plaintext bytes
 */
export function decryptXTEA(cipherText, key, iv, mode = "ECB", padding = "PKCS5", rounds = 32) {
    const encFn = (block, k) => xteaEncryptBlock(block, k, rounds);
    const decFn = (block, k) => xteaDecryptBlock(block, k, rounds);
    return decryptWithMode(cipherText, key, iv, mode, padding, encFn, decFn);
}

/** Block size in bytes (exported for operation validation) */
export const TEA_BLOCK_SIZE = BLOCK_SIZE;
