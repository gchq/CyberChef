/**
 * Complete implementation of RC6 block cipher encryption/decryption with
 * configurable word size (w), rounds (r), and key length (b).
 *
 * RC6 was an AES finalist designed by Ron Rivest, Matt Robshaw, Ray Sidney, and Yiqun Lisa Yin.
 * Reference: https://en.wikipedia.org/wiki/RC6
 * Test Vectors: https://datatracker.ietf.org/doc/html/draft-krovetz-rc6-rc5-vectors-00
 *
 * The P and Q constants are derived from mathematical constants e (Euler's number) and
 * φ (golden ratio) as specified in the IETF draft. Master 256-bit values are scaled to
 * any word size.
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Master P constant (256-bit) from IETF draft-krovetz-rc6-rc5-vectors-00
 * Derived from Odd((e-2) * 2^256) where e = 2.71828...
 */
const P_256 = 0xb7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfefn;

/**
 * Master Q constant (256-bit) from IETF draft-krovetz-rc6-rc5-vectors-00
 * Derived from Odd((φ-1) * 2^256) where φ = 1.61803... (golden ratio)
 */
const Q_256 = 0x9e3779b97f4a7c15f39cc0605cedc8341082276bf3a27251f86c6a11d0c18e95n;

/**
 * Get P constant for given word size by scaling the 256-bit master constant
 * @param {number} w - Word size in bits
 * @returns {bigint} - P constant for word size w
 */
function getP(w) {
    return (P_256 >> BigInt(256 - w)) | 1n; // Ensure odd
}

/**
 * Get Q constant for given word size by scaling the 256-bit master constant
 * @param {number} w - Word size in bits
 * @returns {bigint} - Q constant for word size w
 */
function getQ(w) {
    return (Q_256 >> BigInt(256 - w)) | 1n; // Ensure odd
}

/**
 * Get block size in bytes for given word size
 * Block size = 4 words = 4 * (w/8) bytes
 * @param {number} w - Word size in bits
 * @returns {number} - Block size in bytes
 */
export function getBlockSize(w) {
    return 4 * (w / 8);
}

/**
 * Get recommended number of rounds for given word size
 * @param {number} w - Word size in bits
 * @returns {number} - Recommended rounds
 */
export function getDefaultRounds(w) {
    if (w <= 16) return 16;
    if (w <= 32) return 20;
    if (w <= 64) return 24;
    return 28;
}

/**
 * Create mask for w-bit word
 * @param {number} w - Word size in bits
 * @returns {bigint} - Mask with w bits set
 */
function wordMask(w) {
    return (1n << BigInt(w)) - 1n;
}

/**
 * Rotate left for arbitrary word size using BigInt
 * Uses lower lg(w) bits of n for rotation amount (RC6 spec)
 * @param {bigint} x - Value to rotate
 * @param {bigint} n - Rotation amount
 * @param {number} w - Word size in bits
 * @param {bigint} lgMask - Mask for lower lg(w) bits
 * @returns {bigint} - Rotated value
 */
function ROL(x, n, w, lgMask) {
    const mask = wordMask(w);
    // Mask to lg(w) bits, then mod w for non-power-of-2 word sizes
    // For power-of-2, (n & lgMask) < w always, so mod w is no-op
    const shift = (n & lgMask) % BigInt(w);
    return ((x << shift) | (x >> (BigInt(w) - shift))) & mask;
}

/**
 * Rotate right for arbitrary word size using BigInt
 * Uses lower lg(w) bits of n for rotation amount (RC6 spec)
 * @param {bigint} x - Value to rotate
 * @param {bigint} n - Rotation amount
 * @param {number} w - Word size in bits
 * @param {bigint} lgMask - Mask for lower lg(w) bits
 * @returns {bigint} - Rotated value
 */
function ROR(x, n, w, lgMask) {
    const mask = wordMask(w);
    // Mask to lg(w) bits, then mod w for non-power-of-2 word sizes
    // For power-of-2, (n & lgMask) < w always, so mod w is no-op
    const shift = (n & lgMask) % BigInt(w);
    return ((x >> shift) | (x << (BigInt(w) - shift))) & mask;
}

