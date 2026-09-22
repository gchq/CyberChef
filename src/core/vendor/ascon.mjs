/**
 * Ascon MAC implementation following NIST SP 800-232
 * Vendor file for CyberChef
 *
 * @author Medjedtxm 
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/**
 * NIST SP 800-232 compliant Ascon-Mac implementation
 * Uses little-endian byte ordering as per NIST specification
 */
class AsconMac {
    // NIST SP 800-232 constants
    static ASCON_MAC_IV = 0x0010200080cc0005n;
    static ASCON_PRF_IN_RATE = 32; // 4 * 8 bytes
    static ASCON_PRF_OUT_RATE = 16; // 2 * 8 bytes

    /**
     * Compute Ascon-Mac tag
     * @param {Uint8Array} key - 16-byte key
     * @param {Uint8Array} message - Message to authenticate
     * @param {number} tagLength - Output tag length (default 16)
     * @returns {Uint8Array} - MAC tag
     */
    static mac(key, message, tagLength = 16) {
        if (key.length !== 16) {
            throw new Error(`Invalid key length: ${key.length} bytes. Ascon-Mac requires exactly 16 bytes.`);
        }

        // Initialise state
        const state = new BigUint64Array(5);

        // Load key as two 64-bit words (little-endian per NIST SP 800-232)
        const K0 = AsconMac.loadBytes(key, 0, 8);
        const K1 = AsconMac.loadBytes(key, 8, 8);

        // Set initial value per NIST SP 800-232
        state[0] = AsconMac.ASCON_MAC_IV;
        state[1] = K0;
        state[2] = K1;
        state[3] = 0n;
        state[4] = 0n;

        // Initial permutation P12
        AsconMac.permutation(state, 12);

        // Absorb message in 8-byte chunks, cycling through state[0..3]
        let pos = 0;
        let wordIdx = 0;

        while (pos + 8 <= message.length) {
            state[wordIdx] ^= AsconMac.loadBytes(message, pos, 8);
            wordIdx++;
            if (wordIdx === 4) {
                wordIdx = 0;
                AsconMac.permutation(state, 12);
            }
            pos += 8;
        }

        // Absorb final partial block with padding
        const remaining = message.length - pos;
        if (remaining > 0) {
            state[wordIdx] ^= AsconMac.loadBytes(message, pos, remaining);
        }
        // PAD(remaining) = 0x01 << (8 * remaining)
        state[wordIdx] ^= 0x01n << BigInt(8 * remaining);

        // Domain separation: DSEP() = 0x80 << 56 = 0x8000000000000000
        state[4] ^= 0x8000000000000000n;

        // Finalisation permutation P12
        AsconMac.permutation(state, 12);

        // Squeeze output
        const tag = new Uint8Array(tagLength);
        let outPos = 0;
        wordIdx = 0;

        while (outPos < tagLength) {
            const toCopy = Math.min(8, tagLength - outPos);
            AsconMac.storeBytes(tag, outPos, state[wordIdx], toCopy);
            outPos += toCopy;
            wordIdx++;
            if (wordIdx === 2 && outPos < tagLength) {
                wordIdx = 0;
                AsconMac.permutation(state, 12);
            }
        }

        return tag;
    }

    /**
     * Load n bytes as little-endian 64-bit integer (NIST SP 800-232 byte order)
     * LOADBYTES: bytes[i] goes to position i (byte 0 = LSB)
     */
    static loadBytes(arr, offset, n) {
        let result = 0n;
        for (let i = 0; i < n && offset + i < arr.length; i++) {
            result |= BigInt(arr[offset + i]) << BigInt(i * 8);
        }
        return result;
    }

    /**
     * Store n bytes from 64-bit integer in little-endian order
     * STOREBYTES: position i goes to bytes[i] (LSB = byte 0)
     */
    static storeBytes(arr, offset, val, n) {
        for (let i = 0; i < n; i++) {
            arr[offset + i] = Number((val >> BigInt(i * 8)) & 0xFFn);
        }
    }

    /**
     * Ascon permutation
     */
    static permutation(state, rounds) {
        for (let r = 12 - rounds; r < 12; r++) {
            // Add round constant
            state[2] ^= BigInt(0xf0 - r * 0x10 + r);

            // Substitution layer
            state[0] ^= state[4];
            state[4] ^= state[3];
            state[2] ^= state[1];

            const t0 = state[0] ^ (~state[1] & state[2]);
            const t1 = state[1] ^ (~state[2] & state[3]);
            const t2 = state[2] ^ (~state[3] & state[4]);
            const t3 = state[3] ^ (~state[4] & state[0]);
            const t4 = state[4] ^ (~state[0] & state[1]);

            state[0] = t0 ^ t4;
            state[1] = t1 ^ t0;
            state[2] = ~t2;
            state[3] = t3 ^ t2;
            state[4] = t4;

            // Linear diffusion layer
            state[0] ^= AsconMac.rotr64(state[0], 19n) ^ AsconMac.rotr64(state[0], 28n);
            state[1] ^= AsconMac.rotr64(state[1], 61n) ^ AsconMac.rotr64(state[1], 39n);
            state[2] ^= AsconMac.rotr64(state[2], 1n) ^ AsconMac.rotr64(state[2], 6n);
            state[3] ^= AsconMac.rotr64(state[3], 10n) ^ AsconMac.rotr64(state[3], 17n);
            state[4] ^= AsconMac.rotr64(state[4], 7n) ^ AsconMac.rotr64(state[4], 41n);
        }
    }

    /**
     * 64-bit rotate right
     */
    static rotr64(val, n) {
        const mask = 0xFFFFFFFFFFFFFFFFn;
        val = val & mask;
        return ((val >> n) | (val << (64n - n))) & mask;
    }
}

export default AsconMac;
