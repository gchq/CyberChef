/**
 * Complete implementation of Twofish block cipher encryption/decryption with
 * ECB, CBC, CFB, OFB, CTR block modes.
 *
 * Twofish was an AES finalist designed by Bruce Schneier et al.
 * Reference: https://www.schneier.com/academic/twofish/
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** Number of rounds */
const NROUNDS = 16;

/** Block size in bytes (128 bits) */
const BLOCKSIZE = 16;

/** Q0 permutation */
const Q0 = [
    0xa9, 0x67, 0xb3, 0xe8, 0x04, 0xfd, 0xa3, 0x76, 0x9a, 0x92, 0x80, 0x78, 0xe4, 0xdd, 0xd1, 0x38,
    0x0d, 0xc6, 0x35, 0x98, 0x18, 0xf7, 0xec, 0x6c, 0x43, 0x75, 0x37, 0x26, 0xfa, 0x13, 0x94, 0x48,
    0xf2, 0xd0, 0x8b, 0x30, 0x84, 0x54, 0xdf, 0x23, 0x19, 0x5b, 0x3d, 0x59, 0xf3, 0xae, 0xa2, 0x82,
    0x63, 0x01, 0x83, 0x2e, 0xd9, 0x51, 0x9b, 0x7c, 0xa6, 0xeb, 0xa5, 0xbe, 0x16, 0x0c, 0xe3, 0x61,
    0xc0, 0x8c, 0x3a, 0xf5, 0x73, 0x2c, 0x25, 0x0b, 0xbb, 0x4e, 0x89, 0x6b, 0x53, 0x6a, 0xb4, 0xf1,
    0xe1, 0xe6, 0xbd, 0x45, 0xe2, 0xf4, 0xb6, 0x66, 0xcc, 0x95, 0x03, 0x56, 0xd4, 0x1c, 0x1e, 0xd7,
    0xfb, 0xc3, 0x8e, 0xb5, 0xe9, 0xcf, 0xbf, 0xba, 0xea, 0x77, 0x39, 0xaf, 0x33, 0xc9, 0x62, 0x71,
    0x81, 0x79, 0x09, 0xad, 0x24, 0xcd, 0xf9, 0xd8, 0xe5, 0xc5, 0xb9, 0x4d, 0x44, 0x08, 0x86, 0xe7,
    0xa1, 0x1d, 0xaa, 0xed, 0x06, 0x70, 0xb2, 0xd2, 0x41, 0x7b, 0xa0, 0x11, 0x31, 0xc2, 0x27, 0x90,
    0x20, 0xf6, 0x60, 0xff, 0x96, 0x5c, 0xb1, 0xab, 0x9e, 0x9c, 0x52, 0x1b, 0x5f, 0x93, 0x0a, 0xef,
    0x91, 0x85, 0x49, 0xee, 0x2d, 0x4f, 0x8f, 0x3b, 0x47, 0x87, 0x6d, 0x46, 0xd6, 0x3e, 0x69, 0x64,
    0x2a, 0xce, 0xcb, 0x2f, 0xfc, 0x97, 0x05, 0x7a, 0xac, 0x7f, 0xd5, 0x1a, 0x4b, 0x0e, 0xa7, 0x5a,
    0x28, 0x14, 0x3f, 0x29, 0x88, 0x3c, 0x4c, 0x02, 0xb8, 0xda, 0xb0, 0x17, 0x55, 0x1f, 0x8a, 0x7d,
    0x57, 0xc7, 0x8d, 0x74, 0xb7, 0xc4, 0x9f, 0x72, 0x7e, 0x15, 0x22, 0x12, 0x58, 0x07, 0x99, 0x34,
    0x6e, 0x50, 0xde, 0x68, 0x65, 0xbc, 0xdb, 0xf8, 0xc8, 0xa8, 0x2b, 0x40, 0xdc, 0xfe, 0x32, 0xa4,
    0xca, 0x10, 0x21, 0xf0, 0xd3, 0x5d, 0x0f, 0x00, 0x6f, 0x9d, 0x36, 0x42, 0x4a, 0x5e, 0xc1, 0xe0
];

