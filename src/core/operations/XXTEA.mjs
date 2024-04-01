/**
 * @author devcydo [devcydo@gmail.com]
 * @author Ma Bingyao [mabingyao@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {toBase64} from "../lib/Base64.mjs";
import Utils from "../Utils.mjs";

/**
 * XXTEA Encrypt operation
 */
class XXTEAEncrypt extends Operation {

    /**
     * XXTEAEncrypt constructor
     */
    constructor() {
        super();

        this.name = "XXTEA";
        this.module = "Default";
        this.description = "Corrected Block TEA (often referred to as XXTEA) is a block cipher designed to correct weaknesses in the original Block TEA. XXTEA operates on variable-length blocks that are some arbitrary multiple of 32 bits in size (minimum 64 bits). The number of full cycles depends on the block size, but there are at least six (rising to 32 for small block sizes). The original Block TEA applies the XTEA round function to each word in the block and combines it additively with its leftmost neighbour. Slow diffusion rate of the decryption process was immediately exploited to break the cipher. Corrected Block TEA uses a more involved round function which makes use of both immediate neighbours in processing each word in the block.";
        this.infoURL = "https://wikipedia.org/wiki/XXTEA";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "string",
                "value": "",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let key = args[0];

        if (input === undefined || input === null || input.length === 0) {
            throw new OperationError("Invalid input length (0)");
        }

        if (key === undefined || key === null || key.length === 0) {
            throw new OperationError("Invalid key length (0)");
        }

        input = Utils.convertToByteString(input, "utf8");
        key = Utils.convertToByteString(key, "utf8");

        input = this.convertToUint32Array(input, true);
        key = this.fixLength(this.convertToUint32Array(key, false));

        let encrypted = this.encryptUint32Array(input, key);

        encrypted = toBase64(this.toBinaryString(encrypted, false));

        return encrypted;
    }

    /**
     * Convert Uint32Array to binary string
     *
     * @param {Uint32Array} v
     * @param {Boolean} includeLength
     * @returns {string}
     */
    toBinaryString(v, includeLENGTH) {
        const LENGTH = v.length;
        let n = LENGTH << 2;
        if (includeLENGTH) {
            const M = v[LENGTH - 1];
            n -= 4;
            if ((M < n - 3) || (M > n)) {
                return null;
            }
            n = M;
        }
        for (let i = 0; i < LENGTH; i++) {
            v[i] = String.fromCharCode(
                v[i] & 0xFF,
                v[i] >>> 8 & 0xFF,
                v[i] >>> 16 & 0xFF,
                v[i] >>> 24 & 0xFF
            );
        }
        const RESULT = v.join("");
        if (includeLENGTH) {
            return RESULT.substring(0, n);
        }
        return RESULT;
    }

    /**
     * @param {number} sum
     * @param {number} y
     * @param {number} z
     * @param {number} p
     * @param {number} e
     * @param {number} k
     * @returns {number}
     */
    mx(sum, y, z, p, e, k) {
        return ((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[p & 3 ^ e] ^ z));
    }


    /**
     * Encrypt Uint32Array
     *
     * @param {Uint32Array} v
     * @param {number} k
     * @returns {Uint32Array}
     */
    encryptUint32Array(v, k) {
        const LENGTH = v.length;
        const N = LENGTH - 1;
        let y, z, sum, e, p, q;
        z = v[N];
        sum = 0;
        for (q = Math.floor(6 + 52 / LENGTH) | 0; q > 0; --q) {
            sum = (sum + 0x9E3779B9) & 0xFFFFFFFF;
            e = sum >>> 2 & 3;
            for (p = 0; p < N; ++p) {
                y = v[p + 1];
                z = v[p] = (v[p] + this.mx(sum, y, z, p, e, k)) & 0xFFFFFFFF;
            }
            y = v[0];
            z = v[N] = (v[N] + this.mx(sum, y, z, N, e, k)) & 0xFFFFFFFF;
        }
        return v;
    }

    /**
     * Fixes the Uint32Array lenght to 4
     *
     * @param {Uint32Array} k
     * @returns {Uint32Array}
     */
    fixLength(k) {
        if (k.length < 4) {
            k.length = 4;
        }
        return k;
    }

    /**
     * Convert string to Uint32Array
     *
     * @param {string} bs
     * @param {Boolean} includeLength
     * @returns {Uint32Array}
     */
    convertToUint32Array(bs, includeLength) {
        const LENGTH = bs.length;
        let n = LENGTH >> 2;
        if ((LENGTH & 3) !== 0) {
            ++n;
        }
        let v;
        if (includeLength) {
            v = new Array(n + 1);
            v[n] = LENGTH;
        } else {
            v = new Array(n);
        }
        for (let i = 0; i < LENGTH; ++i) {
            v[i >> 2] |= bs.charCodeAt(i) << ((i & 3) << 3);
        }
        return v;
    }

}

export default XXTEAEncrypt;
