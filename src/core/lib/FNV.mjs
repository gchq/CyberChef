/**
 * FNV resources.
 *
 * @license CC0-1.0
 */

// http://www.isthe.com/chongo/tech/comp/fnv/index.html#FNV-param
export const FNV_OPTIONS = {
    32: {
        prime: 0x01000193n,
        init: 0x811c9dc5n,
        size: 32
    },
    64: {
        prime: 0x100000001b3n,
        init: 0xcbf29ce484222325n,
        size: 64
    },
    128: {
        prime: 0x0000000001000000000000000000013Bn,
        init: 0x6c62272e07bb014262b821756295c58dn,
        size: 128
    },
    256: {
        prime: 0x0000000000000000000001000000000000000000000000000000000000000163n,
        init: 0xdd268dbcaac550362d98c384c4e576ccc8b1536847b6bbb31023b4c8caee0535n,
        size: 256
    }
};

/**
 * Computes a FNV-1 hash of the data
 *
 * @param {Uint8Array} data
 * @param {Object} options
 * @returns {BigInt}
 */
export function fnv1(data, options) {
    let hash = options.init;

    for (let i = 0; i < data.length; i++) {
        hash *= options.prime;
        hash = BigInt.asUintN(options.size, hash ^ BigInt(data[i]));
    }

    return hash;
}

/**
 * Computes a FNV-1a hash of the data
 *
 * @param {Uint8Array} data
 * @param {Object} options
 * @returns {BigInt}
 */
export function fnv1a(data, options) {
    let hash = options.init;

    for (let i = 0; i < data.length; i++) {
        hash ^= BigInt(data[i]);
        hash = BigInt.asUintN(options.size, hash * options.prime);
    }

    return hash;
}