/** Q1 permutation */
const Q1 = [
    0x75, 0xf3, 0xc6, 0xf4, 0xdb, 0x7b, 0xfb, 0xc8, 0x4a, 0xd3, 0xe6, 0x6b, 0x45, 0x7d, 0xe8, 0x4b,
    0xd6, 0x32, 0xd8, 0xfd, 0x37, 0x71, 0xf1, 0xe1, 0x30, 0x0f, 0xf8, 0x1b, 0x87, 0xfa, 0x06, 0x3f,
    0x5e, 0xba, 0xae, 0x5b, 0x8a, 0x00, 0xbc, 0x9d, 0x6d, 0xc1, 0xb1, 0x0e, 0x80, 0x5d, 0xd2, 0xd5,
    0xa0, 0x84, 0x07, 0x14, 0xb5, 0x90, 0x2c, 0xa3, 0xb2, 0x73, 0x4c, 0x54, 0x92, 0x74, 0x36, 0x51,
    0x38, 0xb0, 0xbd, 0x5a, 0xfc, 0x60, 0x62, 0x96, 0x6c, 0x42, 0xf7, 0x10, 0x7c, 0x28, 0x27, 0x8c,
    0x13, 0x95, 0x9c, 0xc7, 0x24, 0x46, 0x3b, 0x70, 0xca, 0xe3, 0x85, 0xcb, 0x11, 0xd0, 0x93, 0xb8,
    0xa6, 0x83, 0x20, 0xff, 0x9f, 0x77, 0xc3, 0xcc, 0x03, 0x6f, 0x08, 0xbf, 0x40, 0xe7, 0x2b, 0xe2,
    0x79, 0x0c, 0xaa, 0x82, 0x41, 0x3a, 0xea, 0xb9, 0xe4, 0x9a, 0xa4, 0x97, 0x7e, 0xda, 0x7a, 0x17,
    0x66, 0x94, 0xa1, 0x1d, 0x3d, 0xf0, 0xde, 0xb3, 0x0b, 0x72, 0xa7, 0x1c, 0xef, 0xd1, 0x53, 0x3e,
    0x8f, 0x33, 0x26, 0x5f, 0xec, 0x76, 0x2a, 0x49, 0x81, 0x88, 0xee, 0x21, 0xc4, 0x1a, 0xeb, 0xd9,
    0xc5, 0x39, 0x99, 0xcd, 0xad, 0x31, 0x8b, 0x01, 0x18, 0x23, 0xdd, 0x1f, 0x4e, 0x2d, 0xf9, 0x48,
    0x4f, 0xf2, 0x65, 0x8e, 0x78, 0x5c, 0x58, 0x19, 0x8d, 0xe5, 0x98, 0x57, 0x67, 0x7f, 0x05, 0x64,
    0xaf, 0x63, 0xb6, 0xfe, 0xf5, 0xb7, 0x3c, 0xa5, 0xce, 0xe9, 0x68, 0x44, 0xe0, 0x4d, 0x43, 0x69,
    0x29, 0x2e, 0xac, 0x15, 0x59, 0xa8, 0x0a, 0x9e, 0x6e, 0x47, 0xdf, 0x34, 0x35, 0x6a, 0xcf, 0xdc,
    0x22, 0xc9, 0xc0, 0x9b, 0x89, 0xd4, 0xed, 0xab, 0x12, 0xa2, 0x0d, 0x52, 0xbb, 0x02, 0x2f, 0xa9,
    0xd7, 0x61, 0x1e, 0xb4, 0x50, 0x04, 0xf6, 0xc2, 0x16, 0x25, 0x86, 0x56, 0x55, 0x09, 0xbe, 0x91
];

/** Reed-Solomon matrix for key schedule */
const RS = [
    [0x01, 0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E],
    [0xA4, 0x56, 0x82, 0xF3, 0x1E, 0xC6, 0x68, 0xE5],
    [0x02, 0xA1, 0xFC, 0xC1, 0x47, 0xAE, 0x3D, 0x19],
    [0xA4, 0x55, 0x87, 0x5A, 0x58, 0xDB, 0x9E, 0x03]
];

/**
 * Galois Field multiplication in GF(2^8) with polynomial 0x169
 */
function gfMult(a, b, poly) {
    let result = 0;
    while (b) {
        if (b & 1) result ^= a;
        a <<= 1;
        if (a & 0x100) a ^= poly;
        b >>>= 1;
    }
    return result & 0xFF;
}

/**
 * MDS multiplication
 */
