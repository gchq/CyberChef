/**
 * @author tcode2k16 [tcode2k16@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import BigNumber from "bignumber.js";
import Utils from "../Utils";
import {toHexFast} from "../lib/Hex";

/**
 * To Base62 operation
 */
class ToBase62 extends Operation {

    /**
     * ToBase62 constructor
     */
    constructor() {
        super();

        this.name = "To Base62";
        this.module = "Default";
        this.description = "encode string to base62";
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

        input = Utils.strToByteArray(input);
        input = toHexFast(input);
        input = input.toUpperCase();

        const number = new BN(input, 16);

        return number.toString(62);
    }

}

export default ToBase62;
