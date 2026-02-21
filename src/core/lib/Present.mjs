/**
 * Complete implementation of PRESENT block cipher encryption/decryption with
 * ECB and CBC block modes.
 *
 * PRESENT is an ultra-lightweight block cipher designed for constrained environments.
 * Standardised in ISO/IEC 29192-2:2019.
 *
 * Reference: "PRESENT: An Ultra-Lightweight Block Cipher"
 * https://link.springer.com/chapter/10.1007/978-3-540-74735-2_31
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** Number of rounds */
const NROUNDS = 31;

/** Block size in bytes (64 bits) */
const BLOCKSIZE = 8;

/** The 4-bit S-box (16 values) */
const SBOX = [
    0xC, 0x5, 0x6, 0xB, 0x9, 0x0, 0xA, 0xD,
    0x3, 0xE, 0xF, 0x8, 0x4, 0x7, 0x1, 0x2
];

/** Inverse S-box for decryption */
const SBOX_INV = [
    0x5, 0xE, 0xF, 0x8, 0xC, 0x1, 0x2, 0xD,
    0xB, 0x4, 0x6, 0x3, 0x0, 0x7, 0x9, 0xA
];

/** P-layer permutation table (bit i goes to position P[i]) */
const PBOX = [
    0, 16, 32, 48, 1, 17, 33, 49, 2, 18, 34, 50, 3, 19, 35, 51,
    4, 20, 36, 52, 5, 21, 37, 53, 6, 22, 38, 54, 7, 23, 39, 55,
    8, 24, 40, 56, 9, 25, 41, 57, 10, 26, 42, 58, 11, 27, 43, 59,
    12, 28, 44, 60, 13, 29, 45, 61, 14, 30, 46, 62, 15, 31, 47, 63
];

/** Inverse P-layer permutation for decryption */
const PBOX_INV = new Array(64);
for (let i = 0; i < 64; i++) {
    PBOX_INV[PBOX[i]] = i;
}

/**
 * Convert byte array to BigInt (big-endian)
 * @param {number[]} bytes - Array of bytes
 * @returns {bigint} - 64-bit value as BigInt
 */
function bytesToBigInt(bytes) {
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
        result = (result << 8n) | BigInt(bytes[i]);
    }
    return result;
}

/**
 * Convert BigInt to byte array (big-endian)
 * @param {bigint} value - BigInt value
 * @param {number} length - Desired byte array length
 * @returns {number[]} - Array of bytes
 */
function bigIntToBytes(value, length) {
    const bytes = [];
    for (let i = length - 1; i >= 0; i--) {
        bytes[i] = Number(value & 0xFFn);
        value >>= 8n;
    }
    return bytes;
}

/**
 * Apply S-box substitution layer to 64-bit state
 * @param {bigint} state - 64-bit state
 * @param {number[]} sbox - S-box to use
 * @returns {bigint} - Substituted state
 */
function sBoxLayer(state, sbox) {
    let result = 0n;
    for (let i = 0; i < 16; i++) {
        const nibble = Number((state >> BigInt(i * 4)) & 0xFn);
        result |= BigInt(sbox[nibble]) << BigInt(i * 4);
    }
    return result;
}

/**
 * Apply P-layer permutation to 64-bit state
 * @param {bigint} state - 64-bit state
 * @param {number[]} pbox - Permutation table to use
 * @returns {bigint} - Permuted state
 */
function pLayer(state, pbox) {
    let result = 0n;
    for (let i = 0; i < 64; i++) {
        if ((state >> BigInt(i)) & 1n) {
            result |= 1n << BigInt(pbox[i]);
        }
    }
    return result;
}

/**
 * Generate round keys for 80-bit key
 * @param {number[]} key - 10-byte key
 * @returns {bigint[]} - Array of 32 round keys (64-bit each)
 */
