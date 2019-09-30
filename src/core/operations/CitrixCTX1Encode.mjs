/**
 * @author bwhitn [brian.m.whitney@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import cptable from "../vendor/js-codepage/cptable.js";

/**
 * Citrix CTX1 Encode operation
 */
class CitrixCTX1Encode extends Operation {

    /**
     * CitrixCTX1Encode constructor
     */
    constructor() {
        super();

        this.name = "Citrix CTX1 Encode";
        this.module = "Encodings";
        this.description = "Encodes strings to Citrix CTX1 password format.";
        this.infoURL = "https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const utf16pass = Array.from(cptable.utils.encode(1200, input));
        const result = [];
        let temp = 0;
        for (let i = 0; i < utf16pass.length; i++) {
            temp = utf16pass[i] ^ 0xa5 ^ temp;
            result.push(((temp >>> 4) & 0xf) + 0x41);
            result.push((temp & 0xf) + 0x41);
        }

        return result;
    }

}

export default CitrixCTX1Encode;
