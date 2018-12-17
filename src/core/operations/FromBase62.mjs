/**
 * @author tcode2k16 [tcode2k16@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import BigNumber from "bignumber.js";
import Utils from "../Utils";


/**
 * From Base62 operation
 */
class FromBase62 extends Operation {

    /**
     * FromBase62 constructor
     */
    constructor() {
        super();

        this.name = "From Base62";
        this.module = "Default";
        this.description = "decode base62 string";
        this.infoURL = "https://en.wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.length < 1) return "";
        const ALPHABET = Utils.expandAlphRange("0-9A-Za-z").join("");
        const BN = BigNumber.clone({ ALPHABET });

        const re = new RegExp("[^" + ALPHABET.replace(/[[\]\\\-^$]/g, "\\$&") + "]", "g");
        input = input.replace(re, "");

        const number = new BN(input, 62);

        return Utils.byteArrayToUtf8(Utils.convertToByteArray(number.toString(16), "Hex"));
    }

}

export default FromBase62;
