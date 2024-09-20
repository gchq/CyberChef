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
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import r from "jsrsasign";

export class SM2 {
    constructor(curve, format) {
        this.ecParams = null;
        this.rng = new r.SecureRandom();
        /*
        For any additional curve definitions utilized by SM2, add another block like the below for that curve, then add the curve name to the Curve selection dropdown
        */
        r.crypto.ECParameterDB.regist(
            'sm2p256v1', // name / p = 2**256 - 2**224 - 2**96 + 2**64 - 1
            256,
            'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF', // p
            'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC', // a
            '28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93', // b
            'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123', // n
            '1', // h
            '32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7', // gx
            'BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0', // gy
            []
        ) // alias
        this.ecParams = r.crypto.ECParameterDB.getByName(curve);

        this.format = format;
    }

    /**
     * Set the public key coordinates for the SM2 class
     * 
     * @param {string} publicKeyX 
     * @param {string} publicKeyY 
     */
    setPublicKey(publicKeyX, publicKeyY) {
        /*
        * TODO: This needs some additional length validation; and checking for errors in the decoding process
        * TODO: Can probably support other public key encoding methods here as well in the future
        */
        this.publicKey = this.ecParams.curve.decodePointHex("04" + publicKeyX + publicKeyY);

        if (this.publicKey.isInfinity()) {
            throw new OperationError("Invalid Public Key");
        }
    }

    /**
     * Set the private key value for the SM2 class
     * 
     * @param {string} privateKey 
     */
    setPrivateKey(privateKeyHex) {
        this.privateKey = new r.BigInteger(privateKeyHex, 16);
    }
    
    /**
     * Main encryption function; takes user input, processes encryption and returns the result in hex (with the components arranged as configured by the user args)
     * 
     * @param {*} input 
     * @returns {string}
     */
    encrypt(input) {
        const G = this.ecParams.G

        /*
        * Compute a new, random public key along the same elliptic curve to form the starting point for our encryption process (record the resulting X and Y as hex to provide as part of the operation output)
        * k: Randomly generated BigInteger
        * c1: Result of dotting our curve generator point `G` with the value of `k`
        */
        var k = this.generatePublicKey();
        var c1 = G.multiply(k);
        const [hexC1X, hexC1Y] = this.getPointAsHex(c1);

        /*
        * Compute p2 (secret) using the public key, and the chosen k value above
        */
        const p2 = this.publicKey.multiply(k);

        /*
        * Compute the C3 SM3 hash before we transform the array
        */
        var c3 = this.c3(p2, input);

        /*
        * Genreate a proper length encryption key, XOR iteratively, and convert newly encrypted data to hex
        */
        var key = this.kdf(p2, input.byteLength);
        for (let i = 0; i < input.byteLength; i++) {
            input[i] ^= Utils.ord(key[i]);
        }
        var c2 = Buffer.from(input).toString('hex');

        /*
         * Check user input specs; order the output components as selected
         */
        if (this.format == "C1C3C2") {
            return hexC1X + hexC1Y + c3 + c2;
        } else {
            return hexC1X + hexC1Y + c2 + c3;
        }
    }
    /**
     * Function to decrypt an SM2 encrypted message
     * 
     * @param {*} input 
     */
    decrypt(input) {
        var c1X = input.slice(0, 64);
        var c1Y = input.slice(64, 128);

        var c3 = ""
        var c2 = ""

        if (this.format == "C1C3C2") {
            c3 = input.slice(128,192);
            c2 = input.slice(192);
        } else {
            c2 = input.slice(128, -64);
            c3 = input.slice(-64);
        }
        c2 = Uint8Array.from(fromHex(c2))
        var c1 = this.ecParams.curve.decodePointHex("04" + c1X + c1Y);

        /*
        * Compute the p2 (secret) value by taking the C1 point provided in the encrypted package, and multiplying by the private k value
        */
        var p2 = c1.multiply(this.privateKey);

        /*
         * Similar to encryption; compute sufficient length key material and XOR the input data to recover the original message
         */
        var key = this.kdf(p2, c2.byteLength);

        for (let i = 0; i < c2.byteLength; i++) {
            c2[i] ^= Utils.ord(key[i]);
        }

        var check = this.c3(p2, c2);
        if (check === c3) {
            return c2.buffer;
        } else {
            throw new OperationError("Decryption Error -- Computed Hashes Do Not Match");
        }
    }


    /**
     * Generates a large random number
     * 
     * @param {*} limit 
     * @returns 
     */
    getBigRandom(limit) {
        return new r.BigInteger(limit.bitLength(), this.rng)
	    .mod(limit.subtract(r.BigInteger.ONE))
	    .add(r.BigInteger.ONE);
    }

    /**
     * Helper function for generating a large random K number; utilized for generating our initial C1 point
     * TODO: Do we need to do any sort of validation on the resulting k values? 
     * 
     * @returns {BigInteger}
     */
    generatePublicKey() {
        const n = this.ecParams.n;
        var k = this.getBigRandom(n);
        return k;
    }

    /**
     * SM2 Key Derivation Function (KDF); Takes P2 point, and generates a key material stream large enough to encrypt all of the input data
     * 
     * @param {*} p2 
     * @param {*} len 
     * @returns {string}
     */
    kdf(p2, len) {
        const [hX, hY] = this.getPointAsHex(p2);

        var total = Math.ceil(len / 32) + 1;
        var cnt = 1;

        var keyMaterial = ""

        while (cnt < total) {
            var num = Utils.intToByteArray(cnt, 4, "big");
            var overall = fromHex(hX).concat(fromHex(hY)).concat(num)
            keyMaterial += this.sm3(overall);
            cnt++;
        }
        return keyMaterial
    }

    /**
     * Calculates the C3 component of our final encrypted payload; which is the SM3 hash of the P2 point and the original, unencrypted input data
     * 
     * @param {*} p2 
     * @param {*} input 
     * @returns {string} 
     */
    c3(p2, input) {
        const [hX, hY] = this.getPointAsHex(p2);

        var overall = fromHex(hX).concat(Array.from(input)).concat(fromHex(hY));

        return toHex(this.sm3(overall));

    }

    /**
     * SM3 setup helper function; takes input data as an array, processes the hash and returns the result
     * 
     * @param {*} data 
     * @returns {string}
     */
    sm3(data) {
        var hashData = Utils.arrayBufferToStr(Uint8Array.from(data).buffer, false);
        const hasher = new Sm3();
        hasher.update(hashData);
        return hasher.finalize();
    }

    /**
    * Utility function, returns an elliptic curve points X and Y values as hex;
    * 
    * @param {EcPointFp} point
    * @returns {[]}
    */
    getPointAsHex(point) {
        var biX = point.getX().toBigInteger();
        var biY = point.getY().toBigInteger();

        var charlen = this.ecParams.keycharlen;
        var hX   = ("0000000000" + biX.toString(16)).slice(- charlen);
        var hY   = ("0000000000" + biY.toString(16)).slice(- charlen);
        return [hX, hY]
    }
}