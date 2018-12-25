/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import {runHash} from "../lib/Hash";

/**
 * SHA2 operation
 */
class SHA2 extends Operation {

    /**
     * SHA2 constructor
     */
    constructor() {
        super();

        this.name = "SHA2";
        this.module = "Crypto";
        this.description = "The SHA-2 (Secure Hash Algorithm 2) hash functions were designed by the NSA. SHA-2 includes significant changes from its predecessor, SHA-1. The SHA-2 family consists of hash functions with digests (hash values) that are 224, 256, 384 or 512 bits: SHA224, SHA256, SHA384, SHA512.<br><br><ul><li>SHA-512 operates on 64-bit words.</li><li>SHA-256 operates on 32-bit words.</li><li>SHA-384 is largely identical to SHA-512 but is truncated to 384 bytes.</li><li>SHA-224 is largely identical to SHA-256 but is truncated to 224 bytes.</li><li>SHA-512/224 and SHA-512/256 are truncated versions of SHA-512, but the initial values are generated using the method described in Federal Information Processing Standards (FIPS) PUB 180-4.</li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/SHA-2";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["512", "256", "384", "224", "512/256", "512/224"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const size = args[0];
        return runHash("sha" + size, input);
    }

}

export default SHA2;
