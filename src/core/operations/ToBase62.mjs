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
        this.description = "Base62 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. The high number base results in shorter strings than with the decimal or hexadecimal system.";
        this.infoURL = "https://en.wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                name: "Alphabet",
                type: "string",
                value: "0-9A-Za-z"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.length < 1) return "";

        const ALPHABET = Utils.expandAlphRange(args[0]).join("");
        const BN = BigNumber.clone({ ALPHABET });

        input = toHexFast(input).toUpperCase();

        const number = new BN(input, 16);

        return number.toString(62);
    }

}

export default ToBase62;
