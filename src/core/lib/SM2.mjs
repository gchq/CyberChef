/**
 * Utilities and operations utilized for SM2 encryption and decryption
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { fromHex } from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";
import Sm3 from "crypto-api/src/hasher/sm3.mjs";
import { toHex } from "crypto-api/src/encoder/hex.mjs";
import { weierstrass, ecdh } from "@noble/curves/abstract/weierstrass.js";
import { bytesToNumberBE } from "@noble/curves/utils.js";

// SM2 curve parameter sets. The Weierstrass `Point` ctor is built lazily on
// first use and memoised across SM2 instances.
const SM2_CURVES = {
    // GM/T 0003-2012 / sm2p256v1 — p = 2^256 - 2^224 - 2^96 + 2^64 - 1
    sm2p256v1: {
        p:  BigInt("0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF"),
        n:  BigInt("0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123"),
        h:  BigInt(1),
        a:  BigInt("0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC"),
        b:  BigInt("0x28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93"),
        Gx: BigInt("0x32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7"),
        Gy: BigInt("0xBC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0"),
        coordCharLen: 64,
    },
};

const curveCache = {};

/**
 * Resolve a named SM2 curve to its Point constructor, order, hex width and
 * random-scalar helper. Builds the underlying Weierstrass curve lazily.
 *
 * @param {string} name
 * @returns {{Point: Function, n: bigint, coordCharLen: number, randomScalar: () => bigint}}
 */
function getCurve(name) {
    if (!Object.prototype.hasOwnProperty.call(SM2_CURVES, name)) {
        throw new OperationError(`Unsupported SM2 curve: ${name}`);
    }
    if (curveCache[name]) return curveCache[name];
    const params = SM2_CURVES[name];
    const Point = weierstrass({
        p: params.p,
        n: params.n,
        h: params.h,
        a: params.a,
        b: params.b,
        Gx: params.Gx,
        Gy: params.Gy,
    });
    const dh = ecdh(Point);
    const cached = {
        Point,
        n: params.n,
        coordCharLen: params.coordCharLen,
        // Uniform-ish random scalar in [1, n-1]. The modulo reduction keeps
        // the existing scalar-generation distribution for SM2 ciphertexts.
        randomScalar: () => bytesToNumberBE(dh.utils.randomSecretKey()) % (params.n - 1n) + 1n,
    };
    curveCache[name] = cached;
    return cached;
}

/**
 * SM2 Class for encryption and decryption operations
 */
export class SM2 {
    /**
     * @param {string} curve - named SM2 curve (e.g. "sm2p256v1")
     * @param {string} format - "C1C3C2" or "C1C2C3"
     */
    constructor(curve, format) {
        const c = getCurve(curve);
        this.Point = c.Point;
        this.n = c.n;
        this.coordCharLen = c.coordCharLen;
        this.randomScalar = c.randomScalar;
        this.format = format;
    }

    /**
     * Set the public key coordinates for the SM2 class
     *
     * @param {string} publicKeyX
     * @param {string} publicKeyY
     */
    setPublicKey(publicKeyX, publicKeyY) {
        try {
            this.publicKey = this.Point.fromHex("04" + publicKeyX + publicKeyY);
        } catch (e) {
            throw new OperationError("Invalid Public Key");
        }
        if (this.publicKey.is0()) {
            throw new OperationError("Invalid Public Key");
        }
    }

    /**
     * Set the private key value for the SM2 class
     *
     * @param {string} privateKeyHex
     */
    setPrivateKey(privateKeyHex) {
        this.privateKey = BigInt("0x" + privateKeyHex);
    }