/**
 * Convert byte array to word array (little-endian) using BigInt
 * @param {number[]} bytes - Input byte array
 * @param {number} w - Word size in bits
 * @returns {bigint[]} - Array of w-bit words as BigInt
 */
function bytesToWords(bytes, w) {
    const bytesPerWord = w / 8;
    const words = [];
    for (let i = 0; i < bytes.length; i += bytesPerWord) {
        let word = 0n;
        for (let j = 0; j < bytesPerWord && (i + j) < bytes.length; j++) {
            word |= BigInt(bytes[i + j] || 0) << BigInt(j * 8);
        }
        words.push(word);
    }
    return words;
}

/**
 * Convert word array to byte array (little-endian) using BigInt
 * @param {bigint[]} words - Array of words
 * @param {number} w - Word size in bits
 * @returns {number[]} - Output byte array
 */
function wordsToBytes(words, w) {
    const bytesPerWord = w / 8;
    const bytes = [];
    for (const word of words) {
        for (let j = 0; j < bytesPerWord; j++) {
            bytes.push(Number((word >> BigInt(j * 8)) & 0xFFn));
        }
    }
    return bytes;
}

/**
 * Generate round subkeys from user key
 *
 * @param {number[]} key - User key as byte array
 * @param {number} rounds - Number of rounds
 * @param {number} w - Word size in bits
 * @returns {bigint[]} - Array of 2r+4 subkeys as BigInt
 */
function generateSubkeys(key, rounds, w) {
    const bytesPerWord = w / 8;
    const b = key.length;
    const c = Math.max(Math.ceil(b / bytesPerWord), 1);

    // Convert key bytes to words, pad with zeros if needed
    const paddedKey = [...key];
    while (paddedKey.length < c * bytesPerWord) {
        paddedKey.push(0);
    }
    const L = bytesToWords(paddedKey, w);

    // Number of subkeys: 2*r + 4
    const t = 2 * rounds + 4;

    // Get P and Q for this word size
    const P = getP(w);
    const Q = getQ(w);
    const mask = wordMask(w);

    // lg(w) mask for rotation amounts (floor of log2(w), per RC6 spec)
    const lgw = Math.floor(Math.log2(w));
    const lgMask = (1n << BigInt(lgw)) - 1n;

    // Initialise S array with magic constants
    const S = new Array(t);
    S[0] = P;
    for (let i = 1; i < t; i++) {
        S[i] = (S[i - 1] + Q) & mask;
    }

    // Mix key into S
    let A = 0n, B = 0n;
    let i = 0, j = 0;
    const v = 3 * Math.max(c, t);

    for (let s = 0; s < v; s++) {
        A = S[i] = ROL((S[i] + A + B) & mask, 3n, w, lgMask);
        B = L[j] = ROL((L[j] + A + B) & mask, A + B, w, lgMask);
        i = (i + 1) % t;
        j = (j + 1) % c;
    }

    return S;
}

/**
 * Encrypt a single block using RC6
 *
 * @param {number[]} block - Plaintext block (4*w/8 bytes)
 * @param {bigint[]} S - Subkeys array
 * @param {number} rounds - Number of rounds
 * @param {number} w - Word size in bits
 * @returns {number[]} - Ciphertext block
 */
