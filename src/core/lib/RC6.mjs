/**
 * Complete implementation of RC6 block cipher encryption/decryption with
 * ECB, CBC, CFB, OFB, CTR block modes.
 *
 * RC6 was an AES finalist designed by Ron Rivest, Matt Robshaw, Ray Sidney, and Yiqun Lisa Yin.
 * Reference: https://en.wikipedia.org/wiki/RC6
 * Test Vectors: https://datatracker.ietf.org/doc/html/draft-krovetz-rc6-rc5-vectors-00
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** Number of rounds (RC6-32/20/b for AES compatibility) */
const NROUNDS = 20;

/** Block size in bytes (128 bits = 4 words × 32 bits) */
const BLOCKSIZE = 16;

/** Magic constant P for w=32: Odd((e-2)*2^32) where e=2.71828... */
const P32 = 0xB7E15163;

/** Magic constant Q for w=32: Odd((phi-1)*2^32) where phi=1.61803... (golden ratio) */
const Q32 = 0x9E3779B9;

/**
 * Rotate left 32-bit value
 * @param {number} x - Value to rotate
 * @param {number} n - Rotation amount (only lower 5 bits used)
 * @returns {number} - Rotated value as unsigned 32-bit
 */
function ROL(x, n) {
    n &= 0x1F; // Only use lower 5 bits (log2(32) = 5)
    return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/**
 * Rotate right 32-bit value
 * @param {number} x - Value to rotate
 * @param {number} n - Rotation amount (only lower 5 bits used)
 * @returns {number} - Rotated value as unsigned 32-bit
 */
function ROR(x, n) {
    n &= 0x1F;
    return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Convert byte array to 32-bit word array (little-endian)
 * @param {number[]} bytes - Input byte array
 * @returns {number[]} - Array of 32-bit words
 */
function bytesToWords(bytes) {
    const words = [];
    for (let i = 0; i < bytes.length; i += 4) {
        words.push(
            ((bytes[i] || 0)) |
            ((bytes[i + 1] || 0) << 8) |
            ((bytes[i + 2] || 0) << 16) |
            ((bytes[i + 3] || 0) << 24)
        );
    }
    return words;
}

/**
 * Convert 32-bit word array to byte array (little-endian)
 * @param {number[]} words - Array of 32-bit words
 * @returns {number[]} - Output byte array
 */
function wordsToBytes(words) {
    const bytes = [];
    for (const w of words) {
        bytes.push(w & 0xFF);
        bytes.push((w >>> 8) & 0xFF);
        bytes.push((w >>> 16) & 0xFF);
        bytes.push((w >>> 24) & 0xFF);
    }
    return bytes;
}

/**
 * Generate round subkeys from user key
 *
 * Algorithm from RC6 specification:
 * 1. Initialise S[0..2r+3] using P and Q
 * 2. Mix in the user key L[0..c-1]
 *
 * @param {number[]} key - User key as byte array (16, 24, or 32 bytes)
 * @returns {number[]} - Array of 2r+4 = 44 subkeys
 */
function generateSubkeys(key) {
    const b = key.length; // Key length in bytes
    const c = Math.max(Math.ceil(b / 4), 1); // Key length in words (at least 1)

    // Convert key bytes to words (little-endian), pad with zeros if needed
    const paddedKey = [...key];
    while (paddedKey.length < c * 4) {
        paddedKey.push(0);
    }
    const L = bytesToWords(paddedKey);

    // Number of subkeys: 2*r + 4 = 2*20 + 4 = 44
    const t = 2 * NROUNDS + 4;

    // Initialise S array with magic constants
    const S = new Array(t);
    S[0] = P32;
    for (let i = 1; i < t; i++) {
        S[i] = (S[i - 1] + Q32) >>> 0;
    }

    // Mix key into S
    let A = 0, B = 0;
    let i = 0, j = 0;
    const v = 3 * Math.max(c, t);

    for (let s = 0; s < v; s++) {
        A = S[i] = ROL((S[i] + A + B) >>> 0, 3);
        B = L[j] = ROL((L[j] + A + B) >>> 0, (A + B) >>> 0);
        i = (i + 1) % t;
        j = (j + 1) % c;
    }

    return S;
}

/**
 * Encrypt a single 128-bit block using RC6
 *
 * Algorithm:
 * B = B + S[0]
 * D = D + S[1]
 * for i = 1 to r do
 *     t = ROL(B * (2B + 1), log2(w))
 *     u = ROL(D * (2D + 1), log2(w))
 *     A = ROL(A ^ t, u) + S[2i]
 *     C = ROL(C ^ u, t) + S[2i + 1]
 *     (A, B, C, D) = (B, C, D, A)
 * A = A + S[2r + 2]
 * C = C + S[2r + 3]
 *
 * @param {number[]} block - 16-byte plaintext block
 * @param {number[]} S - Subkeys array
 * @returns {number[]} - 16-byte ciphertext block
 */
function encryptBlock(block, S) {
    // Convert block to 4 words (A, B, C, D) in little-endian
    let [A, B, C, D] = bytesToWords(block);

    // Pre-whitening
    B = (B + S[0]) >>> 0;
    D = (D + S[1]) >>> 0;

    // Main rounds
    for (let i = 1; i <= NROUNDS; i++) {
        // t = ROL(B * (2B + 1), 5)
        // The multiplication B * (2B + 1) needs to be done in 32-bit
        const t = ROL(Math.imul(B, (2 * B + 1) >>> 0) >>> 0, 5);

        // u = ROL(D * (2D + 1), 5)
        const u = ROL(Math.imul(D, (2 * D + 1) >>> 0) >>> 0, 5);

        // A = ROL(A ^ t, u) + S[2i]
        A = (ROL(A ^ t, u) + S[2 * i]) >>> 0;

        // C = ROL(C ^ u, t) + S[2i + 1]
        C = (ROL(C ^ u, t) + S[2 * i + 1]) >>> 0;

        // Rotate registers: (A, B, C, D) = (B, C, D, A)
        const temp = A;
        A = B;
        B = C;
        C = D;
        D = temp;
    }

    // Post-whitening
    A = (A + S[2 * NROUNDS + 2]) >>> 0;
    C = (C + S[2 * NROUNDS + 3]) >>> 0;

    // Convert words back to bytes
    return wordsToBytes([A, B, C, D]);
}

/**
 * Decrypt a single 128-bit block using RC6
 *
 * Algorithm (inverse of encryption):
 * C = C - S[2r + 3]
 * A = A - S[2r + 2]
 * for i = r downto 1 do
 *     (A, B, C, D) = (D, A, B, C)
 *     u = ROL(D * (2D + 1), log2(w))
 *     t = ROL(B * (2B + 1), log2(w))
 *     C = ROR(C - S[2i + 1], t) ^ u
 *     A = ROR(A - S[2i], u) ^ t
 * D = D - S[1]
 * B = B - S[0]
 *
 * @param {number[]} block - 16-byte ciphertext block
 * @param {number[]} S - Subkeys array
 * @returns {number[]} - 16-byte plaintext block
 */
function decryptBlock(block, S) {
    // Convert block to 4 words (A, B, C, D) in little-endian
    let [A, B, C, D] = bytesToWords(block);

    // Reverse post-whitening
    C = (C - S[2 * NROUNDS + 3]) >>> 0;
    A = (A - S[2 * NROUNDS + 2]) >>> 0;

    // Main rounds in reverse
    for (let i = NROUNDS; i >= 1; i--) {
        // Reverse rotate registers: (A, B, C, D) = (D, A, B, C)
        const temp = D;
        D = C;
        C = B;
        B = A;
        A = temp;

        // u = ROL(D * (2D + 1), 5)
        const u = ROL(Math.imul(D, (2 * D + 1) >>> 0) >>> 0, 5);

        // t = ROL(B * (2B + 1), 5)
        const t = ROL(Math.imul(B, (2 * B + 1) >>> 0) >>> 0, 5);

        // C = ROR(C - S[2i + 1], t) ^ u
        C = ROR((C - S[2 * i + 1]) >>> 0, t) ^ u;

        // A = ROR(A - S[2i], u) ^ t
        A = ROR((A - S[2 * i]) >>> 0, u) ^ t;
    }

    // Reverse pre-whitening
    D = (D - S[1]) >>> 0;
    B = (B - S[0]) >>> 0;

    // Convert words back to bytes
    return wordsToBytes([A, B, C, D]);
}

/**
 * XOR two 16-byte blocks
 * @param {number[]} a - First block
 * @param {number[]} b - Second block
 * @returns {number[]} - XOR result
 */
function xorBlocks(a, b) {
    const result = new Array(BLOCKSIZE);
    for (let i = 0; i < BLOCKSIZE; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

/**
 * Increment counter (little-endian)
 * @param {number[]} counter - 16-byte counter
 * @returns {number[]} - Incremented counter
 */
function incrementCounter(counter) {
    const result = [...counter];
    for (let i = 0; i < BLOCKSIZE; i++) {
        result[i]++;
        if (result[i] <= 255) break;
        result[i] = 0;
    }
    return result;
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
 * Encrypt using RC6 cipher with specified block mode
 *
 * @param {number[]} message - Plaintext as byte array
 * @param {number[]} key - Key (16, 24, or 32 bytes)
 * @param {number[]} iv - IV (16 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Ciphertext as byte array
 */
export function encryptRC6(message, key, iv, mode = "ECB", padding = "PKCS5") {
    const messageLength = message.length;
    if (messageLength === 0) return [];

    const S = generateSubkeys(key);

    // Apply padding for ECB/CBC modes
    let paddedMessage;
    if (mode === "ECB" || mode === "CBC") {
        paddedMessage = applyPadding(message, padding, BLOCKSIZE);
    } else {
        // Stream modes (CFB, OFB, CTR) don't need padding
        paddedMessage = [...message];
    }

    const cipherText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                cipherText.push(...encryptBlock(block, S));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                const xored = xorBlocks(block, ivBlock);
                ivBlock = encryptBlock(xored, S);
                cipherText.push(...ivBlock);
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(ivBlock, S);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                // Pad block if shorter than BLOCKSIZE
                while (block.length < BLOCKSIZE) block.push(0);
                ivBlock = xorBlocks(encrypted, block);
                cipherText.push(...ivBlock);
            }
            return cipherText.slice(0, messageLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                ivBlock = encryptBlock(ivBlock, S);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                // Pad block if shorter than BLOCKSIZE
                while (block.length < BLOCKSIZE) block.push(0);
                cipherText.push(...xorBlocks(ivBlock, block));
            }
            return cipherText.slice(0, messageLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(counter, S);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                // Pad block if shorter than BLOCKSIZE
                while (block.length < BLOCKSIZE) block.push(0);
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
 * Decrypt using RC6 cipher with specified block mode
 *
 * @param {number[]} cipherText - Ciphertext as byte array
 * @param {number[]} key - Key (16, 24, or 32 bytes)
 * @param {number[]} iv - IV (16 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Plaintext as byte array
 */
export function decryptRC6(cipherText, key, iv, mode = "ECB", padding = "PKCS5") {
    const originalLength = cipherText.length;
    if (originalLength === 0) return [];

    const S = generateSubkeys(key);

    if (mode === "ECB" || mode === "CBC") {
        if ((originalLength % BLOCKSIZE) !== 0)
            throw new OperationError(`Invalid ciphertext length: ${originalLength} bytes. Must be a multiple of 16.`);
    } else {
        // Pad for stream modes
        while ((cipherText.length % BLOCKSIZE) !== 0)
            cipherText.push(0);
    }

    const plainText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...decryptBlock(block, S));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = cipherText.slice(i, i + BLOCKSIZE);
                const decrypted = decryptBlock(block, S);
                plainText.push(...xorBlocks(decrypted, ivBlock));
                ivBlock = block;
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(ivBlock, S);
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...xorBlocks(encrypted, block));
                ivBlock = block;
            }
            return plainText.slice(0, originalLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                ivBlock = encryptBlock(ivBlock, S);
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...xorBlocks(ivBlock, block));
            }
            return plainText.slice(0, originalLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(counter, S);
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...xorBlocks(encrypted, block));
                counter = incrementCounter(counter);
            }
            return plainText.slice(0, originalLength);
        }

        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }

    // Remove padding for ECB/CBC modes
    if (mode === "ECB" || mode === "CBC") {
        return removePadding(plainText, padding, BLOCKSIZE);
    }

    return plainText.slice(0, originalLength);
}
