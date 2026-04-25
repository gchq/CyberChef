/**
 * @license Apache-2.0
 */

import forge from "node-forge";
import { toByteString } from "./PaymentUtils.mjs";

/**
 * Encrypts one 8-byte block with DES ECB.
 *
 * @param {Uint8Array} key8
 * @param {Uint8Array} block8
 * @returns {Uint8Array}
 */
function encryptDesEcb(key8, block8) {
    const cipher = forge.cipher.createCipher("DES-ECB", toByteString(key8));
    cipher.mode.pad = function() {
        return true;
    };
    cipher.start();
    cipher.update(forge.util.createBuffer(toByteString(block8)));
    cipher.finish();
    return Uint8Array.from(cipher.output.getBytes().split("").map(ch => ch.charCodeAt(0))).slice(0, 8);
}

/**
 * Encrypts one 8-byte block with 3DES ECB.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} block8
 * @returns {Uint8Array}
 */
function encryptTdesEcb(key, block8) {
    const normalizedKey = key.length === 16 ? Uint8Array.from([...key, ...key.slice(0, 8)]) : key;
    const cipher = forge.cipher.createCipher("3DES-ECB", toByteString(normalizedKey));
    cipher.mode.pad = function() {
        return true;
    };
    cipher.start();
    cipher.update(forge.util.createBuffer(toByteString(block8)));
    cipher.finish();
    return Uint8Array.from(cipher.output.getBytes().split("").map(ch => ch.charCodeAt(0))).slice(0, 8);
}

export {
    encryptDesEcb,
    encryptTdesEcb,
};