function encryptBlock(block, S, rounds, w) {
    const mask = wordMask(w);
    const lgw = BigInt(Math.floor(Math.log2(w)));
    const lgMask = (1n << lgw) - 1n;

    // Convert block to 4 words (A, B, C, D)
    let [A, B, C, D] = bytesToWords(block, w);

    // Pre-whitening
    B = (B + S[0]) & mask;
    D = (D + S[1]) & mask;

    // Main rounds
    for (let i = 1; i <= rounds; i++) {
        // t = ROL(B * (2B + 1), lg(w))
        const t = ROL((B * ((2n * B + 1n) & mask)) & mask, lgw, w, lgMask);

        // u = ROL(D * (2D + 1), lg(w))
        const u = ROL((D * ((2n * D + 1n) & mask)) & mask, lgw, w, lgMask);

        // A = ROL(A ^ t, u) + S[2i]
        A = (ROL(A ^ t, u, w, lgMask) + S[2 * i]) & mask;

        // C = ROL(C ^ u, t) + S[2i + 1]
        C = (ROL(C ^ u, t, w, lgMask) + S[2 * i + 1]) & mask;

        // Rotate registers: (A, B, C, D) = (B, C, D, A)
        const temp = A;
        A = B;
        B = C;
        C = D;
        D = temp;
    }

    // Post-whitening
    A = (A + S[2 * rounds + 2]) & mask;
    C = (C + S[2 * rounds + 3]) & mask;

    // Convert words back to bytes
    return wordsToBytes([A, B, C, D], w);
}

/**
 * Decrypt a single block using RC6
 *
 * @param {number[]} block - Ciphertext block (4*w/8 bytes)
 * @param {bigint[]} S - Subkeys array
 * @param {number} rounds - Number of rounds
 * @param {number} w - Word size in bits
 * @returns {number[]} - Plaintext block
 */
function decryptBlock(block, S, rounds, w) {
    const mask = wordMask(w);
    const lgw = BigInt(Math.floor(Math.log2(w)));
    const lgMask = (1n << lgw) - 1n;

    // Convert block to 4 words (A, B, C, D)
    let [A, B, C, D] = bytesToWords(block, w);

    // Reverse post-whitening
    C = (C - S[2 * rounds + 3] + (1n << BigInt(w))) & mask;
    A = (A - S[2 * rounds + 2] + (1n << BigInt(w))) & mask;

    // Main rounds in reverse
    for (let i = rounds; i >= 1; i--) {
        // Reverse rotate registers: (A, B, C, D) = (D, A, B, C)
        const temp = D;
        D = C;
        C = B;
        B = A;
        A = temp;

        // u = ROL(D * (2D + 1), lg(w))
        const u = ROL((D * ((2n * D + 1n) & mask)) & mask, lgw, w, lgMask);

        // t = ROL(B * (2B + 1), lg(w))
        const t = ROL((B * ((2n * B + 1n) & mask)) & mask, lgw, w, lgMask);

        // C = ROR(C - S[2i + 1], t) ^ u
        C = ROR((C - S[2 * i + 1] + (1n << BigInt(w))) & mask, t, w, lgMask) ^ u;

        // A = ROR(A - S[2i], u) ^ t
        A = ROR((A - S[2 * i] + (1n << BigInt(w))) & mask, u, w, lgMask) ^ t;
    }

    // Reverse pre-whitening
    D = (D - S[1] + (1n << BigInt(w))) & mask;
    B = (B - S[0] + (1n << BigInt(w))) & mask;

    // Convert words back to bytes
    return wordsToBytes([A, B, C, D], w);
}

/**
 * XOR two blocks
 * @param {number[]} a - First block
 * @param {number[]} b - Second block
 * @returns {number[]} - XOR result
 */
