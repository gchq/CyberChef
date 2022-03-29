/**
 * Complete implementation of SM4 cipher encryption/decryption with
 * ECB, CBC, CFB, OFB, CTR block modes.
 * These modes are specified in IETF draft-ribose-cfrg-sm4-09, see:
 * https://tools.ietf.org/id/draft-ribose-cfrg-sm4-09.html
 * for details.
 *
 * Follows spec from Cryptography Standardization Technical Comittee:
 * http://www.gmbz.org.cn/upload/2018-04-04/1522788048733065051.pdf
 *
 * @author swesven
 * @copyright 2021
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** Number of rounds */
const NROUNDS = 32;

/** block size in bytes */
const BLOCKSIZE = 16;

/** The S box, 256 8-bit values */
const Sbox = [
    0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
    0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
    0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
    0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
    0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
    0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
    0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
    0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
    0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
    0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
    0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
    0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
    0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
    0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
    0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
    0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48
];

/** "Fixed parameter CK" used in key expansion */
const CK = [
    0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
    0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
    0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
    0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
    0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
    0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
    0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
    0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
];

/** "System parameter FK" */
const FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc];

/**
 * Rotating 32-bit shift left
 *
 * (Note that although JS integers are stored in doubles and thus have 53 bits,
 * the JS bitwise operations are 32-bit)
 */
function ROL(i, n) {
    return (i << n) | (i >>> (32 - n));
}

/**
 * Linear transformation L
 *
 * @param {integer} b - a 32 bit integer
 */
function transformL(b) {
    /* Replace each of the 4 bytes in b with the value at its offset in the Sbox */
    b = (Sbox[(b >>> 24) & 0xFF] << 24) | (Sbox[(b >>> 16) & 0xFF] << 16) |
        (Sbox[(b >>> 8) & 0xFF] << 8) | Sbox[b & 0xFF];
    /* circular rotate and xor */
    return b ^ ROL(b, 2) ^ ROL(b, 10) ^ ROL(b, 18) ^ ROL(b, 24);
}

/**
 * Linear transformation L'
 *
 * @param {integer} b - a 32 bit integer
 */
function transformLprime(b) {
    /* Replace each of the 4 bytes in b with the value at its offset in the Sbox */
    b = (Sbox[(b >>> 24) & 0xFF] << 24) | (Sbox[(b >>> 16) & 0xFF] << 16) |
        (Sbox[(b >>> 8) & 0xFF] << 8) | Sbox[b & 0xFF];
    return b ^ ROL(b, 13) ^ ROL(b, 23); /* circular rotate and XOR */
}

/**
 * Initialize the round key
 */
function initSM4RoundKey(rawkey) {
    const K = rawkey.map((a, i) => a ^ FK[i]);    /* K = rawkey ^ FK */
    const roundKey = [];
    for (let i = 0; i < 32; i++)
        roundKey[i] = K[i + 4] = K[i] ^ transformLprime(K[i + 1] ^ K[i + 2] ^ K[i + 3] ^ CK[i]);
    return roundKey;
}

/**
 * Encrypts/decrypts a single block X (4 32-bit values) with a prepared round key.
 *
 * @param {intArray} X - A cleartext block.
 * @param {intArray} roundKey - The round key from initSMRoundKey for encrypting (reversed for decrypting).
 * @returns {byteArray} - The cipher text.
 */
function encryptBlockSM4(X, roundKey) {
    for (let i = 0; i < NROUNDS; i++)
        X[i + 4] = X[i] ^ transformL(X[i + 1] ^ X[i + 2] ^ X[i + 3] ^ roundKey[i]);
    return [X[35], X[34], X[33], X[32]];
}

/**
 * Takes 16 bytes from an offset in an array and returns an array of 4 32-bit Big-Endian values.
 * (DataView won't work portably here as we need Big-Endian)
 *
 * @param {byteArray} bArray - the array of bytes
 * @param {integer} offset - starting offset in the array; 15 bytes must follow it.
 */
