/**
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromHex } from "../lib/Hex.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import Utils from "../Utils.mjs";
import Sm3 from "crypto-api/src/hasher/sm3.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
//import { ECCurveFp } from "jsrsasign";
import r from "jsrsasign";

/**
 * SM2 Encrypt operation
 */
class SM2Encrypt extends Operation {

    /**
     * SM2Encrypt constructor
     */
    constructor() {
        super();

        this.name = "SM2 Encrypt";
        this.module = "Ciphers";
        this.description = "Encrypts a message utilizing the SM2 standard";
        this.infoURL = ""; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "ArrayBuffer";
        this.outputType = "string";

        this.args = [
            {
                name: "Public Key X",
                type: "string",
                value: "DEADBEEF"
            },
            {
                name: "Public Key Y",
                type: "string",
                value: "DEADBEEF"
            },
            {
                "name": "Output Format",
                "type": "option",
                "value": ["C1C3C2", "C1C2C3"]
            },
            {
                name: "Curve",
                type: "option",
                "value": ["sm2p256v1"]
            }
        ];
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
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [privateKeyX, privateKeyY, outputFormat, curveName] = args;

        this.outputFormat = outputFormat;

        this.ecParams = r.crypto.ECParameterDB.getByName(curveName);

        this.publicKey = this.ecParams.curve.decodePointHex("04" + privateKeyX + privateKeyY);

        if (this.publicKey.isInfinity()) {
            throw new OperationError("Invalid Public Key");
        }

        var result = this.encrypt(new Uint8Array(input))

        return result
    }

    /**
     * Highlight SM2 Encrypt
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const [privateKeyX, privateKeyY, outputFormat, curveName] = args;
        var num = pos[0].end - pos[0].start
        var adjust = 128
        if (outputFormat == "C1C3C2") {
            adjust = 192
        }
        pos[0].start = Math.ceil(pos[0].start + adjust);
        pos[0].end = Math.floor(pos[0].end + adjust + num);
        return pos;
    }

    encrypt(input) {
        const n = this.ecParams.n
        const G = this.ecParams.G
        
        var k = this.generatePublicKey();
        var c1 = G.multiply(k);

        var bic1X = c1.getX().toBigInteger();
        var bic1Y = c1.getY().toBigInteger();

        var charlen = this.ecParams.keycharlen;
        var hexC1X   = ("0000000000" + bic1X.toString(16)).slice(- charlen);
        var hexC1Y   = ("0000000000" + bic1Y.toString(16)).slice(- charlen);

        const p2 = this.publicKey.multiply(k);

        var c3 = this.c3(p2, input);

        var key = this.kdf(p2, input.byteLength);

        for (let i = 0; i < input.byteLength; i++) {
            input[i] ^= Utils.ord(key[i]);
        }
        var c2 = Buffer.from(input).toString('hex');

        if (this.outputFormat == "C1C3C2") {
            return hexC1X + hexC1Y + c3 + c2;
        } else {
            return hexC1X + hexC1Y + c2 + c3;
        }
    }

    getBigRandom(limit) {
        return new r.BigInteger(limit.bitLength(), this.rng)
	    .mod(limit.subtract(r.BigInteger.ONE))
	    .add(r.BigInteger.ONE);
    }

    generatePublicKey() {
        const n = this.ecParams.n;
        var k = this.getBigRandom(n);
        return k;
    }

    kdf(p2, len) {
        var biX = p2.getX().toBigInteger();
        var biY = p2.getY().toBigInteger();

        var charlen = this.ecParams.keycharlen;
        var hX   = ("0000000000" + biX.toString(16)).slice(- charlen);
        var hY   = ("0000000000" + biY.toString(16)).slice(- charlen);

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

    c3(p2, input) {
        var biX = p2.getX().toBigInteger();
        var biY = p2.getY().toBigInteger();

        var charlen = this.ecParams.keycharlen;
        var hX   = ("0000000000" + biX.toString(16)).slice(- charlen);
        var hY   = ("0000000000" + biY.toString(16)).slice(- charlen);

        var overall = fromHex(hX).concat(Array.from(input)).concat(fromHex(hY));

        return toHex(this.sm3(overall));

    }

    sm3(data) {
        var hashData = Utils.arrayBufferToStr(Uint8Array.from(data).buffer, false);
        const hasher = new Sm3();
        hasher.update(hashData);
        return hasher.finalize();
    }

}

export default SM2Encrypt;