function xorBlocks(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

/**
 * Increment counter (little-endian)
 * @param {number[]} counter - Counter block
 * @returns {number[]} - Incremented counter
 */
function incrementCounter(counter) {
    const result = [...counter];
    for (let i = 0; i < result.length; i++) {
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
 * @param {number[]} key - Key as byte array
 * @param {number[]} iv - IV (block size bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @param {number} rounds - Number of rounds (default: 20)
 * @param {number} w - Word size in bits (default: 32)
 * @returns {number[]} - Ciphertext as byte array
 */
export function encryptRC6(message, key, iv, mode = "ECB", padding = "PKCS5", rounds = 20, w = 32) {
    const blockSize = getBlockSize(w);
    const messageLength = message.length;
    if (messageLength === 0) return [];

    const S = generateSubkeys(key, rounds, w);

    // Apply padding for ECB/CBC modes
    let paddedMessage;
    if (mode === "ECB" || mode === "CBC") {
        paddedMessage = applyPadding(message, padding, blockSize);
    } else {
        // Stream modes (CFB, OFB, CTR) don't need padding
        paddedMessage = [...message];
    }

    const cipherText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < paddedMessage.length; i += blockSize) {
                const block = paddedMessage.slice(i, i + blockSize);
                cipherText.push(...encryptBlock(block, S, rounds, w));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += blockSize) {
                const block = paddedMessage.slice(i, i + blockSize);
                const xored = xorBlocks(block, ivBlock);
                ivBlock = encryptBlock(xored, S, rounds, w);
                cipherText.push(...ivBlock);
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += blockSize) {
                const encrypted = encryptBlock(ivBlock, S, rounds, w);
                const block = paddedMessage.slice(i, i + blockSize);
                // Pad block if shorter than blockSize
                while (block.length < blockSize) block.push(0);
                ivBlock = xorBlocks(encrypted, block);
                cipherText.push(...ivBlock);
            }
            return cipherText.slice(0, messageLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += blockSize) {
                ivBlock = encryptBlock(ivBlock, S, rounds, w);
                const block = paddedMessage.slice(i, i + blockSize);
                // Pad block if shorter than blockSize
                while (block.length < blockSize) block.push(0);
                cipherText.push(...xorBlocks(ivBlock, block));
            }
            return cipherText.slice(0, messageLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < paddedMessage.length; i += blockSize) {
                const encrypted = encryptBlock(counter, S, rounds, w);
                const block = paddedMessage.slice(i, i + blockSize);
                // Pad block if shorter than blockSize
                while (block.length < blockSize) block.push(0);
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
 * @param {number[]} key - Key as byte array
 * @param {number[]} iv - IV (block size bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @param {number} rounds - Number of rounds (default: 20)
 * @param {number} w - Word size in bits (default: 32)
 * @returns {number[]} - Plaintext as byte array
 */
export function decryptRC6(cipherText, key, iv, mode = "ECB", padding = "PKCS5", rounds = 20, w = 32) {
    const blockSize = getBlockSize(w);
    const originalLength = cipherText.length;
    if (originalLength === 0) return [];

    const S = generateSubkeys(key, rounds, w);

    if (mode === "ECB" || mode === "CBC") {
        if ((originalLength % blockSize) !== 0)
            throw new OperationError(`Invalid ciphertext length: ${originalLength} bytes. Must be a multiple of ${blockSize}.`);
    } else {
        // Pad for stream modes
        while ((cipherText.length % blockSize) !== 0)
            cipherText.push(0);
    }

    const plainText = [];

    switch (mode) {
        case "ECB":
            for (let i = 0; i < cipherText.length; i += blockSize) {
                const block = cipherText.slice(i, i + blockSize);
                plainText.push(...decryptBlock(block, S, rounds, w));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += blockSize) {
                const block = cipherText.slice(i, i + blockSize);
                const decrypted = decryptBlock(block, S, rounds, w);
                plainText.push(...xorBlocks(decrypted, ivBlock));
                ivBlock = block;
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += blockSize) {
                const encrypted = encryptBlock(ivBlock, S, rounds, w);
                const block = cipherText.slice(i, i + blockSize);
                plainText.push(...xorBlocks(encrypted, block));
                ivBlock = block;
            }
            return plainText.slice(0, originalLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += blockSize) {
                ivBlock = encryptBlock(ivBlock, S, rounds, w);
                const block = cipherText.slice(i, i + blockSize);
                plainText.push(...xorBlocks(ivBlock, block));
            }
            return plainText.slice(0, originalLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < cipherText.length; i += blockSize) {
                const encrypted = encryptBlock(counter, S, rounds, w);
                const block = cipherText.slice(i, i + blockSize);
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
        return removePadding(plainText, padding, blockSize);
    }

    return plainText.slice(0, originalLength);
}
