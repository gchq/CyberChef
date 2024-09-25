/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Rabbit operation
 */
class Rabbit extends Operation {

    /**
     * Rabbit constructor
     */
    constructor() {
        super();

        this.name = "Rabbit";
        this.module = "Ciphers";
        this.description = "Rabbit is a high-speed stream cipher introduced in 2003 and defined in RFC 4503.<br><br>The cipher uses a 128-bit key and an optional 64-bit initialization vector (IV).<br><br>big-endian: based on RFC4503 and RFC3447<br>little-endian: compatible with Crypto++";
        this.infoURL = "https://wikipedia.org/wiki/Rabbit_(cipher)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Endianness",
                "type": "option",
                "value": ["Big", "Little"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Raw", "Hex"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            endianness = args[2],
            inputType = args[3],
            outputType = args[4];

        const littleEndian = endianness === "Little";

        if (key.length !== 16) {
            throw new OperationError(`Invalid key length: ${key.length} bytes (expected: 16)`);
        }
        if (iv.length !== 0 && iv.length !== 8) {
            throw new OperationError(`Invalid IV length: ${iv.length} bytes (expected: 0 or 8)`);
        }

        // Inner State
        const X = new Uint32Array(8), C = new Uint32Array(8);
        let b = 0;

        // Counter System
        const A = [
            0x4d34d34d, 0xd34d34d3, 0x34d34d34, 0x4d34d34d,
            0xd34d34d3, 0x34d34d34, 0x4d34d34d, 0xd34d34d3
        ];
        const counterUpdate = function() {
            for (let j = 0; j < 8; j++) {
                const temp = C[j] + A[j] + b;
                b = (temp / ((1 << 30) * 4)) >>> 0;
                C[j] = temp;
            }
        };

        // Next-State Function
        const g = function(u, v) {
            const uv = (u + v) >>> 0;
            const upper = uv >>> 16, lower = uv & 0xffff;
            const upperUpper = upper * upper;
            const upperLower2 = 2 * upper * lower;
            const lowerLower = lower * lower;
            const mswTemp = upperUpper + ((upperLower2 / (1 << 16)) >>> 0);
            const lswTemp = lowerLower + (upperLower2 & 0xffff) * (1 << 16);
            const msw = mswTemp + ((lswTemp / ((1 << 30) * 4)) >>> 0);
            const lsw = lswTemp >>> 0;
            return lsw ^ msw;
        };
        const leftRotate = function(value, width) {
            return (value << width) | (value >>> (32 - width));
        };
        const nextStateHelper1 = function(v0, v1, v2) {
            return v0 + leftRotate(v1, 16) + leftRotate(v2, 16);
        };
        const nextStateHelper2 = function(v0, v1, v2) {
            return v0 + leftRotate(v1, 8) + v2;
        };
        const G = new Uint32Array(8);
        const nextState = function() {
            for (let j = 0; j < 8; j++) {
                G[j] = g(X[j], C[j]);
            }
            X[0] = nextStateHelper1(G[0], G[7], G[6]);
            X[1] = nextStateHelper2(G[1], G[0], G[7]);
            X[2] = nextStateHelper1(G[2], G[1], G[0]);
            X[3] = nextStateHelper2(G[3], G[2], G[1]);
            X[4] = nextStateHelper1(G[4], G[3], G[2]);
            X[5] = nextStateHelper2(G[5], G[4], G[3]);
            X[6] = nextStateHelper1(G[6], G[5], G[4]);
            X[7] = nextStateHelper2(G[7], G[6], G[5]);
        };

        // Key Setup Scheme
        const K = new Uint16Array(8);
        if (littleEndian) {
            for (let i = 0; i < 8; i++) {
                K[i] = (key[1 + 2 * i] << 8) | key[2 * i];
            }
        } else {
            for (let i = 0; i < 8; i++) {
                K[i] = (key[14 - 2 * i] << 8) | key[15 - 2 * i];
            }
        }
        for (let j = 0; j < 8; j++) {
            if (j % 2 === 0) {
                X[j] = (K[(j + 1) % 8] << 16) | K[j];
                C[j] = (K[(j + 4) % 8] << 16) | K[(j + 5) % 8];
            } else {
                X[j] = (K[(j + 5) % 8] << 16) | K[(j + 4) % 8];
                C[j] = (K[j] << 16) | K[(j + 1) % 8];
            }
        }
        for (let i = 0; i < 4; i++) {
            counterUpdate();
            nextState();
        }
        for (let j = 0; j < 8; j++) {
            C[j] = C[j] ^ X[(j + 4) % 8];
        }

        // IV Setup Scheme
        if (iv.length === 8) {
            const getIVValue = function(a, b, c, d) {
                if (littleEndian) {
                    return (iv[a] << 24) | (iv[b] << 16) |
                        (iv[c] << 8) | iv[d];
                } else {
                    return (iv[7 - a] << 24) | (iv[7 - b] << 16) |
                        (iv[7 - c] << 8) | iv[7 - d];
                }
            };
            C[0] = C[0] ^ getIVValue(3, 2, 1, 0);
            C[1] = C[1] ^ getIVValue(7, 6, 3, 2);
            C[2] = C[2] ^ getIVValue(7, 6, 5, 4);
            C[3] = C[3] ^ getIVValue(5, 4, 1, 0);
            C[4] = C[4] ^ getIVValue(3, 2, 1, 0);
            C[5] = C[5] ^ getIVValue(7, 6, 3, 2);
            C[6] = C[6] ^ getIVValue(7, 6, 5, 4);
            C[7] = C[7] ^ getIVValue(5, 4, 1, 0);
            for (let i = 0; i < 4; i++) {
                counterUpdate();
                nextState();
            }
        }

        // Extraction Scheme
        const S = new Uint8Array(16);
        const extract = function() {
            let pos = 0;
            const addPart = function(value) {
                S[pos++] = value >>> 8;
                S[pos++] = value & 0xff;
            };
            counterUpdate();
            nextState();
            addPart((X[6] >>> 16) ^ (X[1] & 0xffff));
            addPart((X[6] & 0xffff) ^ (X[3] >>> 16));
            addPart((X[4] >>> 16) ^ (X[7] & 0xffff));
            addPart((X[4] & 0xffff) ^ (X[1] >>> 16));
            addPart((X[2] >>> 16) ^ (X[5] & 0xffff));
            addPart((X[2] & 0xffff) ^ (X[7] >>> 16));
            addPart((X[0] >>> 16) ^ (X[3] & 0xffff));
            addPart((X[0] & 0xffff) ^ (X[5] >>> 16));
            if (littleEndian) {
                for (let i = 0, j = S.length - 1; i < j;) {
                    const temp = S[i];
                    S[i] = S[j];
                    S[j] = temp;
                    i++;
                    j--;
                }
            }
        };

        const data = Utils.convertToByteString(input, inputType);
        const result = new Uint8Array(data.length);
        for (let i = 0; i <= data.length - 16; i += 16) {
            extract();
            for (let j = 0; j < 16; j++) {
                result[i + j] = data.charCodeAt(i + j) ^ S[j];
            }
        }
        if (data.length % 16 !== 0) {
            const offset = data.length - data.length % 16;
            const length = data.length - offset;
            extract();
            if (littleEndian) {
                for (let j = 0; j < length; j++) {
                    result[offset + j] = data.charCodeAt(offset + j) ^ S[j];
                }
            } else {
                for (let j = 0; j < length; j++) {
                    result[offset + j] = data.charCodeAt(offset + j) ^ S[16 - length + j];
                }
            }
        }
        if (outputType === "Hex") {
            return toHexFast(result);
        }
        return Utils.byteArrayToChars(result);
    }

}

export default Rabbit;
