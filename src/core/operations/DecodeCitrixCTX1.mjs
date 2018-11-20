/**
 * @author bwhitn [brian.m.whitney@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import cptable from "../vendor/js-codepage/cptable.js";

/**
 * Encode Citrix CTX1 class
 */
class DecodeCitrixCTX1 extends Operation {

    /**
     * EncodeCitrixCTX1 constructor
     */
    constructor() {
        super();

        this.name = "Citrix CTX1 Decode";
        this.module = "Ciphers";
        this.description = "Decodes strings in a Citrix CTX1 password format to plaintext.";
        this.infoURL = "https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.length % 4 != 0) {
            return "";
        }
        let revinput = input.reverse();
        let result = [];
        let temp = 0;
        for (let i = 0; i < revinput.length; i+=2) {
            if (i+2 >= revinput.length) {
                temp = 0;
            } else {
                temp = ((revinput[i + 2] - 0x41) & 0xf) ^ (((revinput[i + 3]- 0x41) << 4) & 0xf0);
            }
            temp = (((revinput[i] - 0x41) & 0xf) ^ (((revinput[i + 1] - 0x41) << 4) & 0xf0)) ^ 0xa5 ^ temp;
            result.push(temp);
        }
        // Decodes a utf-16le string
        return cptable.utils.decode(1200, result.reverse());
    }

}

export default DecodeCitrixCTX1;