function mdsMultiply(x) {
    const b0 = x & 0xFF;
    const b1 = (x >>> 8) & 0xFF;
    const b2 = (x >>> 16) & 0xFF;
    const b3 = (x >>> 24) & 0xFF;

    // MDS matrix multiplication in GF(2^8) with polynomial 0x169
    const r0 = gfMult(b0, 0x01, 0x169) ^ gfMult(b1, 0xEF, 0x169) ^ gfMult(b2, 0x5B, 0x169) ^ gfMult(b3, 0x5B, 0x169);
    const r1 = gfMult(b0, 0x5B, 0x169) ^ gfMult(b1, 0xEF, 0x169) ^ gfMult(b2, 0xEF, 0x169) ^ gfMult(b3, 0x01, 0x169);
    const r2 = gfMult(b0, 0xEF, 0x169) ^ gfMult(b1, 0x5B, 0x169) ^ gfMult(b2, 0x01, 0x169) ^ gfMult(b3, 0xEF, 0x169);
    const r3 = gfMult(b0, 0xEF, 0x169) ^ gfMult(b1, 0x01, 0x169) ^ gfMult(b2, 0xEF, 0x169) ^ gfMult(b3, 0x5B, 0x169);

    return (r3 << 24) | (r2 << 16) | (r1 << 8) | r0;
}

/**
 * Reed-Solomon multiplication for key schedule
 */
function rsMultiply(key8) {
    let result = 0;
    for (let i = 0; i < 4; i++) {
        let x = 0;
        for (let j = 0; j < 8; j++) {
            x ^= gfMult(RS[i][j], key8[j], 0x14D);
        }
        result |= x << (i * 8);
    }
    return result;
}

/**
 * Apply h function (the main keyed permutation)
 */
function h(x, L, k) {
    const y = new Array(4);
    y[0] = x & 0xFF;
    y[1] = (x >>> 8) & 0xFF;
    y[2] = (x >>> 16) & 0xFF;
    y[3] = (x >>> 24) & 0xFF;

    if (k === 4) {
        y[0] = Q1[y[0]] ^ (L[3] & 0xFF);
        y[1] = Q0[y[1]] ^ ((L[3] >>> 8) & 0xFF);
        y[2] = Q0[y[2]] ^ ((L[3] >>> 16) & 0xFF);
        y[3] = Q1[y[3]] ^ ((L[3] >>> 24) & 0xFF);
    }
    if (k >= 3) {
        y[0] = Q1[y[0]] ^ (L[2] & 0xFF);
        y[1] = Q1[y[1]] ^ ((L[2] >>> 8) & 0xFF);
        y[2] = Q0[y[2]] ^ ((L[2] >>> 16) & 0xFF);
        y[3] = Q0[y[3]] ^ ((L[2] >>> 24) & 0xFF);
    }

    // Always do k >= 2
    y[0] = Q0[Q0[y[0]] ^ (L[1] & 0xFF)] ^ (L[0] & 0xFF);
    y[1] = Q0[Q1[y[1]] ^ ((L[1] >>> 8) & 0xFF)] ^ ((L[0] >>> 8) & 0xFF);
    y[2] = Q1[Q0[y[2]] ^ ((L[1] >>> 16) & 0xFF)] ^ ((L[0] >>> 16) & 0xFF);
    y[3] = Q1[Q1[y[3]] ^ ((L[1] >>> 24) & 0xFF)] ^ ((L[0] >>> 24) & 0xFF);

    // Final q-box lookup
    y[0] = Q1[y[0]];
    y[1] = Q0[y[1]];
    y[2] = Q1[y[2]];
    y[3] = Q0[y[3]];

    return mdsMultiply((y[3] << 24) | (y[2] << 16) | (y[1] << 8) | y[0]);
}

/**
 * Rotate left 32-bit
 */
