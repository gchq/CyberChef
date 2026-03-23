/**
 * Hashing resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import { md5, sha1, ripemd160 } from "@noble/hashes/legacy";
import { sha224, sha256, sha384, sha512, sha512_224, sha512_256 } from "@noble/hashes/sha2";
import { sha3_224, sha3_256, sha3_384, sha3_512 } from "@noble/hashes/sha3";
import { hmac } from "@noble/hashes/hmac";
import { hkdf } from "@noble/hashes/hkdf";
import { bytesToHex } from "@noble/hashes/utils";
import CryptoApi from "crypto-api/src/crypto-api.mjs";

/**
 * Map of hash algorithm names (lowercased) to noble hash functions.
 */
const NOBLE_HASH_FUNCTIONS = {
    "md5": md5,
    "sha1": sha1,
    "sha224": sha224,
    "sha256": sha256,
    "sha384": sha384,
    "sha512": sha512,
    "sha512/224": sha512_224,
    "sha512/256": sha512_256,
    "sha3-224": sha3_224,
    "sha3-256": sha3_256,
    "sha3-384": sha3_384,
    "sha3-512": sha3_512,
    "ripemd160": ripemd160,
    // Legacy aliases
    "sha-1": sha1,
    "sha-224": sha224,
    "sha-256": sha256,
    "sha-384": sha384,
    "sha-512": sha512,
};

/**
 * Gets a noble hash function by name. Returns null if not supported by noble.
 *
 * @param {string} name - Hash algorithm name (case-insensitive)
 * @returns {Function|null} Noble hash function or null
 */
export function getHashFunction(name) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, "");
    return NOBLE_HASH_FUNCTIONS[normalizedName] || null;
}

/**
 * Generic hash function.
 * Uses @noble/hashes for common algorithms, falls back to crypto-api for legacy ones.
 *
 * @param {string} name
 * @param {ArrayBuffer} input
 * @param {Object} [options={}]
 * @returns {string}
 */
export function runHash(name, input, options={}) {
    const hashFn = getHashFunction(name);

    if (hashFn) {
        // Use noble for supported algorithms
        const data = new Uint8Array(input);
        return bytesToHex(hashFn(data));
    }

    // Fall back to crypto-api for legacy algorithms (Snefru, Whirlpool, MD2, MD4, SHA0, HAS160, etc.)
    const msg = Utils.arrayBufferToStr(input, false),
        hasher = CryptoApi.getHasher(name, options);
    hasher.update(msg);
    return CryptoApi.encoder.toHex(hasher.finalize());
}

export { hmac, hkdf, bytesToHex };
