/**
 * XXTEA library
 *
 * Encryption Algorithm Authors:
 *     David J. Wheeler
 *     Roger M. Needham
 *
 * @author Ma Bingyao [mabingyao@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 * @license MIT
 */

const DELTA = 0x9E3779B9;

/**
 * Convert a buffer to a Uint8Array
 * @param {Uint32Array} v
 * @param {boolean} includeLength
 * @returns {Uint8Array}
 */
function toUint8Array(v, includeLength) {
    const length = v.length;
    let n = length << 2;
    if (includeLength) {
        const m = v[length - 1];
        n -= 4;
        if ((m < n - 3) || (m > n)) {
            return null;
        }
        n = m;
    }
    const bytes = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        bytes[i] = v[i >> 2] >> ((i & 3) << 3);
    }
    return bytes;
}

/**
 * Convert a buffer to a Uint32Array
 * @param {TypedArray} bs
 * @param {boolean} includeLength
 * @returns {Uint32Array}
 */
function toUint32Array(bs, includeLength) {
    const length = bs.length;
    let n = length >> 2;
    if ((length & 3) !== 0) {
        ++n;
    }
    let v;
    if (includeLength) {
        v = new Uint32Array(n + 1);
        v[n] = length;
    } else {
        v = new Uint32Array(n);
    }
    for (let i = 0; i < length; ++i) {
        v[i >> 2] |= bs[i] << ((i & 3) << 3);
    }
    return v;
}

/**
 * Mask an int to 32 bits
 * @param {number} i
 * @returns {number}
 */
function int32(i) {
    return i & 0xFFFFFFFF;
}

/**
 * MX function for data randomisation
 * @param {number} sum
 * @param {number} y
 * @param {number} z
 * @param {number} p
 * @param {number} e
 * @param {number} k
 * @returns {number}
 */
function mx(sum, y, z, p, e, k) {
    return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z));
}

/**
 * Ensure an array is a multiple of 16 bits
 * @param {TypedArray} k
 * @returns {TypedArray}
 */
function fixk(k) {
    if (k.length < 16) {
        const key = new Uint8Array(16);
        key.set(k);
        return key;
    }
    return k;
}

/**
 * Performs XXTEA encryption on a Uint32Array
 * @param {Uint32Array} v
 * @param {Uint32Array} k
 * @returns {Uint32Array}
 */
function encryptUint32Array(v, k) {
    const length = v.length;
    const n = length - 1;
    let y, z, sum, e, p, q;
    z = v[n];
    sum = 0;
    for (q = Math.floor(6 + 52 / length) | 0; q > 0; --q) {
        sum = int32(sum + DELTA);
        e = sum >>> 2 & 3;
        for (p = 0; p < n; ++p) {
            y = v[p + 1];
            z = v[p] = int32(v[p] + mx(sum, y, z, p, e, k));
        }
        y = v[0];
        z = v[n] = int32(v[n] + mx(sum, y, z, n, e, k));
    }
    return v;
}

/**
 * Performs XXTEA decryption on a Uint32Array
 * @param {Uint32Array} v
 * @param {Uint32Array} k
 * @returns {Uint32Array}
 */
function decryptUint32Array(v, k) {
    const length = v.length;
    const n = length - 1;
    let y, z, sum, e, p;
    y = v[0];
    const q = Math.floor(6 + 52 / length);
    for (sum = int32(q * DELTA); sum !== 0; sum = int32(sum - DELTA)) {
        e = sum >>> 2 & 3;
        for (p = n; p > 0; --p) {
            z = v[p - 1];
            y = v[p] = int32(v[p] - mx(sum, y, z, p, e, k));
        }
        z = v[n];
        y = v[0] = int32(v[0] - mx(sum, y, z, 0, e, k));
    }
    return v;
}

/**
 * Encrypt function
 * @param {TypedArray} data
 * @param {TypedArray} key
 * @returns {Uint8Array}
 */
export function encrypt(data, key) {
    if (data === undefined || data === null || data.length === 0) {
        return data;
    }
    return toUint8Array(encryptUint32Array(toUint32Array(data, true), toUint32Array(fixk(key), false)), false);
}

/**
 * Decrypt function
 * @param {TypedArray} data
 * @param {TypedArray} key
 * @returns {Uint8Array}
 */
export function decrypt(data, key) {
    if (data === undefined || data === null || data.length === 0) {
        return data;
    }
    return toUint8Array(decryptUint32Array(toUint32Array(data, false), toUint32Array(fixk(key), false)), true);
}