function bytesToInts(bArray, offs=0) {
    let offset = offs;
    const A = (bArray[offset] << 24) | (bArray[offset + 1] << 16) | (bArray[offset + 2] << 8) | bArray[offset + 3];
    offset += 4;
    const B = (bArray[offset] << 24) | (bArray[offset + 1] << 16) | (bArray[offset + 2] << 8) | bArray[offset + 3];
    offset += 4;
    const C = (bArray[offset] << 24) | (bArray[offset + 1] << 16) | (bArray[offset + 2] << 8) | bArray[offset + 3];
    offset += 4;
    const D = (bArray[offset] << 24) | (bArray[offset + 1] << 16) | (bArray[offset + 2] << 8) | bArray[offset + 3];
    return [A, B, C, D];
}

/**
 * Inverse of bytesToInts above; takes an array of 32-bit integers and turns it into an array of bytes.
 * Again, Big-Endian order.
 */
function intsToBytes(ints) {
    const bArr = [];
    for (let i = 0; i < ints.length; i++) {
        bArr.push((ints[i] >> 24) & 0xFF);
        bArr.push((ints[i] >> 16) & 0xFF);
        bArr.push((ints[i] >> 8) & 0xFF);
        bArr.push(ints[i] & 0xFF);
    }
    return bArr;
}

/**
 * Encrypt using SM4 using a given block cipher mode.
 *
 * @param {byteArray} message - The clear text message; any length under 32 Gb or so.
 * @param {byteArray} key - The cipher key, 16 bytes.
 * @param {byteArray} iv - The IV or nonce, 16 bytes (not used with ECB mode)
 * @param {string} mode - The block cipher mode "CBC", "ECB", "CFB", "OFB", "CTR".
 * @param {boolean} noPadding - Don't add PKCS#7 padding if set.
 * @returns {byteArray} - The cipher text.
 */
export function encryptSM4(message, key, iv, mode="ECB", noPadding=false) {
    const messageLength = message.length;
    if (messageLength === 0)
        return [];
    const roundKey = initSM4RoundKey(bytesToInts(key, 0));

    /* Pad with PKCS#7 if requested for ECB/CBC else add zeroes (which are sliced off at the end) */
    let padByte = 0;
    let nPadding = 16 - (message.length & 0xF);
    if (mode === "ECB" || mode === "CBC") {
        if (noPadding) {
            if (nPadding !== 16)
                throw new OperationError(`No padding requested in ${mode} mode but input is not a 16-byte multiple.`);
            nPadding = 0;
        } else
            padByte = nPadding;
    }
    for (let i = 0; i < nPadding; i++)
        message.push(padByte);

    const cipherText = [];
    switch (mode) {
        case "ECB":
            for (let i = 0; i < message.length; i += BLOCKSIZE)
                Array.prototype.push.apply(cipherText, intsToBytes(encryptBlockSM4(bytesToInts(message, i), roundKey)));
            break;
        case "CBC":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < message.length; i += BLOCKSIZE) {
                const block = bytesToInts(message, i);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                iv = encryptBlockSM4(block, roundKey);
                Array.prototype.push.apply(cipherText, intsToBytes(iv));
            }
            break;
        case "CFB":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < message.length; i += BLOCKSIZE) {
                iv = encryptBlockSM4(iv, roundKey);
                const block = bytesToInts(message, i);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                Array.prototype.push.apply(cipherText, intsToBytes(block));
                iv = block;
            }
            break;
        case "OFB":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < message.length; i += BLOCKSIZE) {
                iv = encryptBlockSM4(iv, roundKey);
                const block = bytesToInts(message, i);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                Array.prototype.push.apply(cipherText, intsToBytes(block));
            }
            break;
        case "CTR":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < message.length; i += BLOCKSIZE) {
                let iv2 = [...iv]; /* containing the IV + counter */
                iv2[3] += (i >> 4);/* Using a 32 bit counter here. 64 Gb encrypts should be enough for everyone. */
                iv2 = encryptBlockSM4(iv2, roundKey);
                const block = bytesToInts(message, i);
                block[0] ^= iv2[0]; block[1] ^= iv2[1];
                block[2] ^= iv2[2]; block[3] ^= iv2[3];
                Array.prototype.push.apply(cipherText, intsToBytes(block));
            }
            break;
        default:
            throw new OperationError("Invalid block cipher mode: "+mode);
    }
    if (mode !== "ECB" && mode !== "CBC")
        return cipherText.slice(0, messageLength);
    return cipherText;
}