    /**
     * Main encryption function; takes user input, processes encryption and returns the result in hex (with the components arranged as configured by the user args)
     *
     * @param {Uint8Array} input
     * @returns {string}
     */
    encrypt(input) {
        /*
        * Compute a new, random public key along the same elliptic curve to form the starting point for our encryption process (record the resulting X and Y as hex to provide as part of the operation output)
        * k: Randomly generated bigint in [1, n-1]
        * c1: Result of dotting our curve generator point with the value of `k`
        */
        const k = this.randomScalar();
        const c1 = this.Point.BASE.multiply(k);
        const [hexC1X, hexC1Y] = this.getPointAsHex(c1);

        /*
        * Compute p2 (secret) using the public key, and the chosen k value above
        */
        const p2 = this.publicKey.multiply(k);

        /*
        * Compute the C3 SM3 hash before we transform the array
        */
        const c3 = this.c3(p2, input);

        /*
        * Generate a proper length encryption key, XOR iteratively, and convert newly encrypted data to hex
        */
        const key = this.kdf(p2, input.byteLength);
        for (let i = 0; i < input.byteLength; i++) {
            input[i] ^= Utils.ord(key[i]);
        }
        const c2 = Buffer.from(input).toString("hex");

        /*
         * Check user input specs; order the output components as selected
         */
        if (this.format === "C1C3C2") {
            return hexC1X + hexC1Y + c3 + c2;
        } else {
            return hexC1X + hexC1Y + c2 + c3;
        }
    }

    /**
     * Function to decrypt an SM2 encrypted message
     *
     * @param {string} input
     * @returns {ArrayBuffer}
     */
    decrypt(input) {
        const c1X = input.slice(0, 64);
        const c1Y = input.slice(64, 128);

        let c3 = "";
        let c2 = "";

        if (this.format === "C1C3C2") {
            c3 = input.slice(128, 192);
            c2 = input.slice(192);
        } else {
            c2 = input.slice(128, -64);
            c3 = input.slice(-64);
        }
        c2 = Uint8Array.from(fromHex(c2));

        let c1;
        try {
            c1 = this.Point.fromHex("04" + c1X + c1Y);
        } catch (e) {
            throw new OperationError("Decryption Error -- Invalid Ciphertext Point");
        }

        /*
        * Compute the p2 (secret) value by taking the C1 point provided in the encrypted package, and multiplying by the private k value
        */
        const p2 = c1.multiply(this.privateKey);

        /*
         * Similar to encryption; compute sufficient length key material and XOR the input data to recover the original message
         */
        const key = this.kdf(p2, c2.byteLength);

        for (let i = 0; i < c2.byteLength; i++) {
            c2[i] ^= Utils.ord(key[i]);
        }

        const check = this.c3(p2, c2);
        if (check === c3) {
            return c2.buffer;
        } else {
            throw new OperationError("Decryption Error -- Computed Hashes Do Not Match");
        }
    }

    /**
     * SM2 Key Derivation Function (KDF); Takes P2 point, and generates a key material stream large enough to encrypt all of the input data
     *
     * @param {WeierstrassPoint} p2
     * @param {number} len
     * @returns {string}
     */
    kdf(p2, len) {
        const [hX, hY] = this.getPointAsHex(p2);

        const total = Math.ceil(len / 32) + 1;
        let cnt = 1;

        let keyMaterial = "";

        while (cnt < total) {
            const num = Utils.intToByteArray(cnt, 4, "big");
            const overall = fromHex(hX).concat(fromHex(hY)).concat(num);
            keyMaterial += this.sm3(overall);
            cnt++;
        }
        return keyMaterial;
    }

    /**
     * Calculates the C3 component of our final encrypted payload; which is the SM3 hash of the P2 point and the original, unencrypted input data
     *
     * @param {WeierstrassPoint} p2
     * @param {Uint8Array} input
     * @returns {string}
     */
    c3(p2, input) {
        const [hX, hY] = this.getPointAsHex(p2);

        const overall = fromHex(hX).concat(Array.from(input)).concat(fromHex(hY));

        return toHex(this.sm3(overall));
    }

    /**
     * SM3 setup helper function; takes input data as an array, processes the hash and returns the result
     *
     * @param {number[]} data
     * @returns {string}
     */
    sm3(data) {
        const hashData = Utils.arrayBufferToStr(Uint8Array.from(data).buffer, false);
        const hasher = new Sm3();
        hasher.update(hashData);
        return hasher.finalize();
    }

    /**
     * Utility function, returns an elliptic curve point's X and Y values as fixed-width hex
     *
     * @param {WeierstrassPoint} point
     * @returns {[string, string]}
     */
    getPointAsHex(point) {
        const { x, y } = point.toAffine();
        const charlen = this.coordCharLen;
        const hX = x.toString(16).padStart(charlen, "0");
        const hY = y.toString(16).padStart(charlen, "0");
        return [hX, hY];
    }
}
