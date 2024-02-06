/**
 * Based on murmurhash-js (https://github.com/garycourt/murmurhash-js)
 * @author Gary Court
 * @license MIT
 *
 * @author AliceGrey [alice@grey.systems]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * MurmurHash3 operation
 */
class MurmurHash3 extends Operation {

    /**
     * MurmurHash3 constructor
     */
    constructor() {
        super();

        this.name = "MurmurHash3";
        this.module = "Default";
        this.description = "Generates a MurmurHash v3 for a string input and an optional seed input";
        this.infoURL = "https://wikipedia.org/wiki/MurmurHash";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [
            {
                name: "Seed",
                type: "number",
                value: 0
            },
            {
                name: "Convert to Signed",
                type: "boolean",
                value: false
            }
        ];
    }

 /**
 * Calculates the MurmurHash3 hash of the input.
 * Based on Gary Court's JS MurmurHash implementation
 * @see http://github.com/garycourt/murmurhash-js
 * @author AliceGrey [alice@grey.systems]
 * @param {string} input ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
    mmh3(input, seed) {
        let h1b;
        let k1;
        const remainder = input.length & 3; // input.length % 4
        const bytes = input.length - remainder;
        let h1 = seed;
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;
        let i = 0;

        while (i < bytes) {
            k1 =
                ((input.charCodeAt(i) & 0xff)) |
                ((input.charCodeAt(++i) & 0xff) << 8) |
                ((input.charCodeAt(++i) & 0xff) << 16) |
                ((input.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        if (remainder === 3) {
            k1 ^= (input.charCodeAt(i + 2) & 0xff) << 16;
        }

        if (remainder === 3 || remainder === 2) {
            k1 ^= (input.charCodeAt(i + 1) & 0xff) << 8;
        }

        if (remainder === 3 || remainder === 2 || remainder === 1) {
            k1 ^= (input.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= input.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    }

    /**
    * Converts an unsigned 32-bit integer to a signed 32-bit integer
    * @author AliceGrey [alice@grey.systems]
    * @param {value} 32-bit unsigned integer
    * @return {number} 32-bit signed integer
    */
    unsignedToSigned(value) {
        if (value & 0x80000000) {
            return -0x100000000 + value;
        } else {
            return value;
        }
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        if (args && args.length >= 1) {
            const seed = args[0];
            const hash = this.mmh3(input, seed);
            if (args.length > 1 && args[1]) {
                return this.unsignedToSigned(hash);
            }
            return hash;
        }
        return this.mmh3(input);
    }
}

export default MurmurHash3;