/**
 * Decrypt using SM4 using a given block cipher mode.
 *
 * @param {byteArray} cipherText - The ciphertext
 * @param {byteArray} key - The cipher key, 16 bytes.
 * @param {byteArray} iv - The IV or nonce, 16 bytes (not used with ECB mode)
 * @param {string} mode - The block cipher mode "CBC", "ECB", "CFB", "OFB", "CTR"
 * @param {boolean] ignorePadding - If true, ignore padding issues in ECB/CBC mode.
 * @returns {byteArray} - The cipher text.
 */
export function decryptSM4(cipherText, key, iv, mode="ECB", ignorePadding=false) {
    const originalLength = cipherText.length;
    if (originalLength === 0)
        return [];
    let roundKey = initSM4RoundKey(bytesToInts(key, 0));

    if (mode === "ECB" || mode === "CBC") {
        /* Init decryption key */
        roundKey = roundKey.reverse();
        if ((originalLength & 0xF) !== 0 && !ignorePadding)
            throw new OperationError(`With ECB or CBC modes, the input must be divisible into 16 byte blocks. (${cipherText.length & 0xF} bytes extra)`);
    } else { /* Pad dummy bytes for other modes, chop them off at the end */
        while ((cipherText.length & 0xF) !== 0)
            cipherText.push(0);
    }

    const clearText = [];
    switch (mode) {
        case "ECB":
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE)
                Array.prototype.push.apply(clearText, intsToBytes(encryptBlockSM4(bytesToInts(cipherText, i), roundKey)));
            break;
        case "CBC":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                const block = encryptBlockSM4(bytesToInts(cipherText, i), roundKey);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                Array.prototype.push.apply(clearText, intsToBytes(block));
                iv = bytesToInts(cipherText, i);
            }
            break;
        case "CFB":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                iv = encryptBlockSM4(iv, roundKey);
                const block = bytesToInts(cipherText, i);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                Array.prototype.push.apply(clearText, intsToBytes(block));
                iv = bytesToInts(cipherText, i);
            }
            break;
        case "OFB":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                iv = encryptBlockSM4(iv, roundKey);
                const block = bytesToInts(cipherText, i);
                block[0] ^= iv[0]; block[1] ^= iv[1];
                block[2] ^= iv[2]; block[3] ^= iv[3];
                Array.prototype.push.apply(clearText, intsToBytes(block));
            }
            break;
        case "CTR":
            iv = bytesToInts(iv, 0);
            for (let i = 0; i < cipherText.length; i += BLOCKSIZE) {
                let iv2 = [...iv]; /* containing the IV + counter */
                iv2[3] += (i >> 4);/* Using a 32 bit counter here. 64 Gb encrypts should be enough for everyone. */
                iv2 = encryptBlockSM4(iv2, roundKey);
                const block = bytesToInts(cipherText, i);
                block[0] ^= iv2[0]; block[1] ^= iv2[1];
                block[2] ^= iv2[2]; block[3] ^= iv2[3];
                Array.prototype.push.apply(clearText, intsToBytes(block));
            }
            break;
        default:
            throw new OperationError(`Invalid block cipher mode: ${mode}`);
    }
    /* Check PKCS#7 padding */
    if (mode === "ECB" || mode === "CBC") {
        if (ignorePadding)
            return clearText;
        const padByte = clearText[clearText.length - 1];
        if (padByte > 16)
            throw new OperationError("Invalid PKCS#7 padding.");
        for (let i = 0; i < padByte; i++)
            if (clearText[clearText.length -i - 1] !== padByte)
                throw new OperationError("Invalid PKCS#7 padding.");
        return clearText.slice(0, clearText.length - padByte);
    }
    return clearText.slice(0, originalLength);
}

