/**
 * RC4 stream cipher implementation.
 * Replaces crypto-js RC4 for CyberChef operations.
 *
 * @author CyberChef Modernization
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * RC4 Key Scheduling Algorithm (KSA).
 *
 * @param {Uint8Array} key
 * @returns {Uint8Array} The initialized S-box
 */
function ksa(key) {
    const S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) S[i] = i;

    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key.length]) & 0xFF;
        [S[i], S[j]] = [S[j], S[i]];
    }
    return S;
}

/**
 * RC4 Pseudo-Random Generation Algorithm (PRGA).
 *
 * @param {Uint8Array} S - The S-box from KSA
 * @param {number} length - Number of keystream bytes to generate
 * @param {number} [drop=0] - Number of initial bytes to drop
 * @returns {Uint8Array} Keystream bytes
 */
function prga(S, length, drop = 0) {
    const output = new Uint8Array(length);
    let i = 0, j = 0;

    // Drop initial bytes
    for (let d = 0; d < drop; d++) {
        i = (i + 1) & 0xFF;
        j = (j + S[i]) & 0xFF;
        [S[i], S[j]] = [S[j], S[i]];
    }

    // Generate keystream
    for (let k = 0; k < length; k++) {
        i = (i + 1) & 0xFF;
        j = (j + S[i]) & 0xFF;
        [S[i], S[j]] = [S[j], S[i]];
        output[k] = S[(S[i] + S[j]) & 0xFF];
    }
    return output;
}

/**
 * Encrypt/decrypt data using RC4.
 * RC4 is symmetric — encryption and decryption are the same operation.
 *
 * @param {Uint8Array} data - Input data
 * @param {Uint8Array} key - Key bytes
 * @param {number} [drop=0] - Number of initial keystream bytes to drop (for RC4-drop)
 * @returns {Uint8Array} Output data
 */
export function rc4(data, key, drop = 0) {
    const S = ksa(key);
    const keystream = prga(S, data.length, drop);
    const output = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        output[i] = data[i] ^ keystream[i];
    }
    return output;
}