function ROL(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/**
 * Rotate right 32-bit
 */
function ROR(x, n) {
    return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Generate subkeys from the key
 */
function generateSubkeys(key) {
    const keyLen = key.length;
    const k = keyLen / 8; // 2, 3, or 4

    // Split key into Me (even words) and Mo (odd words)
    const Me = new Array(k);
    const Mo = new Array(k);

    for (let i = 0; i < k; i++) {
        const offset = i * 8;
        Me[i] = (key[offset]) | (key[offset + 1] << 8) |
                (key[offset + 2] << 16) | (key[offset + 3] << 24);
        Mo[i] = (key[offset + 4]) | (key[offset + 5] << 8) |
                (key[offset + 6] << 16) | (key[offset + 7] << 24);
    }

    // Generate S-box keys using Reed-Solomon
    const S = new Array(k);
    for (let i = 0; i < k; i++) {
        const offset = (k - 1 - i) * 8;
        S[i] = rsMultiply(key.slice(offset, offset + 8));
    }

    // Generate round subkeys
    const subkeys = new Array(40);
    const rho = 0x01010101;

    for (let i = 0; i < 20; i++) {
        const A = h(2 * i * rho, Me, k);
        const B = ROL(h((2 * i + 1) * rho, Mo, k), 8);
        subkeys[2 * i] = (A + B) >>> 0;
        subkeys[2 * i + 1] = ROL((A + 2 * B) >>> 0, 9);
    }

    return { subkeys, S, k };
}

/**
 * g function using precomputed S-box keys
 */
function g(x, S, k) {
    return h(x, S, k);
}

/**
 * Encrypt a single 128-bit block
 */
function encryptBlock(block, keyData) {
    const { subkeys, S, k } = keyData;

    // Split block into 4 words (little-endian)
    let R0 = (block[0]) | (block[1] << 8) | (block[2] << 16) | (block[3] << 24);
    let R1 = (block[4]) | (block[5] << 8) | (block[6] << 16) | (block[7] << 24);
    let R2 = (block[8]) | (block[9] << 8) | (block[10] << 16) | (block[11] << 24);
    let R3 = (block[12]) | (block[13] << 8) | (block[14] << 16) | (block[15] << 24);

    // Input whitening
    R0 ^= subkeys[0];
    R1 ^= subkeys[1];
    R2 ^= subkeys[2];
    R3 ^= subkeys[3];

    // 16 rounds
    for (let r = 0; r < NROUNDS; r += 2) {
        let T0 = g(R0, S, k);
        let T1 = g(ROL(R1, 8), S, k);
        R2 = ROR(R2 ^ ((T0 + T1 + subkeys[8 + 2 * r]) >>> 0), 1);
        R3 = ROL(R3, 1) ^ ((T0 + 2 * T1 + subkeys[9 + 2 * r]) >>> 0);

        T0 = g(R2, S, k);
        T1 = g(ROL(R3, 8), S, k);
        R0 = ROR(R0 ^ ((T0 + T1 + subkeys[8 + 2 * r + 2]) >>> 0), 1);
        R1 = ROL(R1, 1) ^ ((T0 + 2 * T1 + subkeys[9 + 2 * r + 2]) >>> 0);
    }

    // Output whitening (with undo of last swap)
    R2 ^= subkeys[4];
    R3 ^= subkeys[5];
    R0 ^= subkeys[6];
    R1 ^= subkeys[7];

    // Convert back to bytes (little-endian)
    return [
        R2 & 0xFF, (R2 >>> 8) & 0xFF, (R2 >>> 16) & 0xFF, (R2 >>> 24) & 0xFF,
        R3 & 0xFF, (R3 >>> 8) & 0xFF, (R3 >>> 16) & 0xFF, (R3 >>> 24) & 0xFF,
        R0 & 0xFF, (R0 >>> 8) & 0xFF, (R0 >>> 16) & 0xFF, (R0 >>> 24) & 0xFF,
        R1 & 0xFF, (R1 >>> 8) & 0xFF, (R1 >>> 16) & 0xFF, (R1 >>> 24) & 0xFF
    ];
}

/**
 * Decrypt a single 128-bit block
 */
function decryptBlock(block, keyData) {
    const { subkeys, S, k } = keyData;

    // Split block into 4 words (little-endian)
    let R0 = (block[0]) | (block[1] << 8) | (block[2] << 16) | (block[3] << 24);
    let R1 = (block[4]) | (block[5] << 8) | (block[6] << 16) | (block[7] << 24);
    let R2 = (block[8]) | (block[9] << 8) | (block[10] << 16) | (block[11] << 24);
    let R3 = (block[12]) | (block[13] << 8) | (block[14] << 16) | (block[15] << 24);

    // Input whitening (reverse of output whitening)
    R0 ^= subkeys[4];
    R1 ^= subkeys[5];
    R2 ^= subkeys[6];
    R3 ^= subkeys[7];

    // 16 rounds in reverse
    for (let r = NROUNDS - 2; r >= 0; r -= 2) {
        let T0 = g(R0, S, k);
        let T1 = g(ROL(R1, 8), S, k);
        R2 = ROL(R2, 1) ^ ((T0 + T1 + subkeys[8 + 2 * r + 2]) >>> 0);
        R3 = ROR(R3 ^ ((T0 + 2 * T1 + subkeys[9 + 2 * r + 2]) >>> 0), 1);

        T0 = g(R2, S, k);
        T1 = g(ROL(R3, 8), S, k);
        R0 = ROL(R0, 1) ^ ((T0 + T1 + subkeys[8 + 2 * r]) >>> 0);
        R1 = ROR(R1 ^ ((T0 + 2 * T1 + subkeys[9 + 2 * r]) >>> 0), 1);
    }

    // Output whitening (reverse of input whitening)
    R2 ^= subkeys[0];
    R3 ^= subkeys[1];
    R0 ^= subkeys[2];
    R1 ^= subkeys[3];

    // Convert back to bytes (little-endian)
    return [
        R2 & 0xFF, (R2 >>> 8) & 0xFF, (R2 >>> 16) & 0xFF, (R2 >>> 24) & 0xFF,
        R3 & 0xFF, (R3 >>> 8) & 0xFF, (R3 >>> 16) & 0xFF, (R3 >>> 24) & 0xFF,
        R0 & 0xFF, (R0 >>> 8) & 0xFF, (R0 >>> 16) & 0xFF, (R0 >>> 24) & 0xFF,
        R1 & 0xFF, (R1 >>> 8) & 0xFF, (R1 >>> 16) & 0xFF, (R1 >>> 24) & 0xFF
    ];
}

/**
 * XOR two 16-byte blocks
 */
function xorBlocks(a, b) {
    const result = new Array(16);
    for (let i = 0; i < 16; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

/**
 * Increment counter (little-endian)
 */
function incrementCounter(counter) {
    const result = [...counter];
    for (let i = 0; i < 16; i++) {
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
 * Encrypt using Twofish cipher with specified block mode
 *
 * @param {number[]} message - Plaintext as byte array
 * @param {number[]} key - Key (16, 24, or 32 bytes)
 * @param {number[]} iv - IV (16 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Ciphertext as byte array
 */
export function encryptTwofish(message, key, iv, mode = "ECB", padding = "PKCS5") {
    const messageLength = message.length;
    if (messageLength === 0) return [];

    const keyData = generateSubkeys(key);

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
                cipherText.push(...encryptBlock(block, keyData));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                const xored = xorBlocks(block, ivBlock);
                ivBlock = encryptBlock(xored, keyData);
                cipherText.push(...ivBlock);
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(ivBlock, keyData);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                ivBlock = xorBlocks(encrypted, block);
                cipherText.push(...ivBlock);
            }
            return cipherText.slice(0, messageLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                ivBlock = encryptBlock(ivBlock, keyData);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
                cipherText.push(...xorBlocks(ivBlock, block));
            }
            return cipherText.slice(0, messageLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < paddedMessage.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(counter, keyData);
                const block = paddedMessage.slice(i, i + BLOCKSIZE);
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
 * Decrypt using Twofish cipher with specified block mode
 *
 * @param {number[]} cipherText - Ciphertext as byte array
 * @param {number[]} key - Key (16, 24, or 32 bytes)
 * @param {number[]} iv - IV (16 bytes, not used for ECB)
 * @param {string} mode - Block cipher mode ("ECB", "CBC", "CFB", "OFB", "CTR")
 * @param {string} padding - Padding type ("NO", "PKCS5", "ZERO", "RANDOM", "BIT")
 * @returns {number[]} - Plaintext as byte array
 */
export function decryptTwofish(cipherText, key, iv, mode = "ECB", padding = "PKCS5") {
    const originalLength = cipherText.length;
    if (originalLength === 0) return [];

    const keyData = generateSubkeys(key);

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
                plainText.push(...decryptBlock(block, keyData));
            }
            break;

        case "CBC": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = cipherText.slice(i, i + BLOCKSIZE);
                const decrypted = decryptBlock(block, keyData);
                plainText.push(...xorBlocks(decrypted, ivBlock));
                ivBlock = block;
            }
            break;
        }

        case "CFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(ivBlock, keyData);
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...xorBlocks(encrypted, block));
                ivBlock = block;
            }
            return plainText.slice(0, originalLength);
        }

        case "OFB": {
            let ivBlock = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                ivBlock = encryptBlock(ivBlock, keyData);
                const block = cipherText.slice(i, i + BLOCKSIZE);
                plainText.push(...xorBlocks(ivBlock, block));
            }
            return plainText.slice(0, originalLength);
        }

        case "CTR": {
            let counter = [...iv];
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const encrypted = encryptBlock(counter, keyData);
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