function generateRoundKeys80(key) {
    // Key register is 80 bits
    let keyReg = bytesToBigInt(key);
    const roundKeys = [];

    for (let i = 1; i <= NROUNDS + 1; i++) {
        // Extract round key (leftmost 64 bits)
        roundKeys.push(keyReg >> 16n);

        // Rotate left by 61 positions
        keyReg = ((keyReg << 61n) | (keyReg >> 19n)) & ((1n << 80n) - 1n);

        // Apply S-box to leftmost 4 bits
        const leftNibble = Number(keyReg >> 76n);
        keyReg = (keyReg & ((1n << 76n) - 1n)) | (BigInt(SBOX[leftNibble]) << 76n);

        // XOR round counter to bits 19-15
        keyReg ^= BigInt(i) << 15n;
    }

    return roundKeys;
}

/**
 * Generate round keys for 128-bit key
 * @param {number[]} key - 16-byte key
 * @returns {bigint[]} - Array of 32 round keys (64-bit each)
 */
function generateRoundKeys128(key) {
    // Key register is 128 bits
    let keyReg = bytesToBigInt(key);
    const roundKeys = [];

    for (let i = 1; i <= NROUNDS + 1; i++) {
        // Extract round key (leftmost 64 bits)
        roundKeys.push(keyReg >> 64n);

        // Rotate left by 61 positions
        keyReg = ((keyReg << 61n) | (keyReg >> 67n)) & ((1n << 128n) - 1n);

        // Apply S-box to leftmost 8 bits (two nibbles: bits 127-124 and 123-120)
        const leftByte = Number((keyReg >> 120n) & 0xFFn);
        const leftNibble1 = (leftByte >> 4) & 0xF;  // bits 127-124
        const leftNibble2 = leftByte & 0xF;          // bits 123-120
        keyReg = (keyReg & ((1n << 120n) - 1n)) |
                 (BigInt((SBOX[leftNibble1] << 4) | SBOX[leftNibble2]) << 120n);

        // XOR round counter to bits 66-62
        keyReg ^= BigInt(i) << 62n;
    }

    return roundKeys;
}

/**
 * Encrypt a single 64-bit block
 * @param {bigint} block - 64-bit plaintext block
 * @param {bigint[]} roundKeys - Round keys
 * @returns {bigint} - 64-bit ciphertext block
 */
function encryptBlock(block, roundKeys) {
    let state = block;

    for (let i = 0; i < NROUNDS; i++) {
        // Add round key
        state ^= roundKeys[i];
        // S-box layer
        state = sBoxLayer(state, SBOX);
        // P-layer
        state = pLayer(state, PBOX);
    }

    // Final round key addition
    state ^= roundKeys[NROUNDS];

    return state;
}

/**
 * Decrypt a single 64-bit block
 * @param {bigint} block - 64-bit ciphertext block
 * @param {bigint[]} roundKeys - Round keys
 * @returns {bigint} - 64-bit plaintext block
 */
function decryptBlock(block, roundKeys) {
    let state = block;

    // Reverse key addition
    state ^= roundKeys[NROUNDS];

    for (let i = NROUNDS - 1; i >= 0; i--) {
        // Inverse P-layer
        state = pLayer(state, PBOX_INV);
        // Inverse S-box layer
        state = sBoxLayer(state, SBOX_INV);
        // Add round key
        state ^= roundKeys[i];
    }

    return state;
}

/**
 * Apply padding to message
 * @param {number[]} message - Original message
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @param {number} blockSize - Block size in bytes
 * @returns {number[]} - Padded message
 */
function applyPadding(message, padding, blockSize) {
    const remainder = message.length % blockSize;
    let nPadding = remainder === 0 ? 0 : blockSize - remainder;

    // For PKCS5, always add at least one byte (full block if already aligned)
    if (padding === "PKCS5" && remainder === 0) {
        nPadding = blockSize;
    }

    if (nPadding === 0) return [...message];

    const paddedMessage = [...message];

    switch (padding) {
        case "NO":
            throw new OperationError(`No padding requested but input is not a ${blockSize}-byte multiple.`);

        case "PKCS5":
            for (let i = 0; i < nPadding; i++) {
                paddedMessage.push(nPadding);
            }
            break;

        case "ZERO":
            for (let i = 0; i < nPadding; i++) {
                paddedMessage.push(0);
            }
            break;

        case "RANDOM":
            for (let i = 0; i < nPadding; i++) {
                paddedMessage.push(Math.floor(Math.random() * 256));
            }
            break;

        case "BIT":
            paddedMessage.push(0x80);
            for (let i = 1; i < nPadding; i++) {
                paddedMessage.push(0);
            }
            break;

        default:
            throw new OperationError(`Unknown padding type: ${padding}`);
    }

    return paddedMessage;
}

