/**
 * Building blocks for the AUTOSAR SHE (Secure Hardware Extension) memory
 * update protocol: the key slot identifiers, the protection flags, the
 * memory update constants, the SHE key derivation function and the AES
 * primitives it is built on.
 *
 * Reference:
 *   https://www.autosar.org/fileadmin/standards/R22-11/FO/AUTOSAR_TR_SecureHardwareExtensions.pdf
 *
 * @author MannXo [prmma23@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import forge from "node-forge";
import { fromHex } from "./Hex.mjs";

/**
 * SHE key slot identifiers as defined by the AUTOSAR SHE specification.
 */
export const KEY_SLOTS = {
    "SECRET_KEY": 0x0,
    "MASTER_ECU_KEY": 0x1,
    "BOOT_MAC_KEY": 0x2,
    "BOOT_MAC": 0x3,
    "KEY_1": 0x4,
    "KEY_2": 0x5,
    "KEY_3": 0x6,
    "KEY_4": 0x7,
    "KEY_5": 0x8,
    "KEY_6": 0x9,
    "KEY_7": 0xa,
    "KEY_8": 0xb,
    "KEY_9": 0xc,
    "KEY_10": 0xd,
    "RAM_KEY": 0xe,
};

/**
 * Key slot names, in slot order.
 */
export const SLOT_NAMES = Object.keys(KEY_SLOTS);

/**
 * Protection flags, in the bit order they occupy in FID.
 */
export const FLAGS = {
    "Write protection": 0b100000,
    "Boot protection": 0b010000,
    "Debugger protection": 0b001000,
    "Key usage": 0b000100,
    "Wildcard": 0b000010,
    "Verify only (SHE+)": 0b000001,
};

/**
 * Memory update constants KEY_UPDATE_ENC_C and KEY_UPDATE_MAC_C, per variant.
 */
export const CONSTANTS = {
    "SHE": {
        "enc": "010153484500800000000000000000b0",
        "mac": "010253484500800000000000000000b0",
    },
    "SHE+": {
        "enc": "018153484500800000000000000000b0",
        "mac": "018253484500800000000000000000b0",
    },
};

/**
 * The counter (CID) is a 28-bit value.
 */
export const MAX_COUNTER = 0xfffffff;

/**
 * Converts a byte string into a Uint8Array.
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function strToBytes(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        out[i] = str.charCodeAt(i);
    }
    return out;
}

/**
 * Encodes an unsigned integer as a 4-byte big-endian Uint8Array.
 *
 * @param {number} value
 * @returns {Uint8Array}
 */
export function uint32ToBytes(value) {
    return new Uint8Array([
        Math.floor(value / 0x1000000) & 0xff,
        Math.floor(value / 0x10000) & 0xff,
        Math.floor(value / 0x100) & 0xff,
        value & 0xff,
    ]);
}

/**
 * Concatenates two Uint8Arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
export function concat(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
}

/**
 * XORs two equal-length Uint8Arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function xor(a, b) {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        out[i] = a[i] ^ b[i];
    }
    return out;
}

/**
 * Converts a Uint8Array into a forge byte string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toForge(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

/**
 * AES-128 ECB encryption of a single 16-byte block.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} block
 * @returns {Uint8Array}
 */
export function aesEcbEncryptBlock(key, block) {
    const cipher = forge.cipher.createCipher("AES-ECB", toForge(key));
    cipher.start();
    cipher.update(forge.util.createBuffer(toForge(block)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return strToBytes(out.substring(0, 16));
}

/**
 * AES-128 CBC encryption with a zero IV, no padding.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function aesCbcEncrypt(key, data) {
    const cipher = forge.cipher.createCipher("AES-CBC", toForge(key));
    cipher.start({iv: toForge(new Uint8Array(16))});
    cipher.update(forge.util.createBuffer(toForge(data)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return strToBytes(out.substring(0, data.length));
}

/**
 * SHE key derivation function: the Miyaguchi-Preneel one-way compression
 * of the key concatenated with the given memory update constant.
 *
 * @param {Uint8Array} key
 * @param {string} constant - the constant as a hex string
 * @returns {Uint8Array}
 */
export function kdf(key, constant) {
    const data = concat(key, new Uint8Array(fromHex(constant, "None")));
    let g = new Uint8Array(16);
    for (let i = 0; i < data.length; i += 16) {
        const block = data.subarray(i, i + 16);
        g = xor(xor(aesEcbEncryptBlock(g, block), block), g);
    }
    return g;
}

/**
 * AES-128-CMAC (RFC 4493).
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
export function aesCmac(key, message) {
    const Rb = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x87]);
    const cipher = forge.cipher.createCipher("AES-ECB", toForge(key));
    const encrypt = function(block) {
        cipher.start();
        cipher.update(forge.util.createBuffer(toForge(block)));
        cipher.finish();
        return strToBytes(cipher.output.getBytes().substring(0, 16));
    };

    const leftShift1 = function(a) {
        const out = new Uint8Array(a.length);
        let carry = 0;
        for (let i = a.length - 1; i >= 0; i--) {
            out[i] = ((a[i] << 1) | carry) & 0xff;
            carry = a[i] >> 7;
        }
        return out;
    };

    const L = encrypt(new Uint8Array(16));
    let k1 = leftShift1(L);
    if (L[0] & 0x80) k1 = xor(k1, Rb);
    let k2 = leftShift1(k1);
    if (k1[0] & 0x80) k2 = xor(k2, Rb);

    const n = Math.ceil(message.length / 16);
    let lastBlock;
    if (n === 0) {
        lastBlock = new Uint8Array(k2);
        lastBlock[0] ^= 0x80;
    } else {
        const last = message.subarray(16 * (n - 1));
        if (last.length === 16) {
            lastBlock = xor(last, k1);
        } else {
            const padded = new Uint8Array(16);
            padded.set(last, 0);
            padded[last.length] = 0x80;
            lastBlock = xor(padded, k2);
        }
    }

    let x = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++) {
        x = encrypt(xor(x, message.subarray(16 * i, 16 * i + 16)));
    }
    return encrypt(xor(lastBlock, x));
}
