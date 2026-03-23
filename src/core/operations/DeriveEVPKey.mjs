/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { md5, sha1 } from "@noble/hashes/legacy";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";

/**
 * Map of hash function names to noble implementations.
 */
const HASH_MAP = {
    "MD5": md5,
    "SHA1": sha1,
    "SHA256": sha256,
    "SHA384": sha384,
    "SHA512": sha512,
};

/**
 * EVP_BytesToKey key derivation function (OpenSSL).
 * Derives key material from password + salt using iterated hashing.
 *
 * @param {Uint8Array} password
 * @param {Uint8Array} salt
 * @param {number} keySize - Key size in bytes
 * @param {number} iterations
 * @param {Function} hashFn - Noble hash function
 * @returns {Uint8Array}
 */
function evpKDF(password, salt, keySize, iterations, hashFn) {
    let derivedKey = new Uint8Array(0);
    let block = new Uint8Array(0);

    while (derivedKey.length < keySize) {
        // Concatenate previous block + password + salt
        const input = new Uint8Array(block.length + password.length + salt.length);
        input.set(block, 0);
        input.set(password, block.length);
        input.set(salt, block.length + password.length);

        // Hash with iterations
        block = hashFn(input);
        for (let i = 1; i < iterations; i++) {
            block = hashFn(block);
        }

        // Append to derived key
        const combined = new Uint8Array(derivedKey.length + block.length);
        combined.set(derivedKey, 0);
        combined.set(block, derivedKey.length);
        derivedKey = combined;
    }

    return derivedKey.slice(0, keySize);
}

/**
 * Derive EVP key operation
 */
class DeriveEVPKey extends Operation {

    /**
     * DeriveEVPKey constructor
     */
    constructor() {
        super();

        this.name = "Derive EVP key";
        this.module = "Ciphers";
        this.description = "This operation performs a password-based key derivation function (PBKDF) used extensively in OpenSSL. In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.<br><br>A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.<br><br>If you leave the salt argument empty, a random salt will be generated.";
        this.infoURL = "https://wikipedia.org/wiki/Key_derivation_function";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Passphrase",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8", "Latin1", "Hex", "Base64"]
            },
            {
                "name": "Key size",
                "type": "number",
                "value": 128
            },
            {
                "name": "Iterations",
                "type": "number",
                "value": 1
            },
            {
                "name": "Hashing function",
                "type": "option",
                "value": ["SHA1", "SHA256", "SHA384", "SHA512", "MD5"]
            },
            {
                "name": "Salt",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const passStr = Utils.convertToByteString(args[0].string, args[0].option);
        const keySize = args[1] / 8; // Convert bits to bytes
        const iterations = args[2];
        const hasherName = args[3];
        const saltStr = Utils.convertToByteString(args[4].string, args[4].option);

        const hashFn = HASH_MAP[hasherName];
        if (!hashFn) {
            throw new Error(`Unsupported hash function: ${hasherName}`);
        }

        // Convert strings to Uint8Array
        const password = new Uint8Array(passStr.length);
        for (let i = 0; i < passStr.length; i++) password[i] = passStr.charCodeAt(i) & 0xFF;

        const salt = new Uint8Array(saltStr.length);
        for (let i = 0; i < saltStr.length; i++) salt[i] = saltStr.charCodeAt(i) & 0xFF;

        const key = evpKDF(password, salt, keySize, iterations, hashFn);
        return bytesToHex(key);
    }

}

export default DeriveEVPKey;