/**
 * Remove padding from message
 * @param {number[]} message - Padded message
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @param {number} blockSize - Block size in bytes
 * @returns {number[]} - Unpadded message
 */
function removePadding(message, padding, blockSize) {
    if (message.length === 0) return message;

    switch (padding) {
        case "NO":
        case "ZERO":
        case "RANDOM":
            // These padding types cannot be reliably removed
            return message;

        case "PKCS5": {
            const padByte = message[message.length - 1];
            if (padByte > 0 && padByte <= blockSize) {
                // Verify padding
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
            // Find 0x80 byte working backwards, skipping zeros
            for (let i = message.length - 1; i >= 0; i--) {
                if (message[i] === 0x80) {
                    return message.slice(0, i);
                } else if (message[i] !== 0) {
                    throw new OperationError("Invalid BIT padding.");
                }
            }
            throw new OperationError("Invalid BIT padding.");
        }

        default:
            throw new OperationError(`Unknown padding type: ${padding}`);
    }
}

/**
 * Encrypt using PRESENT cipher with specified block mode
 *
 * @param {number[]} message - Plaintext as byte array
 * @param {number[]} key - Key (10 bytes for 80-bit or 16 bytes for 128-bit)
 * @param {number[]} iv - IV (8 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB" or "CBC")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Ciphertext as byte array
 */
export function encryptPRESENT(message, key, iv, mode = "ECB", padding = "PKCS5") {
    if (message.length === 0) return [];

    // Generate round keys based on key length
    const roundKeys = key.length === 10 ?
        generateRoundKeys80(key) :
        generateRoundKeys128(key);

    // Apply padding
    const paddedMessage = applyPadding(message, padding, BLOCKSIZE);

    const cipherText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const block = bytesToBigInt(paddedMessage.slice(i, i + BLOCKSIZE));
                const encrypted = encryptBlock(block, roundKeys);
                cipherText.push(...bigIntToBytes(encrypted, BLOCKSIZE));
            }
            break;

        case "CBC": {
            let ivBlock = bytesToBigInt(iv);
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                let block = bytesToBigInt(paddedMessage.slice(i, i + BLOCKSIZE));
                block ^= ivBlock;
                const encrypted = encryptBlock(block, roundKeys);
                cipherText.push(...bigIntToBytes(encrypted, BLOCKSIZE));
                ivBlock = encrypted;
            }
            break;
        }

        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }

    return cipherText;
}

/**
 * Decrypt using PRESENT cipher with specified block mode
 *
 * @param {number[]} cipherText - Ciphertext as byte array
 * @param {number[]} key - Key (10 bytes for 80-bit or 16 bytes for 128-bit)
 * @param {number[]} iv - IV (8 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB" or "CBC")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Plaintext as byte array
 */
export function decryptPRESENT(cipherText, key, iv, mode = "ECB", padding = "PKCS5") {
    if (cipherText.length === 0) return [];

    if (cipherText.length % BLOCKSIZE !== 0) {
        throw new OperationError(`Invalid ciphertext length: ${cipherText.length} bytes. Must be a multiple of 8.`);
    }

    // Generate round keys based on key length
    const roundKeys = key.length === 10 ?
        generateRoundKeys80(key) :
        generateRoundKeys128(key);

    const plainText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = bytesToBigInt(cipherText.slice(i, i + BLOCKSIZE));
                const decrypted = decryptBlock(block, roundKeys);
                plainText.push(...bigIntToBytes(decrypted, BLOCKSIZE));
            }
            break;

        case "CBC": {
            let ivBlock = bytesToBigInt(iv);
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = bytesToBigInt(cipherText.slice(i, i + BLOCKSIZE));
                let decrypted = decryptBlock(block, roundKeys);
                decrypted ^= ivBlock;
                plainText.push(...bigIntToBytes(decrypted, BLOCKSIZE));
                ivBlock = block;
            }
            break;
        }

        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }

    // Remove padding
    return removePadding(plainText, padding, BLOCKSIZE);
}
