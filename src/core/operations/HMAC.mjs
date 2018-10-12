/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import CryptoApi from "crypto-api/src/crypto-api";

/**
 * HMAC operation
 */
class HMAC extends Operation {

    /**
     * HMAC constructor
     */
    constructor() {
        super();

        this.name = "HMAC";
        this.module = "Hashing";
        this.description = "Keyed-Hash Message Authentication Codes (HMAC) are a mechanism for message authentication using cryptographic hash functions.";
        this.infoURL = "https://wikipedia.org/wiki/HMAC";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "Decimal", "Base64", "UTF8", "Latin1"]
            },
            {
                "name": "Hashing function",
                "type": "option",
                "value": [
                    "MD2",
                    "MD4",
                    "MD5",
                    "SHA0",
                    "SHA1",
                    "SHA224",
                    "SHA256",
                    "SHA384",
                    "SHA512",
                    "SHA512/224",
                    "SHA512/256",
                    "RIPEMD128",
                    "RIPEMD160",
                    "RIPEMD256",
                    "RIPEMD320",
                    "HAS160",
                    "Whirlpool",
                    "Whirlpool-0",
                    "Whirlpool-T",
                    "Snefru"
                ]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string || "", args[0].option),
            hashFunc = args[1].toLowerCase(),
            msg = Utils.arrayBufferToStr(input, false),
            hasher = CryptoApi.getHasher(hashFunc);

        // Horrible shim to fix constructor bug. Reported in nf404/crypto-api#8
        hasher.reset = () => {
            hasher.state = {};
            const tmp = new hasher.constructor();
            hasher.state = tmp.state;
        };

        const mac = CryptoApi.getHmac(CryptoApi.encoder.fromUtf(key), hasher);
        mac.update(msg);
        return CryptoApi.encoder.toHex(mac.finalize());
    }

}

export default HMAC;
